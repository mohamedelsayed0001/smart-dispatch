import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker with animation
const createCustomIcon = (vehicleId) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: #3b82f6;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: markerZoom 0.5s ease-out;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${vehicleId}</span>
      </div>
      <style>
        @keyframes markerZoom {
          from {
            transform: rotate(-45deg) scale(0);
            opacity: 0;
          }
          to {
            transform: rotate(-45deg) scale(1);
            opacity: 1;
          }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map controls
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  
  return null;
};

// Component to update map bounds automatically (only on first load)
const MapViewController = ({ vehicles }) => {
  const map = useMap();
  const hasAutoFitRef = useRef(false);

  useEffect(() => {
    const vehiclePositions = Object.values(vehicles).map(v => [v.latitude, v.longitude]);
    if (vehiclePositions.length > 0 && !hasAutoFitRef.current) {
      map.fitBounds(vehiclePositions, { padding: [50, 50], maxZoom: 13 });
      hasAutoFitRef.current = true;
    }
  }, [vehicles, map]);

  return null;
};

const VehicleLocationsMap = () => {
  const [vehicles, setVehicles] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.0444, 31.2357]);
  const [mapZoom, setMapZoom] = useState(12);
  const mapRef = useRef(null);

  const center = [30.0444, 31.2357]; // Cairo

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws-car-location');
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {}; // disable logs
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

    const onConnect = () => {
      console.log('✅ Connected to WebSocket');
      setIsConnected(true);

      stompClient.subscribe('/topic/locations/all', (message) => {
        try {
          const location = JSON.parse(message.body);
          const normalized = {
            vehicle_id: location.vehicle_id || location.vehicleId,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp,
            lastUpdated: new Date().toLocaleTimeString()
          };
          setVehicles(prev => ({
            ...prev,
            [normalized.vehicle_id]: normalized
          }));
        } catch (err) {
          console.error('❌ Error parsing location:', err);
        }
      });
    };

    const onError = (err) => {
      console.error('❌ WebSocket error:', err);
      setIsConnected(false);

      // reconnect after 5 seconds
      setTimeout(() => {
        if (stompClient) stompClient.connect({ Authorization: token ? `Bearer ${token}` : '' }, onConnect, onError);
      }, 5000);
    };

    stompClient.connect({ Authorization: token ? `Bearer ${token}` : '' }, onConnect, onError);

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => console.log('🔌 WebSocket disconnected'));
      }
    };
  }, []);

  const vehicleList = Object.values(vehicles);
  const activeVehicles = vehicleList.length;

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    // Update map center and zoom to focus on selected vehicle
    setMapCenter([vehicle.latitude, vehicle.longitude]);
    setMapZoom(15);
  };

  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header with animation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        animation: 'slideDown 0.5s ease-out'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0
        }}>
          Live Vehicle Tracking
        </h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '20px',
          backgroundColor: isConnected ? '#d1fae5' : '#fee2e2',
          animation: 'zoomIn 0.5s ease-out 0.2s both'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            animation: isConnected ? 'pulse 2s infinite' : 'none'
          }}></span>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isConnected ? '#065f46' : '#991b1b'
          }}>
            {isConnected ? 'Live Tracking' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Stats Card with animation */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        animation: 'zoomIn 0.5s ease-out 0.3s both'
      }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#3b82f6' }}>
          {activeVehicles}
        </div>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Active Vehicles</div>
      </div>

      {/* Map Container with animation */}
      <div style={{
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        animation: 'zoomIn 0.5s ease-out 0.4s both'
      }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ width: '100%', height: '600px' }}
          ref={mapRef}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} zoom={mapZoom} />
          <MapViewController vehicles={vehicles} />

          {vehicleList.map((vehicle) => (
            <Marker
              key={vehicle.vehicle_id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={createCustomIcon(vehicle.vehicle_id)}
              eventHandlers={{ click: () => handleVehicleClick(vehicle) }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                    Vehicle #{vehicle.vehicle_id}
                  </h3>
                  <div style={{ fontSize: '14px' }}>
                    <p><strong>Latitude:</strong> {vehicle.latitude.toFixed(6)}</p>
                    <p><strong>Longitude:</strong> {vehicle.longitude.toFixed(6)}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Last updated: {vehicle.lastUpdated}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Vehicle List Section */}
      <div style={{
        animation: 'slideUp 0.5s ease-out 0.5s both'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          color: '#1f2937'
        }}>
          Vehicle Details ({activeVehicles} vehicles)
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {activeVehicles === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              animation: 'zoomIn 0.5s ease-out'
            }}>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>
                {isConnected 
                  ? '⏳ Waiting for vehicle data...' 
                  : '🔌 Connecting to vehicle tracking system...'}
              </p>
            </div>
          ) : (
            vehicleList
              .sort((a, b) => a.vehicle_id - b.vehicle_id)
              .map((vehicle, index) => (
                <div 
                  key={vehicle.vehicle_id} 
                  onClick={() => handleVehicleClick(vehicle)}
                  style={{ 
                    cursor: 'pointer',
                    border: selectedVehicle?.vehicle_id === vehicle.vehicle_id 
                      ? '2px solid #3b82f6' 
                      : '1px solid #e5e7eb',
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    animation: `cardZoom 0.5s ease-out ${0.6 + index * 0.05}s both`,
                    transform: selectedVehicle?.vehicle_id === vehicle.vehicle_id 
                      ? 'scale(1.02)' 
                      : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedVehicle?.vehicle_id !== vehicle.vehicle_id) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedVehicle?.vehicle_id !== vehicle.vehicle_id) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>
                      Vehicle #{vehicle.vehicle_id}
                    </span>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
                    <div>📍 {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}</div>
                    <div>🕐 {vehicle.lastUpdated}</div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardZoom {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default VehicleLocationsMap;