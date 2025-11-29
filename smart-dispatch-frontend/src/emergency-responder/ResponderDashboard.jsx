import { useState, useEffect, useRef } from 'react';
import { responderAPI } from './service/api';
import webSocketService from './service/websocket';
import AssignmentCard from './AssignmentCard';
import AssignmentDetails from './AssignmentDetails';
import './css/responder.css';

const ResponderDashboard = () => {
  // TEMPORARY: Hardcoded responderId for testing - replace with actual auth later
  const RESPONDER_ID = 1; // Change this to test different responders
  
  const [profile, setProfile] = useState(null);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  // Use refs to prevent duplicate initialization
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

      // Load profile and assignments with abort signal
      const [profileRes, assignmentsRes] = await Promise.all([
        responderAPI.getProfile(RESPONDER_ID, signal),
        responderAPI.getActiveAssignments(RESPONDER_ID, signal),
      ]);

      // Check if request was aborted
      if (signal.aborted) return;

      setProfile(profileRes.data);
      setActiveAssignments(assignmentsRes.data);
      
      // Connect to WebSocket
      if (!isConnecting.current) {
        await connectWebSocket(RESPONDER_ID);
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

  const connectWebSocket = async (userId) => {
    if (isConnecting.current) return;
    isConnecting.current = true;

    try {
      await webSocketService.connect(
        userId,
        () => {
          console.log('WebSocket connected');
          setWsConnected(true);
        },
        (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
        }
      );

      // Register message handlers
      webSocketService.onMessage('NEW_ASSIGNMENT', handleNewAssignment);
      webSocketService.onMessage('ASSIGNMENT_CANCELLED', handleAssignmentCancelled);
      webSocketService.onMessage('STATUS_UPDATE', handleStatusUpdate);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setWsConnected(false);
    } finally {
      isConnecting.current = false;
    }
  };

  const handleNewAssignment = (message) => {
    console.log('New assignment received:', message);

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Assignment', {
        body: `New ${message.payload.incident?.type} incident assigned`,
        icon: '/emergency-icon.png',
      });
    }

    // Reload assignments
    loadActiveAssignments();
  };

  const handleAssignmentCancelled = (message) => {
    console.log('Assignment cancelled:', message);

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Assignment Cancelled', {
        body: 'An assignment has been cancelled',
      });
    }

    // Reload assignments
    loadActiveAssignments();
  };

  const handleStatusUpdate = (message) => {
    console.log('Status update:', message);
    // Could update UI without full reload if needed
  };

  const loadActiveAssignments = async () => {
    try {
      const response = await responderAPI.getActiveAssignments(RESPONDER_ID);
      setActiveAssignments(response.data);
    } catch (error) {
      // Ignore cancelled requests
      if (error.name === 'CanceledError' || error.code === 'ECONNABORTED') {
        return;
      }
      console.error('Error loading assignments:', error);
    }
  };

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleBackToDashboard = () => {
    setSelectedAssignment(null);
    loadActiveAssignments(); // Refresh assignments
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

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
      <AssignmentDetails
        assignmentId={selectedAssignment.id}
        responderId={RESPONDER_ID}
        onBack={handleBackToDashboard}
      />
    );
  }

  // Show dashboard view
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

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="content-header">
          <h2>Active Assignments</h2>
          <button className="refresh-btn" onClick={loadActiveAssignments}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
            Refresh
          </button>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="no-assignments">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <h3>No Active Assignments</h3>
            <p>You don't have any active assignments at the moment.</p>
          </div>
        ) : (
          <div className="assignments-grid">
            {activeAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    Available: 'var(--status-available)',
    'On Route': 'var(--status-on-route)',
    Resolving: 'var(--status-resolving)',
  };
  return colors[status] || 'var(--status-offline)';
};

export default ResponderDashboard;