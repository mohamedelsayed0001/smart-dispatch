import { responderAPI } from './api';
import webSocketService from './websocket';

class LocationService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.lastUpdate = null;
    this.updateInterval = 60000; // 60 seconds
  }

  // Request location permission
  async requestPermission() {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }

    return new Promise((resolve, reject) => {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          resolve(true);
        } else {
          reject(new Error('Location permission denied'));
        }
      });
    });
  }

  async handleInitialLocation() {
    try {
      // 1. Request permission
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        await this.requestPermission();
        await this.handleInitialLocation();
        return;
      }

      // 2. Get current position
      const location = await this.getCurrentPosition();

      // 3. Send to backend once
      await responderAPI.updateLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      });

      console.log('Initial location updated in DB');
    } catch (err) {
      console.error('Error updating initial location:', err);
    }
  }

  // Get current position once
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };
          resolve(location);
        },
        (error) => {
          reject(this.handleLocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  // Start tracking location
  startTracking(onLocationUpdate, onError) {
    if (this.isTracking) return;
    this.isTracking = true;

    let isRequesting = false;

    this.updateTimer = setInterval(async () => {
      if (isRequesting) return;
      isRequesting = true;

      try {
        const location = await this.getCurrentPosition();
        this.lastUpdate = location;

        // Always update backend
        await this.sendLocationUpdate(location);

        // Always update UI
        if (onLocationUpdate) onLocationUpdate(location);
      } catch (err) {
        console.error("Periodic update error:", err);
        if (onError) onError(err);
      } finally {
        isRequesting = false;
      }
    }, this.updateInterval);
  }

  // Stop tracking location
  stopTracking() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    if (this.updateTimer) clearInterval(this.updateTimer);
    this.watchId = null;
    this.updateTimer = null;
    this.isTracking = false;
    this.lastUpdate = null;
  }

  // Check if we should send location update
  shouldSendUpdate(newLocation) {
    if (!this.lastUpdate) return true;

    const timeDiff = new Date(newLocation.timestamp) - new Date(this.lastUpdate.timestamp);

    // Send update every updateInterval milliseconds
    if (timeDiff >= this.updateInterval) return true;

  }

  // Send location update to server
  async sendLocationUpdate(location) {
    try {
      await responderAPI.updateLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
      });
    } catch (error) {
      console.error('Failed to send location update:', error);
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Handle location errors
  handleLocationError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error('Location permission denied. Please enable location services.');
      case error.POSITION_UNAVAILABLE:
        return new Error('Location information is unavailable.');
      case error.TIMEOUT:
        return new Error('Location request timed out.');
      default:
        return new Error('An unknown error occurred while getting location.');
    }
  }

  // Set update interval
  setUpdateInterval(milliseconds) {
    this.updateInterval = milliseconds;
  }

}

// Create singleton instance
const locationService = new LocationService();

export default locationService;