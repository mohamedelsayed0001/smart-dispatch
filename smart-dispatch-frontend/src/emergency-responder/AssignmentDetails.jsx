import { useState, useEffect, useRef } from 'react';
import { responderAPI } from './service/api';
import MapView from './MapView';
import StatusControl from './StatusControl';
import NavigationPanel from './NavigationPanel';
import locationService from './service/locationService';
import './css/responder.css';

const AssignmentDetails = ({ assignmentId, responderId, onBack }) => {
  const [assignment, setAssignment] = useState(null);
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

    loadAssignmentDetails(abortControllerRef.current.signal);

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
  }, [assignmentId, responderId]);

  const loadAssignmentDetails = async (signal) => {
    try {
      setLoading(true);
      const [assignmentRes, locationsRes] = await Promise.all([
        responderAPI.getAssignmentDetails(assignmentId, responderId, signal),
        responderAPI.getAssignmentLocations(assignmentId, responderId, signal),
      ]);

      // Check if request was aborted
      if (signal.aborted) return;

      setAssignment(assignmentRes.data);
      setLocations(locationsRes.data);
      setLoading(false);
    } catch (err) {
      // Ignore cancelled requests
      if (err.name === 'CanceledError' || err.code === 'ECONNABORTED') {
        console.log('Request was cancelled');
        return;
      }

      console.error('Error loading assignment:', err);
      setError('Failed to load assignment details');
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (isTracking) return;

    locationService.startTracking(
      responderId,
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
      await responderAPI.updateStatus(assignmentId, responderId, statusData);

      // Reload assignment details to get updated status
      const abortController = new AbortController();
      await loadAssignmentDetails(abortController.signal);

      setStatusLoading(false);
    } catch (err) {
      // Ignore cancelled requests
      if (err.name === 'CanceledError' || err.code === 'ECONNABORTED') {
        return;
      }

      console.error('Error updating status:', err);
      setStatusLoading(false);
      throw err;
    }
  };

  const handleCancelAssignment = async () => {
    try {
      setCancelLoading(true);

      // Cancel the assignment - this should:
      // 1. Set assignment status to 'canceled'
      // 2. Set vehicle status to 'AVAILABLE'
      // 3. Set incident status to 'pending'
      await responderAPI.cancelAssignment(assignmentId, responderId);

      setCancelLoading(false);
      setShowCancelConfirm(false);

      // Show success message
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Assignment Cancelled', {
          body: 'The assignment has been cancelled successfully',
        });
      }

      // Go back to dashboard
      onBack();
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ECONNABORTED') {
        return;
      }

      console.error('Error cancelling assignment:', err);
      alert('Failed to cancel assignment. Please try again.');
      setCancelLoading(false);
      setShowCancelConfirm(false);
    }
  };

  const handleRouteLoaded = (routeData) => {
    setRoute(routeData);
  };

  const getSeverityClass = (severity) => {
    const severityMap = {
      critical: 'badge-critical',
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

  if (!assignment) {
    return null;
  }

  const { incident, vehicle } = assignment;

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
            assignment={assignment}
            responderId={responderId}
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