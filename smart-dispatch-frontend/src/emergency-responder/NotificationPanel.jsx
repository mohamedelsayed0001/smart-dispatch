import { useState } from 'react';
import './css/responder.css';

const NotificationPanel = ({ newAssignments, onAccept, onReject, loading }) => {
  const [expandedNotification, setExpandedNotification] = useState(null);

  const getNotificationIcon = (type) => {
    const icons = {
      medical: '🚑',
      fire: '🚒',
      police: '🚓',
    };
    return icons[type?.toLowerCase()] || '🚨';
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

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSince = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleAccept = (assignment) => {
    onAccept(assignment);
    setExpandedNotification(null);
  };

  const handleReject = (assignment) => {
    onReject(assignment);
    setExpandedNotification(null);
  };

  const toggleExpand = (assignmentId) => {
    setExpandedNotification(
      expandedNotification === assignmentId ? null : assignmentId
    );
  };

  if (newAssignments.length === 0) {
    return (
      <div className="notification-panel">
        <div className="panel-header">
          <h2>Notifications</h2>
          <span className="notification-count">0</span>
        </div>
        <div className="no-notifications">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <p>No new notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-panel">
      <div className="panel-header">
        <h2>Notifications</h2>
        <span className="notification-count">{newAssignments.length}</span>
      </div>

      <div className="notifications-list">
        {newAssignments.map((notification) => {
          const { incident, assignment } = notification;
          const isExpanded = expandedNotification === notification.id;

          return (
            <div
              key={notification.id}
              className={`notification-item ${isExpanded ? 'expanded' : ''}`}
            >
              <div
                className="notification-header"
                onClick={() => toggleExpand(notification.id)}
              >
                <div className="notification-type">
                  <span className="type-icon">
                    {getNotificationIcon(incident?.type)}
                  </span>
                  <div className="notification-info">
                    <span className="type-text">{incident?.type || 'Unknown'}</span>
                    <span className="notification-time">
                      {getTimeSince(notification.timeSent)}
                    </span>
                  </div>
                </div>
                <span className={`badge ${getSeverityClass(incident?.level)}`}>
                  {incident?.level || 'Unknown'}
                </span>
              </div>

              {isExpanded && (
                <div className="notification-body">
                  <div className="notification-description">
                    {incident?.description || 'No description available'}
                  </div>

                  <div className="notification-details">
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span>
                        {incident?.latitude?.toFixed(4)}, {incident?.longitude?.toFixed(4)}
                      </span>
                    </div>

                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span>Vehicle #{assignment?.vehicleId}</span>
                    </div>

                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      <span>{formatTime(notification.timeSent)}</span>
                    </div>
                  </div>

                  <div className="notification-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleReject(notification)}
                      disabled={loading}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAccept(notification)}
                      disabled={loading}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationPanel;