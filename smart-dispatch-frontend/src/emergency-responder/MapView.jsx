import { useEffect, useRef, useState } from 'react';
import mapService from './service/mapService';
import locationService from './service/locationService';
import 'leaflet/dist/leaflet.css';
import './css/map.css';

const MapView = ({ assignment, responderId, onLocationUpdate }) => {
  const mapContainerRef = useRef(null);
  const [route, setRoute] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Prevent double initialization
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!assignment || !mapContainerRef.current || isInitialized.current) return;
    isInitialized.current = true;
    let isMounted = true; // flag

    const initializeMap = async () => {
      try {
        locationService.setResponderId(responderId);

        const location = await locationService.getCurrentPosition();
        if (!isMounted) return;

        setCurrentLocation(location);

        await mapService.initializeMap(mapContainerRef.current.id);
        if (!isMounted) return;

        mapService.updateVehicleMarker(location, assignment.vehicle?.type || 'vehicle');

        if (assignment.incident) {
          mapService.updateIncidentMarker(
            assignment.incident,
            assignment.incident.type,
            assignment.incident.level
          );

          const routeData = await mapService.getRoute(
            { latitude: location.latitude, longitude: location.longitude },
            { latitude: assignment.incident.latitude, longitude: assignment.incident.longitude }
          );
          if (!isMounted) return;

          setRoute(routeData);
          mapService.drawRoute(routeData);
        }

        mapService.fitBounds();
        if (!isMounted) return;
        setIsMapReady(true);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
        isInitialized.current = false;
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      console.log('Cleaning up map...');
      locationService.stopTracking();
      mapService.destroy();
      setCurrentLocation(null);
      setRoute(null);
      setIsMapReady(false);
      setError(null);
      isInitialized.current = false;
    };
  }, [assignment, responderId]);


  // Update vehicle marker when location changes
  useEffect(() => {
    if (currentLocation && mapService.map) {
      mapService.updateVehicleMarker(
        currentLocation,
        assignment?.vehicle?.type || 'vehicle'
      );
    }
  }, [currentLocation, assignment?.vehicle]);

  // Handle location updates from parent
  useEffect(() => {
    if (onLocationUpdate && currentLocation) {
      onLocationUpdate(currentLocation);
    }
  }, [currentLocation, onLocationUpdate]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapService.map) {
        mapService.map.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRecenterVehicle = () => {
    if (!mapService.map) {
      console.warn('Map not ready');
      return;
    }
    mapService.centerOnVehicle();
  };

  const handleFitBounds = () => {
    if (!mapService.map) {
      console.warn('Map not ready');
      return;
    }
    mapService.fitBounds();
  };

  if (error) {
    return (
      <div className="map-container">
        <div className="map-error">
          <p>Error loading map: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      {/* Always render the map div */}
      <div id="map" ref={mapContainerRef}></div>

      {/* Show loading overlay */}
      {!isMapReady && (
        <div className="map-loading-overlay">
          <div className="spinner"></div>
          <p>Loading map...</p>
        </div>
      )}

      {/* Map Controls */}
      {isMapReady && (
        <div className="map-controls">
          <button
            className="map-control-btn"
            onClick={handleRecenterVehicle}
            title="Center on vehicle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          </button>
          <button
            className="map-control-btn"
            onClick={handleFitBounds}
            title="Fit all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z" />
            </svg>
          </button>
        </div>
      )}

      {/* Route Info Overlay */}
      {route && isMapReady && (
        <div className="route-info-overlay">
          <div className="route-info-card">
            <div className="route-stat">
              <span className="route-label">Distance</span>
              <span className="route-value">
                {mapService.formatDistance(route.distance)}
              </span>
            </div>
            <div className="route-stat">
              <span className="route-label">ETA</span>
              <span className="route-value">
                {mapService.calculateETA(route.duration)}
              </span>
            </div>
            <div className="route-stat">
              <span className="route-label">Duration</span>
              <span className="route-value">
                {mapService.formatDuration(route.duration)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;