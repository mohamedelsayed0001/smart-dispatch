import sys
import requests
import json
import threading
import time
from datetime import datetime
import random
import logging
import websocket
import queue

# Configuration
BACKEND_URL = "http://localhost:8080"
LOGIN_ENDPOINT = f"{BACKEND_URL}/api/auth/login"
PROFILE_ENDPOINT = f"{BACKEND_URL}/api/responder/info"
OSRM_ENDPOINT = "https://router.project-osrm.org/route/v1/driving"

# WebSocket configuration
WS_URL = "ws://localhost:8080/ws-raw"

# Cairo boundaries
LAT_MAX = 30.175387750587074
LAT_MIN = 29.775256780776914
LON_MAX = 31.5624047385323
LON_MIN = 30.996555009635973

RESOLVING_TIME = 10

# OSRM Rate Limiting
OSRM_REQUEST_QUEUE = queue.Queue()
OSRM_RESULT_DICT = {}
OSRM_EVENT_DICT = {}
OSRM_RESULT_LOCK = threading.Lock()
OSRM_REQUEST_DELAY = 0.5
OSRM_TIMEOUT = 15

# Simulation parameters
OPERATORS = []
THREADS = []
RUNNING = True
UPDATE_INTERVAL = 1

# Suppress debug logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def osrm_queue_processor():
    """Background thread that processes OSRM route requests with rate limiting."""
    logger.info("OSRM queue processor started")
    while RUNNING:
        try:
            request_data = OSRM_REQUEST_QUEUE.get(timeout=1)
            if request_data is None:
                break
            
            request_id, start_lon, start_lat, end_lon, end_lat = request_data

            result = None
            try:
                url = f"{OSRM_ENDPOINT}/{start_lon},{start_lat};{end_lon},{end_lat}?overview=full&geometries=geojson"
                logger.info(f"OSRM request for {request_id}")
                
                response = requests.get(url, timeout=OSRM_TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("routes") and len(data["routes"]) > 0:
                        coords = data["routes"][0]["geometry"]["coordinates"]
                        result = [(coord[1], coord[0]) for coord in coords]
                        logger.info(f"OSRM request successful for {request_id}")
                else:
                    logger.warning(f"OSRM returned status {response.status_code} for {request_id}")
                    
            except requests.exceptions.Timeout:
                logger.error(f"OSRM timeout for {request_id}")
            except requests.exceptions.ConnectionError as e:
                logger.error(f"OSRM connection error for {request_id}: {e}")
            except Exception as e:
                logger.error(f"OSRM request error for {request_id}: {e}")
            
            with OSRM_RESULT_LOCK:
                OSRM_RESULT_DICT[request_id] = result
                if request_id in OSRM_EVENT_DICT:
                    OSRM_EVENT_DICT[request_id].set()
            
            time.sleep(OSRM_REQUEST_DELAY)
            
        except queue.Empty:
            continue
        except Exception as e:
            logger.error(f"Queue processor error: {e}")
    
    logger.info("OSRM queue processor stopped")

class StompWSClient:
    """A minimal STOMP over WebSocket client."""
    def __init__(self, url, headers=None, on_message=None):
        self.url = url
        self.headers = headers or {}
        self.on_message_callback = on_message
        self.ws = None
        self.connected = False
        
    def connect(self):
        self.ws = websocket.WebSocketApp(
            self.url,
            on_open=self._on_open,
            on_message=self._on_message,
            on_error=self._on_error,
            on_close=self._on_close
        )
        self.wst = threading.Thread(target=self.ws.run_forever)
        self.wst.daemon = True
        self.wst.start()
        
        # Wait for connection
        timeout = 5
        start_time = time.time()
        while not self.connected and time.time() - start_time < timeout:
            time.sleep(0.1)
        return self.connected

    def _on_open(self, ws):
        # Send STOMP CONNECT frame
        headers = {
            "accept-version": "1.1,1.2",
            "heart-beat": "10000,10000"
        }
        headers.update(self.headers)
        self.send_frame("CONNECT", headers)

    def _on_message(self, ws, message):
        if message == "\n": return # Heartbeat
        
        parts = message.split("\n\n", 1)
        header_part = parts[0]
        body = parts[1].strip("\x00") if len(parts) > 1 else ""
        
        lines = header_part.split("\n")
        command = lines[0].strip()
        if not command: return
        
        headers = {}
        for line in lines[1:]:
            if ":" in line:
                k, v = line.split(":", 1)
                headers[k.strip()] = v.strip()
        
        if command == "CONNECTED":
            self.connected = True
            logger.debug("STOMP Connected")
        elif command == "MESSAGE":
            if self.on_message_callback:
                self.on_message_callback(headers, body)

    def _on_error(self, ws, error):
        logger.error(f"WebSocket Error: {error}")

    def _on_close(self, ws, close_status_code, close_msg):
        self.connected = False
        logger.info("WebSocket Closed")

    def send_frame(self, command, headers=None, body=""):
        frame = f"{command}\n"
        if headers:
            for k, v in headers.items():
                frame += f"{k}:{v}\n"
        frame += "\n" + body + "\x00"
        self.ws.send(frame)

    def subscribe(self, destination, sub_id):
        self.send_frame("SUBSCRIBE", {"destination": destination, "id": sub_id, "ack": "auto"})

    def disconnect(self):
        if self.ws:
            self.ws.close()

class VehicleSimulator:
    def __init__(self, operator):
        self.operator = operator
        self.responder_id = operator["id"]
        v_info = operator.get("assignedVehicle", {})
        
        if not v_info:
            print(f"[Responder {self.responder_id:03d}] Error: No vehicle assigned!")
            self.vehicle_id = None
        else:
            self.vehicle_id = v_info.get("id")
            
        self.token = operator["token"]
        self.current_lat = v_info.get("currentLatitude")
        self.current_lon = v_info.get("currentLongitude")
        self.status = v_info.get("status")
        self.current_assignment = None
        
        self.route_points = []
        self.route_index = 0
        self.stomp = None
        self.running = True
        
    def connect_websocket(self):
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.stomp = StompWSClient(WS_URL, headers=headers, on_message=self.on_stomp_message)
            
            if self.stomp.connect():
                destination = f'/topic/assignment/new/{self.responder_id}'
                self.stomp.subscribe(destination, f'sub-{self.responder_id}')
                print(f"[Vehicle {self.vehicle_id:03d}] WebSocket connected and subscribed to {destination}")
                return True
            return False
        except Exception as e:
            print(f"[Vehicle {self.vehicle_id:03d}] WebSocket connection error: {e}")
            return False
    
    def on_stomp_message(self, headers, body):
        try:
            message = json.loads(body)
            print(f"[Vehicle {self.vehicle_id:03d}] Received assignment message")

            if self.current_assignment is not None:
                print(f"[Vehicle {self.vehicle_id:03d}] Busy. Ignored assignment {message.get('id')}")
                return
            
            if not self.current_assignment:
                self.current_assignment = message
                assignment_id = message.get("id")
                incident_id = message.get("incidentId")
                print(f"[Vehicle {self.vehicle_id:03d}] Accepted assignment #{assignment_id}")
                
                self.update_status(assignment_id, vehicle_status="ONROUTE", assignment_status="ACTIVE", incident_status="ASSIGNED")
                
                incident_details = self.get_incident_details(incident_id)
                if incident_details:
                    incident_lat = incident_details.get("latitude")
                    incident_lon = incident_details.get("longitude")
                
                if incident_lat and incident_lon:
                    route = self.get_route(self.current_lon, self.current_lat, incident_lon, incident_lat)
                    if route:
                        self.route_points = route
                        self.route_index = 0
                        print(f"[Vehicle {self.vehicle_id:03d}] Route calculated: {len(route)} points")
                    else:
                        print(f"[Vehicle {self.vehicle_id:03d}] Failed to calculate route")
                else:
                    print(f"[Vehicle {self.vehicle_id:03d}] Error: Missing incident coordinates")
        except Exception as e:
            print(f"[Vehicle {self.vehicle_id:03d}] Message handling error: {e}")

    def get_incident_details(self, incident_id):
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            url = f"{BACKEND_URL}/api/responder/incidents/{incident_id}"
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"[Vehicle {self.vehicle_id:03d}] Error fetching incident {incident_id}: {e}")
            return None

    def get_route(self, start_lon, start_lat, end_lon, end_lat):
        print(f"[Vehicle {self.vehicle_id:03d}] Calculating route from {start_lon},{start_lat} to {end_lon},{end_lat}")
        
        request_id = f"{self.vehicle_id}_{time.time()}"
        event = threading.Event()
        
        with OSRM_RESULT_LOCK:
            OSRM_EVENT_DICT[request_id] = event
        
        OSRM_REQUEST_QUEUE.put((request_id, start_lon, start_lat, end_lon, end_lat))
        print(f"[Vehicle {self.vehicle_id:03d}] Route request queued, waiting for response...")
        
        event.wait()
        with OSRM_RESULT_LOCK:
            result = OSRM_RESULT_DICT.pop(request_id, None)
            OSRM_EVENT_DICT.pop(request_id, None)
            
        if result:
            print(f"[Vehicle {self.vehicle_id:03d}] Route received successfully")
        else:
            print(f"[Vehicle {self.vehicle_id:03d}] Route request failed")
        return result
    
    def update_location(self, lat, lon):
        try:
            headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
            payload = {
                "vehicleId": self.vehicle_id,
                "newStatus": self.status,
                "latitude": round(lat, 8),
                "longitude": round(lon, 8)
            }
            requests.post(f"{BACKEND_URL}/api/responder/location", json=payload, headers=headers, timeout=5)
        except: pass
    
    def update_status(self, assignment_id, vehicle_status=None, assignment_status=None, incident_status=None):
        try:
            headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
            payload = {}
            if vehicle_status: payload["vehicleStatus"] = vehicle_status; self.status = vehicle_status
            if assignment_status: payload["assignmentStatus"] = assignment_status
            if incident_status: payload["incidentStatus"] = incident_status
            
            response = requests.put(f"{BACKEND_URL}/api/responder/assignments/{assignment_id}/status", 
                                  json=payload, headers=headers, timeout=5)
            return response.status_code in [200, 201]
        except: return False
    
    def run(self):
        if not self.vehicle_id or not self.connect_websocket():
            return
        
        print(f"[Vehicle {self.vehicle_id:03d}] Started simulation")
        try:
            while self.running and RUNNING:
                # STATE 1: Moving to Incident
                if self.current_assignment and self.route_points:
                    assignment_id = self.current_assignment.get("id")
                    
                    if self.route_index < len(self.route_points):
                        # Move to next point
                        point = self.route_points[self.route_index]
                        self.current_lat, self.current_lon = point
                        self.route_index += 5
                        self.update_location(self.current_lat, self.current_lon)
                    else:
                        # STATE 2: Arrived and Resolving
                        # Ensure we hit the exact final coordinate
                        final_point = self.route_points[-1]
                        self.current_lat, self.current_lon = final_point
                        self.update_location(self.current_lat, self.current_lon)
                        
                        print(f"[Vehicle {self.vehicle_id:03d}] Reached site. Resolving...")
                        self.update_status(assignment_id, vehicle_status="RESOLVING")
                        
                        time.sleep(RESOLVING_TIME)
                        
                        self.current_assignment = None
                        self.route_points = []
                        self.route_index = 0
                        # STATE 3: Completion and Cleanup
                        self.update_status(
                            assignment_id, 
                            vehicle_status="AVAILABLE", 
                            assignment_status="COMPLETED", 
                            incident_status="RESOLVED"
                        )
                        print(f"[Vehicle {self.vehicle_id:03d}] Assignment complete. Standing by.")
                
                # If no assignment, the loop just sleeps and waits for the WS callback
                time.sleep(UPDATE_INTERVAL)
                
        except Exception as e:
            logger.error(f"[Vehicle {self.vehicle_id:03d}] Simulation loop crashed: {e}", exc_info=True)
        finally:
            if self.stomp: self.stomp.disconnect()

def load_operators(n):
    return [{"id": i, "email": f"operator{i:03d}@sim.local", "password": "password", "token": None} for i in range(1, n + 1)]

def login_and_get_profile(operator):
    try:
        payload = {"email": operator["email"], "password": operator["password"]}
        response = requests.post(LOGIN_ENDPOINT, json=payload, timeout=5)
        if response.status_code == 200:
            token = response.json().get("token")
            operator["token"] = token
            profile = requests.get(PROFILE_ENDPOINT, headers={"Authorization": f"Bearer {token}"}, timeout=5)
            if profile.status_code == 200:
                operator.update(profile.json())
                print(f"✓ Operator {operator['email']} ready")
                return True
        return False
    except: return False

def main():
    global RUNNING
    if len(sys.argv) != 2: sys.exit(1)
    n = int(sys.argv[1])
    operators = load_operators(n)
    
    # Start OSRM queue processor
    osrm_thread = threading.Thread(target=osrm_queue_processor, daemon=True)
    osrm_thread.start()
    print("✓ OSRM rate limiter started\n")
    
    threads = []
    for op in operators:
        t = threading.Thread(target=login_and_get_profile, args=(op,))
        t.start(); threads.append(t)
    for t in threads: t.join()
    
    active = [op for op in operators if op.get("token")]
    print(f"\n✓ {len(active)} operators ready\n")
    
    for op in active:
        simulator = VehicleSimulator(op)
        threading.Thread(target=simulator.run, daemon=True).start()
        time.sleep(0.1)
    
    try:
        while RUNNING: time.sleep(1)
    except KeyboardInterrupt:
        RUNNING = False
        time.sleep(1)

if __name__ == "__main__":
    main()