import sys
import requests
import json
import threading
import time
from datetime import datetime
import random

# Configuration
BACKEND_URL = "http://localhost:8080"
LOGIN_ENDPOINT = f"{BACKEND_URL}/api/auth/login"
LOCATION_ENDPOINT = "/api/responder/location"
STATUS_ENDPOINT = "/api/responder/status"

# Simulation parameters
OPERATORS = []
THREADS = []
RUNNING = True

def load_operators(n):
    """Generate operator credentials for N operators."""
    operators = []
    for i in range(1, n + 1):
        operators.append({
            "id": i,
            "email": f"operator{i:03d}@sim.local",
            "password": "password",
            "token": None,
            "vehicle_id": None
        })
    return operators

def login_operator(operator):
    """Login operator and store token."""
    try:
        payload = {
            "email": operator["email"],
            "password": operator["password"]
        }
        response = requests.post(LOGIN_ENDPOINT, json=payload, timeout=5)
        if response.status_code == 200:
            data = response.json()
            operator["token"] = data.get("token")
            print(f"✓ Operator {operator['id']:03d} logged in: {operator['token'][:20]}...")
            return True
        else:
            print(f"✗ Operator {operator['id']:03d} login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Operator {operator['id']:03d} login error: {e}")
        return False

def get_all_tokens(operators):
    """Login all operators concurrently."""
    threads = []
    for op in operators:
        t = threading.Thread(target=login_operator, args=(op,))
        t.start()
        threads.append(t)
    
    for t in threads:
        t.join()
    
    success_count = sum(1 for op in operators if op["token"])
    print(f"\n✓ {success_count}/{len(operators)} operators logged in successfully\n")
    return [op for op in operators if op["token"]]

def vehicle_simulator(operator):
    """Simulate a vehicle for an operator (location updates, status changes)."""
    vehicle_id = operator["id"]
    token = operator["token"]
    
    # Initial location (Cairo area with small random offset)
    base_lat, base_lon = 30.0444, 31.2357
    lat = base_lat + random.uniform(-0.05, 0.05)
    lon = base_lon + random.uniform(-0.05, 0.05)
    
    status = "AVAILABLE"
    update_count = 0
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"[Vehicle {vehicle_id:03d}] Started simulation (token: {token[:15]}...)")
    
    while RUNNING:
        try:
            # Random walk: move vehicle slightly
            lat += random.uniform(-0.001, 0.001)
            lon += random.uniform(-0.001, 0.001)
            
            # Send location update
            location_payload = {
                "latitude": round(lat, 6),
                "longitude": round(lon, 6),
                "accuracy": random.uniform(50, 200),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            loc_response = requests.post(
                f"{BACKEND_URL}{LOCATION_ENDPOINT}",
                json=location_payload,
                headers=headers,
                timeout=5
            )
            
            if loc_response.status_code not in [200, 201]:
                print(f"[Vehicle {vehicle_id:03d}] Location update failed: {loc_response.status_code}")
            
            # Randomly change status sometimes
            # if update_count % 10 == 0 and random.random() > 0.7:
            #     new_status = random.choice(["AVAILABLE", "ON_DUTY", "UNAVAILABLE"])
            #     status_payload = {"status": new_status}
                
            #     status_response = requests.post(
            #         f"{BACKEND_URL}{STATUS_ENDPOINT}",
            #         json=status_payload,
            #         headers=headers,
            #         timeout=5
            #     )
                
            #     if status_response.status_code in [200, 201]:
            #         status = new_status
            #         print(f"[Vehicle {vehicle_id:03d}] Status updated to {status}")
            
            update_count += 1
            
            # Update every 5 seconds
            time.sleep(5)
            
        except Exception as e:
            print(f"[Vehicle {vehicle_id:03d}] Error: {e}")
            time.sleep(5)
    
    print(f"[Vehicle {vehicle_id:03d}] Simulation stopped after {update_count} updates")

def main():
    global RUNNING, OPERATORS, THREADS
    
    if len(sys.argv) != 2:
        print("Usage: python vehicle_simulator.py <N>")
        print("  N: number of operators to simulate")
        sys.exit(1)
    
    n = int(sys.argv[1])
    print(f"Starting vehicle simulator for {n} operators...\n")
    
    # Load operators
    OPERATORS = load_operators(n)
    print(f"Loaded {len(OPERATORS)} operators\n")
    
    # Login all operators
    print("Logging in operators...")
    active_operators = get_all_tokens(OPERATORS)
    
    if not active_operators:
        print("No operators logged in. Exiting.")
        sys.exit(1)
    
    # Start vehicle simulation threads
    print(f"Starting {len(active_operators)} vehicle simulation threads...\n")
    for op in active_operators:
        t = threading.Thread(target=vehicle_simulator, args=(op,), daemon=True)
        t.start()
        THREADS.append(t)
        time.sleep(0.1)  # Stagger thread starts
    
    # Keep main thread alive
    try:
        while RUNNING:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        RUNNING = False
        for t in THREADS:
            t.join(timeout=2)
        print("Simulator stopped.")

if __name__ == "__main__":
    main()