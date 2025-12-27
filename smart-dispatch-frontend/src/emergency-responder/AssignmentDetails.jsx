import { useState, useEffect, useRef } from 'react';
import { responderAPI } from './service/api';
import MapView from './MapView';
import StatusControl from './StatusControl';
import NavigationPanel from './NavigationPanel';
import locationService from './service/locationService';
import './css/responder.css';

const AssignmentDetails = ({ assignment: initialAssignment, profile, onBack }) => {
  const [assignment, setAssignment] = useState(initialAssignment);
  const [incident, setIncident] = useState(null);
  const [locations, setLocations] = useState(null);
  const [route, setRoute] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Prevent duplicate tracking and API calls
  const trackingStarted = useRef(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Create new AbortController
    abortControllerRef.current = new AbortController();

    loadData(abortControllerRef.current.signal);

    if (!trackingStarted.current) {
      startLocationTracking();
      trackingStarted.current = true;
    }

    return () => {
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      stopLocationTracking();
      trackingStarted.current = false;
    };
  }, [initialAssignment.id]);

  const loadData = async (signal) => {
    try {
      setLoading(true);

      // Fetch incident details to get coordinates (not in flat DTO)
      const incidentRes = await responderAPI.getIncidentDetails(assignment.incidentId, signal);

      if (signal.aborted) return;

      const incidentData = incidentRes.data;
      setIncident(incidentData);

      // Reconstruct locations object for MapView/NavigationPanel
      const vehicleLoc = {
        latitude: profile.assignedVehicle?.currentLatitude || assignment.currentLatitude,
        longitude: profile.assignedVehicle?.currentLongitude || assignment.currentLongitude,
        timestamp: new Date().toISOString()
      };

      const incidentLoc = {
        latitude: incidentData.latitude,
        longitude: incidentData.longitude,
        timestamp: incidentData.timeReported || new Date().toISOString()
      };

      setLocations({
        vehicle: { id: assignment.vehicleId, location: vehicleLoc },
        incident: { id: incidentData.id, location: incidentLoc }
      });

      setLoading(false);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ECONNABORTED') return;
      console.error('Error loading details:', err);
      setError('Failed to load incident details');
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (isTracking) return;
    locationService.startTracking(
      (location) => {
        setCurrentLocation(location);
      },
      (err) => {
        console.error('Location tracking error:', err);
      }
    );
    setIsTracking(true);
  };

  const stopLocationTracking = () => {
    if (isTracking) {
      locationService.stopTracking();
      setIsTracking(false);
    }
  };

  const handleStatusChange = async (statusData) => {
    try {
      setStatusLoading(true);
      await responderAPI.updateStatus(assignment.id, statusData);

      // Update local state
      setAssignment(prev => ({
        ...prev,
        status: statusData.assignmentStatus || prev.status,
        vehicleStatus: statusData.vehicleStatus || prev.vehicleStatus
      }));

      setStatusLoading(false);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ECONNABORTED') return;
      console.error('Error updating status:', err);
      setStatusLoading(false);
      throw err;
    }
  };

  const handleCancelAssignment = async () => {
    try {
      setCancelLoading(true);

      // Cancel is just a status update now
      await responderAPI.updateStatus(assignment.id, {
        vehicleStatus: "AVAILABLE",
        assignmentStatus: "CANCELED",
        incidentStatus: "PENDING"
      });

      setCancelLoading(false);
      setShowCancelConfirm(false);
      onBack();
    } catch (err) {
      console.error('Error cancelling assignment:', err);
      alert('Failed to cancel assignment.');
      setCancelLoading(false);
    }
  };

  const handleRouteLoaded = (routeData) => {
    setRoute(routeData);
  };

  const getSeverityClass = (severity) => {
    const severityMap = {
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low',
    };
    return severityMap[severity?.toLowerCase()] || 'badge-medium';
  };

  if (loading) {
    return (
      <div className="assignment-details">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assignment-details">
        <div className="error-container">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={onBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!assignment || !incident) {
    return null;
  }

  const vehicle = {
    id: assignment.vehicleId,
    type: profile.assignedVehicle?.type || 'Vehicle',
    status: profile.assignedVehicle?.status || 'Active'
  };

  return (
    <div className="assignment-details">
      {/* Header */}
      <div className="details-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back
        </button>
        <h2>Assignment #{assignment.id} Details</h2>
        <div className="header-actions">
          <button
            className="btn btn-danger-outline"
            onClick={() => setShowCancelConfirm(true)}
            disabled={cancelLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
            Cancel Assignment
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="details-content">
        {/* Left Column - Map */}
        <div className="details-map-section">
          <MapView
            assignment={{ ...assignment, incident, vehicle }}
            onLocationUpdate={setCurrentLocation}
            onRouteLoaded={handleRouteLoaded}
          />
        </div>

        {/* Right Column - Details & Controls */}
        <div className="details-info-section">
          {/* Incident Info */}
          <div className="info-card">
            <h3>Incident Information</h3>
            <div className="info-content">
              <div className="info-row">
                <span className="info-label">Type:</span>
                <span className="info-value">{incident.type}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Severity:</span>
                <span className={`badge ${getSeverityClass(incident.level)}`}>
                  {incident.level}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Reported:</span>
                <span className="info-value">
                  {new Date(incident.timeReported).toLocaleString()}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Vehicle:</span>
                <span className="info-value">
                  {vehicle.type} #{vehicle.id}
                </span>
              </div>
              {incident.description && (
                <div className="info-row full-width">
                  <span className="info-label">Description:</span>
                  <p className="info-description">{incident.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Control */}
          <div className="info-card">
            <StatusControl
              currentStatus={vehicle.status}
              assignmentStatus={assignment.status}
              onStatusChange={handleStatusChange}
              onBack={onBack}
              loading={statusLoading}
            />
          </div>

          {/* Navigation Panel */}
          {locations && (
            <div className="info-card">
              <NavigationPanel
                vehicleLocation={currentLocation || locations.vehicle.location}
                incidentLocation={locations.incident.location}
                route={route}
              />
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="confirm-modal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header">
              <h3>Cancel Assignment</h3>
            </div>
            <div className="confirm-body">
              <p>
                Are you sure you want to cancel this assignment? This will:
              </p>
              <ul className="confirm-list">
                <li>Mark the assignment as cancelled</li>
                <li>Set your vehicle status to Available</li>
                <li>Return the incident to Pending status</li>
              </ul>
              <p className="warning-text">
                This action cannot be undone.
              </p>
            </div>
            <div className="confirm-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelLoading}
              >
                Keep Assignment
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancelAssignment}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetails;