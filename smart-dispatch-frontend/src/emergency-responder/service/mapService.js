import L from 'leaflet';

class MapService {
  constructor() {
    this.map = null;
    this.vehicleMarker = null;
    this.incidentMarker = null;
    this.routeLayer = null;
    this.currentRoute = null;
  }

  // Initialize map - returns a promise that resolves when map is ready
  async initializeMap(containerId, center = [30.0444, 31.2357], zoom = 13) {
    // Destroy existing map if any
    if (this.map) {
      this.destroy();
    }

    try {
      console.log('Creating Leaflet map instance...');
      
      // Create map immediately - Leaflet is synchronous
      this.map = L.map(containerId, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: true,
      }).setView(center, zoom);

      console.log('Map instance created:', this.map);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      console.log('Tiles added to map');

      // Return a promise that resolves after a short delay to ensure everything is ready
      return new Promise((resolve) => {
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
            console.log('Map size invalidated and ready');
            resolve(this.map);
          }
        }, 150);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  }

  // Create custom icon
  createCustomIcon(type, color) {
    const iconHtml = this.getIconHtml(type, color);
    
    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  }

  // Get icon HTML based on type
  getIconHtml(type, color) {
    const icons = {
      vehicle: `<svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>`,
      incident: `<svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>`,
    };

    return icons[type] || icons.incident;
  }

  // Add or update vehicle marker
  updateVehicleMarker(location, vehicleType = 'ambulance') {
    if (!this.map) {
      console.error('Cannot update vehicle marker: Map not initialized');
      return null;
    }

    console.log('Updating vehicle marker at:', location);

    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color')
      .trim() || '#3b82f6';

    const icon = this.createCustomIcon('vehicle', color);

    if (this.vehicleMarker) {
      this.vehicleMarker.setLatLng([location.latitude, location.longitude]);
    } else {
      this.vehicleMarker = L.marker([location.latitude, location.longitude], { icon })
        .addTo(this.map)
        .bindPopup(`<b>Your Location</b><br/>Type: ${vehicleType}`);
    }

    return this.vehicleMarker;
  }

  // Add or update incident marker
  updateIncidentMarker(location, incidentType, severity) {
    if (!this.map) {
      console.error('Cannot update incident marker: Map not initialized');
      return null;
    }

    console.log('Updating incident marker at:', location);

    const severityColors = {
      critical: getComputedStyle(document.documentElement).getPropertyValue('--severity-critical').trim() || '#dc2626',
      high: getComputedStyle(document.documentElement).getPropertyValue('--severity-high').trim() || '#ea580c',
      medium: getComputedStyle(document.documentElement).getPropertyValue('--severity-medium').trim() || '#ca8a04',
      low: getComputedStyle(document.documentElement).getPropertyValue('--severity-low').trim() || '#16a34a',
    };

    const color = severityColors[severity.toLowerCase()] || severityColors.medium;
    const icon = this.createCustomIcon('incident', color);

    if (this.incidentMarker) {
      this.incidentMarker.setLatLng([location.latitude, location.longitude]);
    } else {
      this.incidentMarker = L.marker([location.latitude, location.longitude], { icon })
        .addTo(this.map)
        .bindPopup(`<b>Incident Location</b><br/>Type: ${incidentType}<br/>Severity: ${severity}`);
    }

    return this.incidentMarker;
  }

  // Fit map to show both markers
  fitBounds() {
    if (!this.map) {
      console.error('Cannot fit bounds: Map not initialized');
      return;
    }

    if (this.vehicleMarker && this.incidentMarker) {
      const bounds = L.latLngBounds([
        this.vehicleMarker.getLatLng(),
        this.incidentMarker.getLatLng(),
      ]);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  // Center map on vehicle
  centerOnVehicle() {
    if (!this.map) {
      console.error('Cannot center on vehicle: Map not initialized');
      return;
    }

    if (this.vehicleMarker) {
      this.map.setView(this.vehicleMarker.getLatLng(), 15);
    }
  }

  // Get route from OSRM
  async getRoute(start, end) {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok') {
        throw new Error('Route not found');
      }

      const route = data.routes[0];
      this.currentRoute = {
        distance: route.distance / 1000, // Convert to km
        duration: route.duration, // in seconds
        coordinates: route.geometry.coordinates,
      };

      return this.currentRoute;
    } catch (error) {
      console.error('Error fetching route:', error);
      throw error;
    }
  }

  // Draw route on map
  drawRoute(route) {
    if (!this.map) {
      console.error('Cannot draw route: Map not initialized');
      return null;
    }

    console.log('Drawing route on map');

    // Remove existing route
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }

    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--route-color')
      .trim() || '#3b82f6';

    // Convert coordinates to Leaflet format [lat, lng]
    const latlngs = route.coordinates.map((coord) => [coord[1], coord[0]]);

    this.routeLayer = L.polyline(latlngs, {
      color: color,
      weight: 4,
      opacity: 0.7,
    }).addTo(this.map);

    return this.routeLayer;
  }

  // Clear route from map
  clearRoute() {
    if (!this.map) return;
    
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }
    this.currentRoute = null;
  }

  // Format distance
  formatDistance(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  }

  // Format duration
  formatDuration(durationSeconds) {
    const minutes = Math.round(durationSeconds / 60);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }

  // Calculate ETA
  calculateETA(durationSeconds) {
    const now = new Date();
    const eta = new Date(now.getTime() + durationSeconds * 1000);
    return eta.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Generate Google Maps URL for navigation
  getGoogleMapsUrl(start, end) {
    return `https://www.google.com/maps/dir/?api=1&origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&travelmode=driving`;
  }

  // Generate Waze URL for navigation
  getWazeUrl(end) {
    return `https://waze.com/ul?ll=${end.latitude},${end.longitude}&navigate=yes`;
  }

  // Destroy map
  destroy() {
    if (this.map) {
      console.log('Destroying map instance');
      try {
        // Remove layers first
        if (this.routeLayer) {
          this.map.removeLayer(this.routeLayer);
        }
        if (this.vehicleMarker) {
          this.map.removeLayer(this.vehicleMarker);
        }
        if (this.incidentMarker) {
          this.map.removeLayer(this.incidentMarker);
        }
        
        // Remove map
        this.map.remove();
      } catch (error) {
        console.error('Error destroying map:', error);
      }
      
      this.map = null;
      this.vehicleMarker = null;
      this.incidentMarker = null;
      this.routeLayer = null;
      this.currentRoute = null;
    }
  }
}

// Create singleton instance
const mapService = new MapService();

export default mapService;