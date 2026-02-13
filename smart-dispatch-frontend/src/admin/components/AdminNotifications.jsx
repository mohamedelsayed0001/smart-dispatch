import { useState } from 'react';
import './AdminNotifications.css';

const DEFAULT_NOTIFICATION_LIMIT = 10;
const MAX_NOTIFICATION_LIMIT = 40;

export default function AdminNotifications({ 
  notifications = [], 
  onNotificationClick, 
  onMenuOpen, 
  onNewNotification 
}) {
  const [popupNotif, setPopupNotif] = useState(null);
  const [notifLimit, setNotifLimit] = useState(DEFAULT_NOTIFICATION_LIMIT);

  // Sort and limit notifications, keeping only the newest up to notifLimit
  const allNotifications = [...notifications]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, notifLimit);

  const handleNotificationClick = (notif, index) => {
    setPopupNotif(notif);
    if (onNotificationClick) {
      onNotificationClick(notif, index);
    }
  };

  // Handler for limit change
  const handleLimitChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) value = 1;
    if (value > MAX_NOTIFICATION_LIMIT) value = MAX_NOTIFICATION_LIMIT;
    setNotifLimit(value);
    if (onMenuOpen) onMenuOpen(value);
  };

  return (
    <>
      <div style={{ maxWidth: 900, margin: '2em auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <label htmlFor="notif-limit" style={{ marginRight: 8, fontWeight: 500 }}>Show</label>
        <input
          id="notif-limit"
          type="number"
          min={1}
          max={MAX_NOTIFICATION_LIMIT}
          value={notifLimit}
          onChange={handleLimitChange}
          style={{ width: 60, marginRight: 8 }}
        />
        <span style={{ marginRight: 16 }}>notifications (max {MAX_NOTIFICATION_LIMIT})</span>
      </div>
      <div className="admin-notifications-list" style={{ maxWidth: 900, margin: '2em auto' }}>
        {allNotifications.length === 0 ? (
          <div 
            className="notif-empty" 
            style={{ 
              textAlign: 'center', 
              padding: '3em', 
              color: '#999',
              fontSize: '1.1em'
            }}
          >
            No notifications yet.
          </div>
        ) : (
          allNotifications.map((notif, index) => (
            <div 
              key={`${notif.incidentId}-${notif.time}`} 
              className="notif-row" 
              style={{ 
                position: 'relative', 
                marginBottom: '1.5em', 
                background: notif.unread ? '#f8f9ff' : '#f7f7f7',
                border: notif.unread ? '2px solid #4a90e2' : '1px solid #e0e0e0',
                borderRadius: 12, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
                padding: '1.5em 2em', 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => handleNotificationClick(notif, index)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            >
              <div 
                className="notif-header" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5em' 
                }}
              >
                <div 
                  className="notif-type" 
                  style={{ 
                    fontWeight: 700, 
                    fontSize: '1.1em',
                    color: '#333',
                    textTransform: 'capitalize'
                  }}
                >
                  {( 'Incident Alert')
                    .replace(/_/g, ' ')
                    .toUpperCase()}
                </div>
                {/* <div 
                  className="notif-status" 
                  style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: '0.75em',
                    fontWeight: '600',
                    backgroundColor: notif.unread ? '#4a90e2' : '#e0e0e0',
                    color: notif.unread ? '#fff' : '#666'
                  }}
                >
                </div> */}
              </div>
              <div 
                className="notif-msg" 
                style={{
                  marginBottom: '0.5em',
                  color: '#555',
                  fontSize: '0.95em',
                  lineHeight: '1.4'
                }}
              >
                {notif.message}
              </div>
              <div 
                className="notif-time" 
                style={{
                  fontSize: '0.85em',
                  color: '#999'
                }}
              >
                {new Date(notif.time).toLocaleString()}
              </div>
              {notif.unread && (
                <span 
                  className="notif-dot-row" 
                  title="Unread"
                  style={{
                    position: 'absolute',
                    top: '1em',
                    right: '1em',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#4a90e2'
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {popupNotif && (
        <div 
          className="notif-popup" 
          onClick={() => setPopupNotif(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="notif-popup-content" 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: '2em',
              maxWidth: 500,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1em', color: '#333' }}>
              Notification Details
            </h3>
            <div style={{ marginBottom: '0.75em' }}>
              <b>Type:</b> {(popupNotif.type || 'Incident').replace('INCIDENT_', '').replace(/_/g, ' ')}
            </div>
            <div style={{ marginBottom: '0.75em' }}>
              <b>Message:</b> {popupNotif.message}
            </div>
            <div style={{ marginBottom: '0.75em' }}>
              <b>Time:</b> {new Date(popupNotif.time).toLocaleString()}
            </div>
            {popupNotif.incidentId && (
              <div style={{ marginBottom: '0.75em' }}>
                <b>Incident ID:</b> {popupNotif.incidentId}
              </div>
            )}
            {popupNotif.level && (
              <div style={{ marginBottom: '0.75em' }}>
                <b>Level:</b> {popupNotif.level}
              </div>
            )}
            {popupNotif.description && (
              <div style={{ marginBottom: '0.75em' }}>
                <b>Description:</b> {popupNotif.description}
              </div>
            )}
            {popupNotif.latitude && (
              <div style={{ marginBottom: '0.75em' }}>
                <b>Latitude:</b> {popupNotif.latitude}
              </div>
            )}
            {popupNotif.longitude && (
              <div style={{ marginBottom: '0.75em' }}>
                <b>Longitude:</b> {popupNotif.longitude}
              </div>
            )}
            <button 
              onClick={() => setPopupNotif(null)}
              style={{
                marginTop: '1em',
                padding: '0.75em 2em',
                backgroundColor: '#4a90e2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#357abd'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4a90e2'}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}