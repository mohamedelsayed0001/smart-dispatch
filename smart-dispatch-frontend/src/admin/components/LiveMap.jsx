import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import 'leaflet/dist/leaflet.css';
import '../styles/LiveMap.css';

const API_BASE = 'http://localhost:8080';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Incident type emojis
const INCIDENT_TYPE_EMOJIS = {
  FIRE: '🔥',
  MEDICAL: '🏥',
  ACCIDENT: '🚗',
  CRIME: '🚨',
  OTHER: '⚠️',
  EMERGENCY: '🆘',
  NATURAL_DISASTER: '🌪️',
  HAZMAT: '☢️'
};

// Vehicle type emojis
const VEHICLE_TYPE_EMOJIS = {
  AMBULANCE: '🚑',
  FIRETRUCK: '🚒',
  POLICE: '🚓',
  RESCUE: '🚐',
  OTHER: '🚙'
};

// Create custom incident marker
const createIncidentIcon = (type, status) => {
  const emoji = INCIDENT_TYPE_EMOJIS[type] || INCIDENT_TYPE_EMOJIS.OTHER;
  let bgColor = '#ef4444'; // red for pending
  if (status === 'ASSIGNED') bgColor = '#eab308'; // yellow for assigned
  else if (status === 'RESOLVED') bgColor = '#22c55e'; // green for resolved

  return L.divIcon({
    html: `
      <div class="map-marker-pin" style="--pin-color: ${bgColor};">
        <div class="map-marker-emoji">${emoji}</div>
        <div class="map-marker-shadow"></div>
      </div>
    `,
    className: 'custom-map-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

// Create custom vehicle marker
const createVehicleIcon = (type, status) => {
  const emoji = VEHICLE_TYPE_EMOJIS[type] || VEHICLE_TYPE_EMOJIS.OTHER;
  let bgColor = '#6b7280'; // gray for offline
  if (status === 'AVAILABLE') bgColor = '#22c55e'; // green
  else if (status === 'ON_ROUTE' || status === 'ONROUTE') bgColor = '#f59e0b'; // orange
  else if (status === 'RESOLVING' || status === 'BUSY') bgColor = '#ef4444'; // red

  return L.divIcon({
    html: `
      <div class="map-marker-pin" style="--pin-color: ${bgColor};">
        <div class="map-marker-emoji">${emoji}</div>
        <div class="map-marker-shadow"></div>
      </div>
    `,
    className: 'custom-map-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

// Floating detail window component
const DetailWindow = ({ item, type, onClose }) => {
  if (!item) return null;

  return (
    <div className="livemap-detail-window">
      <div className="livemap-detail-header">
        <h3>{type === 'incident' ? 'Incident Details' : 'Vehicle Details'}</h3>
        <button onClick={onClose} className="livemap-close-btn">×</button>
      </div>
      <div className="livemap-detail-content">
        {type === 'incident' ? (
          <>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Type:</span>
              <span className="livemap-detail-value">
                {INCIDENT_TYPE_EMOJIS[item.type] || '⚠️'} {item.type || 'N/A'}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Status:</span>
              <span className={`livemap-detail-value livemap-status-${item.status?.toLowerCase()}`}>
                {item.status || 'N/A'}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Severity:</span>
              <span className="livemap-detail-value">{item.severity || item.level || 'N/A'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Description:</span>
              <span className="livemap-detail-value">{item.description || 'No description'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Location:</span>
              <span className="livemap-detail-value">
                {item.latitude?.toFixed(6)}, {item.longitude?.toFixed(6)}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Reported:</span>
              <span className="livemap-detail-value">
                {item.reportedAt ? new Date(item.reportedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">ID:</span>
              <span className="livemap-detail-value">{item.id || item.vehicle_id || 'N/A'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Type:</span>
              <span className="livemap-detail-value">
                {VEHICLE_TYPE_EMOJIS[item.type] || '🚙'} {item.type || 'N/A'}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Status:</span>
              <span className={`livemap-detail-value livemap-status-${item.status?.toLowerCase()}`}>
                {item.status || 'N/A'}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Operator ID:</span>
              <span className="livemap-detail-value">{item.operatorId || 'N/A'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Capacity:</span>
              <span className="livemap-detail-value">{item.capacity || 'N/A'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Location:</span>
              <span className="livemap-detail-value">
                {item.latitude?.toFixed(6) || item.lat?.toFixed(6)},
                {item.longitude?.toFixed(6) || item.lng?.toFixed(6)}
              </span>
            </div>
            {item.assignedTo && (
              <div className="livemap-detail-row">
                <span className="livemap-detail-label">Assigned To:</span>
                <span className="livemap-detail-value">{item.assignedTo}</span>
              </div>
            )}
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Last Update:</span>
              <span className="livemap-detail-value">
                {item.timestamp ? new Date(item.timestamp).toLocaleString() : (item.lastUpdate ? new Date(item.lastUpdate).toLocaleString() : 'N/A')}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const LiveMap = () => {
  const [vehicles, setVehicles] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const stompClientRef = useRef(null);
  const mapRef = useRef(null);
  const notifiedIncidentsRef = useRef(new Set()); // Track which incidents we've notified about


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch vehicles
        const vehiclesRes = await fetch(`${API_BASE}/api/vehicle/getAllVehicles`, { headers });
        if (vehiclesRes.ok) {
          const vehiclesData = await vehiclesRes.json();
          setVehicles(vehiclesData || []);
        }

        // Fetch incidents (pending or assigned)
        const incidentsRes = await fetch(`${API_BASE}/api/admin/reports`, { headers });
        if (incidentsRes.ok) {
          const incidentsData = await incidentsRes.json();
          // Filter for pending or assigned incidents
          const activeIncidents = (incidentsData || []).filter(
            inc => inc.status === 'PENDING' || inc.status === 'ASSIGNED'
          );
          setIncidents(activeIncidents);
        }

        // Fetch live locations from Redis
        const locationsRes = await fetch(`${API_BASE}/api/location/live/all`, { headers });
        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          if (locationsData && typeof locationsData === 'object' && !locationsData.message) {
            // Convert locations format: vehicleId -> "lng,lat"
            const formattedLocations = {};
            Object.entries(locationsData).forEach(([vehicleId, coords]) => {
              const [lng, lat] = coords.split(',').map(Number);
              formattedLocations[vehicleId] = { lat, lng };
            });
            setLiveLocations(formattedLocations);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Setup WebSocket connections
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (str) => console.log('[WebSocket]', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ WebSocket connected');

      // Subscribe to vehicle updates (VehicleUpdateDto: vehicleId, newStatus, latitude, longitude)
      client.subscribe('/topic/vehicle/update', (message) => {
        try {
          const updateDto = JSON.parse(message.body);
          console.log('🚗 Vehicle update:', updateDto);

          setVehicles(prev => {
            const index = prev.findIndex(v => v.id === updateDto.vehicleId);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                status: updateDto.newStatus,
                latitude: updateDto.latitude,
                longitude: updateDto.longitude,
                lastUpdate: new Date().toISOString()
              };
              return updated;
            }
            // Vehicle doesn't exist, don't add incomplete vehicle
            return prev;
          });

          // Also update live locations
          if (updateDto.vehicleId && updateDto.latitude && updateDto.longitude) {
            setLiveLocations(prev => ({
              ...prev,
              [updateDto.vehicleId]: {
                lat: updateDto.latitude,
                lng: updateDto.longitude,
                timestamp: new Date().toISOString()
              }
            }));
          }
        } catch (e) {
          console.error('Error parsing vehicle update:', e);
        }
      });

      // Subscribe to incident updates
      client.subscribe('/topic/incident/update', (message) => {
        try {
          const incident = JSON.parse(message.body);
          console.log('🚨 Incident update:', incident);

          // Only add notification if this is a new incident we haven't notified about
          const isNewIncident = !notifiedIncidentsRef.current.has(incident.id);
          if (isNewIncident && (incident.status === 'PENDING' || incident.status === 'ASSIGNED')) {
            notifiedIncidentsRef.current.add(incident.id);
            addNotification('incident', 1);
          }

          setIncidents(prev => {
            const index = prev.findIndex(i => i.id === incident.id);
            // Only show pending or assigned incidents
            if (incident.status !== 'PENDING' && incident.status !== 'ASSIGNED') {
              // Remove if resolved
              if (index >= 0) {
                return prev.filter(i => i.id !== incident.id);
              }
              return prev;
            }

            if (index >= 0) {
              const updated = [...prev];
              updated[index] = { ...updated[index], ...incident };
              return updated;
            }
            return [...prev, incident];
          });
        } catch (e) {
          console.error('Error parsing incident update:', e);
        }
      });

      // Subscribe to assignment updates (AssignmentUpdateDto: responderId, assignmentId, response)
      client.subscribe('/topic/assignment/update', (message) => {
        try {
          const updateDto = JSON.parse(message.body);
          console.log('📋 Assignment update:', updateDto);

          // Add notification for assignment response (ACCEPTED, REJECTED, CANCELED)
          addNotification('assignment', 1);

          // Note: This DTO only contains responderId, assignmentId, and response
          // The actual vehicle/incident status updates come through /topic/vehicle/update
          // and /topic/incident/update channels
        } catch (e) {
          console.error('Error parsing assignment update:', e);
        }
      });

      // Note: /topic/locations/all is currently commented out in LocationTrackService.java
      // Location updates come through /topic/vehicle/update (VehicleUpdateDto) instead

      // Subscribe to reports topic (new incidents)
      client.subscribe('/topic/reports', (message) => {
        try {
          const report = JSON.parse(message.body);
          console.log('📝 New report:', report);
          if (report.status === 'PENDING' || report.status === 'ASSIGNED') {
            setIncidents(prev => {
              const exists = prev.some(i => i.id === report.id);
              if (!exists) {
                // Only add notification if we haven't notified about this incident yet
                if (!notifiedIncidentsRef.current.has(report.id)) {
                  notifiedIncidentsRef.current.add(report.id);
                  addNotification('incident', 1);
                }
              }
              if (exists) return prev;
              return [...prev, report];
            });
          }
        } catch (e) {
          console.error('Error parsing report:', e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
    };

    client.onWebSocketClose = () => {
      console.log('🔌 WebSocket closed');
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  // Notification management
  const addNotification = (type, count = 1) => {
    setNotifications(prev => {
      const existing = prev.find(n => n.type === type);
      if (existing) {
        return prev.map(n =>
          n.type === type
            ? { ...n, count: n.count + count, timestamp: Date.now() }
            : n
        );
      }
      return [...prev, { type, count, timestamp: Date.now(), id: Date.now() }];
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => Date.now() - n.timestamp > 5000 ? false : true));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Calculate bounds for all markers
  const allBounds = [];

  // Add incident locations
  incidents.forEach(incident => {
    if (incident.latitude && incident.longitude) {
      allBounds.push([incident.latitude, incident.longitude]);
    }
  });

  // Add vehicle locations (prefer live locations, fallback to vehicle data)
  vehicles.forEach(vehicle => {
    const liveLocation = liveLocations[vehicle.id];
    if (liveLocation && liveLocation.lat && liveLocation.lng) {
      allBounds.push([liveLocation.lat, liveLocation.lng]);
    } else if (vehicle.latitude && vehicle.longitude) {
      allBounds.push([vehicle.latitude, vehicle.longitude]);
    }
  });

  const handleMarkerClick = (id, type) => {
    if (type === 'vehicle') {
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        const liveLocation = liveLocations[vehicle.id];
        const vehicleData = {
          ...vehicle,
          latitude: liveLocation?.lat || vehicle.latitude,
          longitude: liveLocation?.lng || vehicle.longitude,
          timestamp: liveLocation?.timestamp || vehicle.lastUpdate
        };
        setSelectedItem(vehicleData);
        setSelectedType('vehicle');
      }
    } else if (type === 'incident') {
      const incident = incidents.find(i => i.id === id);
      if (incident) {
        setSelectedItem(incident);
        setSelectedType('incident');
      }
    }
  };

  const closeDetailWindow = () => {
    setSelectedItem(null);
    setSelectedType(null);
  };

  if (loading) {
    return (
      <div className="live-map-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading live map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-map-container">
      <div className="map-wrapper">
        {/* Controls and Legend Combined */}
        <div className="livemap-controls-panel">
          <div className="livemap-control-section">
            <h4 className="livemap-control-section-title">Display Options</h4>
            <label className="livemap-control-label">
              <input
                type="checkbox"
                checked={showIncidents}
                onChange={(e) => setShowIncidents(e.target.checked)}
              />
              <span className="livemap-control-text">
                <span className="livemap-control-icon">🚨</span>
                Show Incidents ({incidents.length})
              </span>
            </label>
            <label className="livemap-control-label">
              <input
                type="checkbox"
                checked={showVehicles}
                onChange={(e) => setShowVehicles(e.target.checked)}
              />
              <span className="livemap-control-text">
                <span className="livemap-control-icon">🚗</span>
                Show Vehicles ({vehicles.length})
              </span>
            </label>
          </div>

          <div className="livemap-legend-section">
            <h4 className="livemap-control-section-title">Legend</h4>
            <div className="livemap-legend-items-compact">
              <div className="livemap-legend-item-compact">
                <span className="livemap-legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                <span>Pending</span>
              </div>
              <div className="livemap-legend-item-compact">
                <span className="livemap-legend-dot" style={{ backgroundColor: '#eab308' }}></span>
                <span>Assigned</span>
              </div>
              <div className="livemap-legend-item-compact">
                <span className="livemap-legend-dot" style={{ backgroundColor: '#22c55e' }}></span>
                <span>Available</span>
              </div>
              <div className="livemap-legend-item-compact">
                <span className="livemap-legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                <span>On Route</span>
              </div>
              <div className="livemap-legend-item-compact">
                <span className="livemap-legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                <span>Resolving</span>
              </div>
            </div>
          </div>
        </div>
        <MapContainer
          center={[30.0444, 31.2357]} // Cairo, Egypt
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {/* Render incidents */}
          {showIncidents && incidents.map((incident) => {
            if (!incident.latitude || !incident.longitude) return null;

            return (
              <Marker
                key={`incident-${incident.id}`}
                position={[incident.latitude, incident.longitude]}
                icon={createIncidentIcon(incident.type, incident.status)}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    handleMarkerClick(incident.id, 'incident');
                  }
                }}
              >
              </Marker>
            );
          })}


          {/* Render vehicles */}
          {showVehicles && vehicles.map((vehicle) => {
            // Use live location if available, otherwise use vehicle's stored location
            const liveLocation = liveLocations[vehicle.id];
            const lat = liveLocation?.lat || vehicle.latitude;
            const lng = liveLocation?.lng || vehicle.longitude;

            if (!lat || !lng) return null;

            // Merge vehicle data with live location
            const vehicleData = {
              ...vehicle,
              latitude: lat,
              longitude: lng,
              timestamp: liveLocation?.timestamp || vehicle.lastUpdate
            };

            return (
              <Marker
                key={`vehicle-${vehicle.id}`}
                position={[lat, lng]}
                icon={createVehicleIcon(vehicle.type, vehicle.status)}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    handleMarkerClick(vehicle.id, 'vehicle');
                  }
                }}
              >
              </Marker>
            );
          })}
        </MapContainer>


        {selectedItem && (
          <DetailWindow
            item={selectedItem}
            type={selectedType}
            onClose={closeDetailWindow}
          />
        )}

      </div>
    </div>
  );
};

export default LiveMap;
