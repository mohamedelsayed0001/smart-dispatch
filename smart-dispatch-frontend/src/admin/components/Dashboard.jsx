import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import { MapPin } from 'lucide-react';
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

// Custom car marker icon
const createCarIcon = (vehicleId) => {
  return L.divIcon({
    className: 'custom-car-marker',
    html: `
      <div style="
        background-color: #ef4444;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 14px;
      ">
        🚗
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
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

const Dashboard = () => {
  const [vehicles, setVehicles] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    activeCars: 0,
    pendingEmergencies: 5,
    responseTime: '3.5 min',
    efficiency: 87
  });

  const center = [30.0444, 31.2357]; // Cairo

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws-car-location');
    const stompClient = Stomp.over(socket);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    stompClient.debug = () => {};

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

  useEffect(() => {
    setDashboardData(prev => ({
      ...prev,
      activeCars: vehicleList.length
    }));
  }, [vehicleList.length]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', color: '#1f2937' }}>
        Dashboard
      </h1>
      
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Active Units</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>
            {dashboardData.activeCars}
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Pending Emergencies</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>
            {dashboardData.pendingEmergencies}
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Avg Response Time</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>
            {dashboardData.responseTime}
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Efficiency</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>
            {dashboardData.efficiency}%
          </div>
        </div>
      </div>

      {/* Map Container removed */}

      {/* Additional Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <span>Metric Area 1</span>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <span>Metric Area 2</span>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <span>Metric Area 3</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;