import './css/responder.css';

const AssignmentCard = ({ assignment, onClick, onAccept, onReject }) => {
  if (!assignment) return null;


  const getStatusClass = (status) => {
    const statusMap = {
      active: 'status-active',
      pending: 'status-pending',
      completed: 'status-completed',
      canceled: 'status-canceled',
      rejected: 'status-rejected',
    };
    return statusMap[status?.toLowerCase()] || 'status-active';
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
    const diff = Math.floor((now - date) / 1000 / 60); // minutes

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const isClickable = assignment.status === 'ACTIVE';
  const isPending = assignment.status === 'PENDING';

  const handleAcceptClick = (e) => {
    e.stopPropagation();
    if (onAccept) {
      onAccept(assignment);
    }
  };

  const handleRejectClick = (e) => {
    e.stopPropagation();
    if (onReject) {
      onReject(assignment);
    }
  };

  return (
    <div
      className={`assignment-card ${getStatusClass(assignment.status)} ${
        !isClickable && !isPending ? 'disabled' : ''
      }`}
      onClick={isClickable ? onClick : undefined}
      style={{ cursor: isClickable ? 'pointer' : isPending ? 'default' : 'not-allowed' }}
    >

      <div className="assignment-card-body">

        <div className="assignment-meta">

          <div className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
            <span>Vehicle #{assignment.vehicleId}</span>
          </div>

          <div className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <span>
              {formatTime(assignment.timeAssigned)} ({getTimeSince(assignment.timeAssigned)})
            </span>
          </div>
        </div>
      </div>

      <div className="assignment-card-footer">
        <span className={`status-badge ${getStatusClass(assignment.status)}`}>
          {assignment.status}
        </span>
        
        {isPending ? (
          <div className="pending-actions">
            <button 
              className="btn-accept" 
              onClick={handleAcceptClick}
              title="Accept Assignment"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Accept
            </button>
            <button 
              className="btn-reject" 
              onClick={handleRejectClick}
              title="Reject Assignment"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              Reject
            </button>
          </div>
        ) : isClickable ? (
          <button className="view-details-btn">
            View Details
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        ) : (
          <span className="disabled-text">View Only</span>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;