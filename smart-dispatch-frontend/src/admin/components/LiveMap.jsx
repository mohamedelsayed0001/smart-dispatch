import { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import 'leaflet/dist/leaflet.css';
import '../styles/LiveMap.css';

import DetailWindow from './DetailWindow';

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

// Cache for icons to avoid recreating them
const iconCache = new Map();

// Create custom incident marker with caching
const createIncidentIcon = (type, status) => {
  const cacheKey = `incident-${type}-${status}`;
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }

  const emoji = INCIDENT_TYPE_EMOJIS[type] || INCIDENT_TYPE_EMOJIS.OTHER;
  let bgColor = '#ef4444'; // red for pending
  if (status === 'ASSIGNED') bgColor = '#eab308'; // yellow for assigned
  else if (status === 'RESOLVED') bgColor = '#22c55e'; // green for resolved

  const icon = L.divIcon({
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

  iconCache.set(cacheKey, icon);
  return icon;
};

// Create custom vehicle marker with caching
const createVehicleIcon = (type, status) => {
  const cacheKey = `vehicle-${type}-${status}`;
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }

  const emoji = VEHICLE_TYPE_EMOJIS[type] || VEHICLE_TYPE_EMOJIS.OTHER;
  let bgColor = '#6b7280'; // gray for offline
  if (status === 'AVAILABLE') bgColor = '#22c55e'; // green
  else if (status === 'ON_ROUTE' || status === 'ONROUTE') bgColor = '#f59e0b'; // orange
  else if (status === 'RESOLVING' || status === 'BUSY') bgColor = '#60a5fa'; // light blue

  const icon = L.divIcon({
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

  iconCache.set(cacheKey, icon);
  return icon;
};

// Memoized Incident Marker component
const IncidentMarker = memo(({ incident, onMarkerClick }) => {
  if (!incident.latitude || !incident.longitude) return null;

  const handleClick = useCallback((e) => {
    L.DomEvent.stopPropagation(e);
    onMarkerClick(incident.id, 'incident');
  }, [incident.id, onMarkerClick]);

  return (
    <Marker
      key={`incident-${incident.id}`}
      position={[incident.latitude, incident.longitude]}
      icon={createIncidentIcon(incident.type, incident.status)}
      eventHandlers={{ click: handleClick }}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if these properties change
  return (
    prevProps.incident.id === nextProps.incident.id &&
    prevProps.incident.latitude === nextProps.incident.latitude &&
    prevProps.incident.longitude === nextProps.incident.longitude &&
    prevProps.incident.type === nextProps.incident.type &&
    prevProps.incident.status === nextProps.incident.status
  );
});

// Memoized Vehicle Marker component
const VehicleMarker = memo(({ vehicle, liveLocation, onMarkerClick }) => {
  const lat = liveLocation?.lat || vehicle.latitude;
  const lng = liveLocation?.lng || vehicle.longitude;

  if (!lat || !lng) return null;

  const handleClick = useCallback((e) => {
    L.DomEvent.stopPropagation(e);
    onMarkerClick(vehicle.id, 'vehicle');
  }, [vehicle.id, onMarkerClick]);

  return (
    <Marker
      key={`vehicle-${vehicle.id}`}
      position={[lat, lng]}
      icon={createVehicleIcon(vehicle.type, vehicle.status)}
      eventHandlers={{ click: handleClick }}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if these properties change
  const prevLat = prevProps.liveLocation?.lat || prevProps.vehicle.latitude;
  const prevLng = prevProps.liveLocation?.lng || prevProps.vehicle.longitude;
  const nextLat = nextProps.liveLocation?.lat || nextProps.vehicle.latitude;
  const nextLng = nextProps.liveLocation?.lng || nextProps.vehicle.longitude;

  return (
    prevProps.vehicle.id === nextProps.vehicle.id &&
    prevLat === nextLat &&
    prevLng === nextLng &&
    prevProps.vehicle.type === nextProps.vehicle.type &&
    prevProps.vehicle.status === nextProps.vehicle.status
  );
});

// Throttle helper function
const throttle = (func, delay) => {
  let timeoutId = null;
  let lastArgs = null;

  const throttled = (...args) => {
    lastArgs = args;
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        func(...lastArgs);
        timeoutId = null;
        lastArgs = null;
      }, delay);
    }
  };

  return throttled;
};

const LiveMap = ({vehicles, setVehicles}) => {
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
  const notifiedIncidentsRef = useRef(new Set());
  const vehicleUpdateQueueRef = useRef({});
  const incidentUpdateQueueRef = useRef({});
  const updateTimerRef = useRef(null);

  // Throttled batch update for vehicles and incidents
  const flushUpdates = useCallback(() => {
    const vehicleQueue = vehicleUpdateQueueRef.current;
    const incidentQueue = incidentUpdateQueueRef.current;

    if (Object.keys(vehicleQueue).length > 0) {
      setVehicles(prev => {
        const updated = [...prev];
        Object.values(vehicleQueue).forEach(updateDto => {
          const index = updated.findIndex(v => v.id === updateDto.vehicleId);
          if (index >= 0) {
            updated[index] = {
              ...updated[index],
              status: updateDto.newStatus,
              latitude: updateDto.latitude,
              longitude: updateDto.longitude,
              lastUpdate: new Date().toISOString()
            };
          }
        });
        return updated;
      });

      const locationUpdates = {};
      Object.values(vehicleQueue).forEach(updateDto => {
        if (updateDto.vehicleId && updateDto.latitude && updateDto.longitude) {
          locationUpdates[updateDto.vehicleId] = {
            lat: updateDto.latitude,
            lng: updateDto.longitude,
            timestamp: new Date().toISOString()
          };
        }
      });
      if (Object.keys(locationUpdates).length > 0) {
        setLiveLocations(prev => ({ ...prev, ...locationUpdates }));
      }

      vehicleUpdateQueueRef.current = {};
    }

    if (Object.keys(incidentQueue).length > 0) {
      setIncidents(prev => {
        let updated = [...prev];
        Object.values(incidentQueue).forEach(incident => {
          const index = updated.findIndex(i => i.id === incident.id);
          if (incident.status !== 'PENDING' && incident.status !== 'ASSIGNED') {
            if (index >= 0) {
              updated = updated.filter(i => i.id !== incident.id);
            }
          } else {
            if (index >= 0) {
              updated[index] = { ...updated[index], ...incident };
            } else {
              updated.push(incident);
            }
          }
        });
        return updated;
      });

      incidentUpdateQueueRef.current = {};
    }
  }, [setVehicles]);

  // Schedule batch updates every 100ms
  const scheduleUpdate = useCallback(() => {
    if (updateTimerRef.current) return;
    updateTimerRef.current = setTimeout(() => {
      flushUpdates();
      updateTimerRef.current = null;
    }, 100);
  }, [flushUpdates]);


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

      client.subscribe('/topic/vehicle/update', (message) => {
        try {
          const updateDto = JSON.parse(message.body);
          // Queue the update instead of immediately applying it
          vehicleUpdateQueueRef.current[updateDto.vehicleId] = updateDto;
          scheduleUpdate();
        } catch (e) {
          console.error('Error parsing vehicle update:', e);
        }
      });

      // Subscribe to incident updates
      client.subscribe('/topic/incident/update', (message) => {
        try {
          const incident = JSON.parse(message.body);

          const isNewIncident = !notifiedIncidentsRef.current.has(incident.id);
          if (isNewIncident && (incident.status === 'PENDING' || incident.status === 'ASSIGNED')) {
            notifiedIncidentsRef.current.add(incident.id);
            addNotification('incident', 1);
          }

          // Queue the update instead of immediately applying it
          incidentUpdateQueueRef.current[incident.id] = incident;
          scheduleUpdate();
        } catch (e) {
          console.error('Error parsing incident update:', e);
        }
      });

      client.subscribe('/topic/assignment/update', (message) => {
        try {
          const updateDto = JSON.parse(message.body);

          addNotification('assignment', 1);

        } catch (e) {
          console.error('Error parsing assignment update:', e);
        }
      });

      client.subscribe('/topic/reports', (message) => {
        try {
          const report = JSON.parse(message.body);
          if (report.status === 'PENDING' || report.status === 'ASSIGNED') {
            // Only add notification if we haven't notified about this incident yet
            if (!notifiedIncidentsRef.current.has(report.id)) {
              notifiedIncidentsRef.current.add(report.id);
              addNotification('incident', 1);
            }
            // Queue the update
            incidentUpdateQueueRef.current[report.id] = report;
            scheduleUpdate();
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
      // Clear batch update timer
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      // Clear all notification timeouts
      notificationTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      notificationTimeoutsRef.current = [];
    };
  }, [scheduleUpdate]);

  // Notification management
  const notificationTimeoutsRef = useRef([]);
  const MAX_NOTIFICATIONS = 40;
  
  const addNotification = (type, count = 1) => {
    const notifId = Date.now();
    setNotifications(prev => {
      const existing = prev.find(n => n.type === type);
      if (existing) {
        return prev.map(n =>
          n.type === type
            ? { ...n, count: n.count + count, timestamp: notifId }
            : n
        );
      }
      
      // Add new notification and limit to MAX_NOTIFICATIONS
      let updated = [...prev, { type, count, timestamp: notifId, id: notifId }];
      if (updated.length+10 > MAX_NOTIFICATIONS) {
        // Remove oldest notifications to stay within limit
        updated = updated.slice(updated.length - MAX_NOTIFICATIONS);
      }
      return updated;
    });

    const timeoutId = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      // Remove timeout reference
      notificationTimeoutsRef.current = notificationTimeoutsRef.current.filter(id => id !== timeoutId);
    }, 5000);
    
    // Store timeout reference for cleanup
    notificationTimeoutsRef.current.push(timeoutId);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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

  const handleMarkerClick = useCallback((id, type) => {
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
  }, [vehicles, liveLocations, incidents]);

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
                <span className="livemap-legend-dot" style={{ backgroundColor: '#60a5fa' }}></span>
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
          {showIncidents && incidents.map((incident) => (
            <IncidentMarker
              key={`incident-${incident.id}`}
              incident={incident}
              onMarkerClick={handleMarkerClick}
            />
          ))}

          {/* Render vehicles */}
          {showVehicles && vehicles.map((vehicle) => (
            <VehicleMarker
              key={`vehicle-${vehicle.id}`}
              vehicle={vehicle}
              liveLocation={liveLocations[vehicle.id]}
              onMarkerClick={handleMarkerClick}
            />
          ))}

          {selectedItem && (
            <DetailWindow
              item={selectedItem}
              type={selectedType}
              onClose={closeDetailWindow}
              vehicles={vehicles}
              incidents={incidents}
            />
          )}

        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;
