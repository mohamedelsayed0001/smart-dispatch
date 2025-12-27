import { useState, useEffect, useRef } from 'react';
import { responderAPI } from './service/api';
import locationService from './service/locationService';
import webSocketService from './service/websocket';
import AssignmentCard from './AssignmentCard';
import AssignmentDetails from './AssignmentDetails';
import './css/responder.css';

const ResponderDashboard = () => {
  const MAX_ITEMS = 20;

  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);

  const isInitialized = useRef(false);
  const isConnecting = useRef(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Create new AbortController for this effect
    abortControllerRef.current = new AbortController();

    initializeDashboard(abortControllerRef.current.signal);

    return () => {
      // Cleanup: abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Cleanup WebSocket connection
      webSocketService.disconnect();
      isInitialized.current = false;
    };
  }, []);

  const initializeDashboard = async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, assignmentsRes] = await Promise.all([
        responderAPI.getProfile(signal),
        responderAPI.getAllAssignments(0, MAX_ITEMS, signal)
      ]);

      // Check if request was aborted
      if (signal.aborted) return;

      setProfile(profileRes.data);
      setAssignments(assignmentsRes.data);

      locationService.handleInitialLocation();

      // Connect to WebSocket
      if (!isConnecting.current) {
        await connectWebSocket(profileRes.data);
      }

      setLoading(false);
    } catch (error) {
      // Ignore aborted requests
      if (error.name === 'CanceledError' || error.code === 'ECONNABORTED') {
        console.log('Request was cancelled (likely due to StrictMode)');
        return;
      }

      console.error('Error initializing dashboard:', error);
      setError(error.message || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  const connectWebSocket = async (profile) => {
    if (isConnecting.current) return;
    isConnecting.current = true;

    try {
      console.log(profile);
      await webSocketService.connect(profile.id,
        () => {
          console.log('WebSocket connected');
          setWsConnected(true);
        },
        (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
        }
      );

      webSocketService.onMessage('NEW_ASSIGNMENT', handleNewAssignment);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setWsConnected(false);
    } finally {
      isConnecting.current = false;
    }
  };

  const handleNewAssignment = (message) => {
    console.log('New assignment notification received:', message);

    setAssignments(prevAssignments => [message, ...prevAssignments]);

    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const handleAcceptAssignment = async (assignment) => {
    try {
      await responderAPI.updateStatus(assignment.id, {
        vehicleStatus: "ONROUTE",
        assignmentStatus: "ACTIVE",
        incidentStatus: "ASSIGNED"
      });
      await loadAssignments();
    } catch (error) {
      console.error('Error accepting assignment:', error);
      alert('Failed to accept assignment.');
    }
  };

  const handleRejectAssignment = async (assignment) => {
    try {
      await responderAPI.updateStatus(assignment.id, {
        vehicleStatus: "AVAILABLE",
        assignmentStatus: "REJECTED",
        incidentStatus: "PENDING"
      });
      await loadAssignments();
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      alert('Failed to reject assignment.');
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await responderAPI.getAllAssignments(0, MAX_ITEMS);
      setAssignments(response.data);
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ECONNABORTED') {
        return;
      }
      console.error('Error loading assignments:', error);
    }
  };

  const handleAssignmentClick = (assignment) => {
    if (assignment.status === 'ACTIVE') {
      setSelectedAssignment(assignment);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedAssignment(null);
    loadAssignments();
  };

  if (loading) {
    return (
      <div className="responder-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="responder-dashboard">
        <div className="error-container">
          <p>Error: {error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show assignment details view
  if (selectedAssignment) {
    return (
      <div className="responder-dashboard">
        <AssignmentDetails
          assignment={selectedAssignment}
          profile={profile}
          onBack={handleBackToDashboard}
        />
      </div>
    );
  }

  // Show dashboard view with notifications panel
  return (
    <div className="responder-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Emergency Responder</h1>
          <div className="connection-status">
            <div className={`status-dot ${wsConnected ? 'connected' : 'disconnected'}`} />
            <span>{wsConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {profile && (
          <div className="header-right">
            <div className="profile-info">
              <div className="profile-name">{profile.name}</div>
              {profile.assignedVehicle && (
                <div className="vehicle-info">
                  Vehicle: {profile.assignedVehicle.type} #{profile.assignedVehicle.id}
                  <span
                    className="vehicle-status"
                    style={{
                      backgroundColor: getStatusColor(profile.assignedVehicle.status)
                    }}
                  >
                    {profile.assignedVehicle.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Split into notifications and assignments */}
      <div className="dashboard-main">
        {/* Right Side - Assignments */}
        <div className="dashboard-assignments">
          <div className="content-header">
            <h2>Your Assignments</h2>
            <button className="refresh-btn" onClick={loadAssignments}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
              Refresh
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="no-assignments">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <h3>No Assignments</h3>
              <p>You don't have any assignments yet.</p>
            </div>
          ) : (
            <div className="assignments-grid">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onClick={() => handleAssignmentClick(assignment)}
                  onAccept={handleAcceptAssignment}
                  onReject={handleRejectAssignment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    AVAILABLE: 'var(--status-available)',
    ON_ROUTE: 'var(--status-on-route)',
    RESOLVING: 'var(--status-resolving)',
  };
  return colors[status] || 'var(--status-offline)';
};

export default ResponderDashboard;