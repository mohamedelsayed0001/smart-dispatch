import React from 'react';
import { MapPin } from 'lucide-react';
import './styles/Dashboard.css';

const Dashboard = ({ dashboardData }) => {
  return (
    <div className="view-container">
      <h1 className="page-title">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Units</div>
          <div className="stat-value">{dashboardData?.activeCars || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Emergencies</div>
          <div className="stat-value emergency">{dashboardData?.pendingEmergencies || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Response Time</div>
          <div className="stat-value">{dashboardData?.responseTime || '0 min'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Efficiency</div>
          <div className="stat-value success">{dashboardData?.efficiency || 0}%</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <h2 className="section-title">Live Map</h2>
        <div className="map-placeholder">
          <div className="map-grid"></div>
          <div className="map-content">
            <MapPin className="map-icon" size={48} />
            <p className="map-text">Map Integration Area</p>
            <p className="map-subtext">Unit positions will be displayed here</p>
          </div>
          <div className="map-pin pin-1"></div>
          <div className="map-pin pin-2"></div>
          <div className="map-pin pin-3"></div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="metrics-grid">
        <div className="metric-box">
          <span>Metric Area 1</span>
        </div>
        <div className="metric-box">
          <span>Metric Area 2</span>
        </div>
        <div className="metric-box">
          <span>Metric Area 3</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
