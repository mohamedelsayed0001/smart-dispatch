import mapService from './service/mapService';
import './css/responder.css';

const NavigationPanel = ({ vehicleLocation, incidentLocation, route }) => {
  const handleOpenGoogleMaps = () => {
    if (!vehicleLocation || !incidentLocation) return;
    
    const url = mapService.getGoogleMapsUrl(vehicleLocation, incidentLocation);
    window.open(url, '_blank');
  };

  const handleOpenWaze = () => {
    if (!incidentLocation) return;
    
    const url = mapService.getWazeUrl(incidentLocation);
    window.open(url, '_blank');
  };

  const handleOpenAppleMaps = () => {
    if (!incidentLocation) return;
    
    const url = `http://maps.apple.com/?daddr=${incidentLocation.latitude},${incidentLocation.longitude}`;
    window.open(url, '_blank');
  };

  if (!vehicleLocation || !incidentLocation) {
    return (
      <div className="navigation-panel">
        <div className="navigation-unavailable">
          <p>Navigation unavailable - missing location data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="navigation-panel">
      <div className="navigation-header">
        <h3>Navigation</h3>
      </div>

      {route && (
        <div className="route-summary">
          <div className="route-detail">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13c0-5 4-9 9-9s9 4 9 9z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <div className="route-detail-content">
              <span className="detail-label">Distance</span>
              <span className="detail-value">
                {mapService.formatDistance(route.distance)}
              </span>
            </div>
          </div>

          <div className="route-detail">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <div className="route-detail-content">
              <span className="detail-label">Duration</span>
              <span className="detail-value">
                {mapService.formatDuration(route.duration)}
              </span>
            </div>
          </div>

          <div className="route-detail">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm0-14v10l4-4-4-6z"/>
            </svg>
            <div className="route-detail-content">
              <span className="detail-label">ETA</span>
              <span className="detail-value">
                {mapService.calculateETA(route.duration)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="navigation-apps">
        <h4 className="apps-label">Open in Navigation App</h4>
        <div className="app-buttons">
          <button 
            className="nav-app-btn google-maps" 
            onClick={handleOpenGoogleMaps}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>Google Maps</span>
          </button>

          <button 
            className="nav-app-btn waze" 
            onClick={handleOpenWaze}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <span>Waze</span>
          </button>

          <button 
            className="nav-app-btn apple-maps" 
            onClick={handleOpenAppleMaps}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>Apple Maps</span>
          </button>
        </div>
      </div>

      <div className="location-details">
        <div className="location-item">
          <strong>Incident Location:</strong>
          <p>
            {incidentLocation.latitude.toFixed(6)}, {incidentLocation.longitude.toFixed(6)}
          </p>
        </div>
        <div className="location-item">
          <strong>Your Location:</strong>
          <p>
            {vehicleLocation.latitude.toFixed(6)}, {vehicleLocation.longitude.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;