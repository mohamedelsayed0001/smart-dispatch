import { useState } from 'react';
import './css/responder.css';

const StatusControl = ({
  currentStatus,
  assignmentStatus,
  onStatusChange,
  loading,
  onBack
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const statusOptions = [
    { value: 'AVAILABLE', label: 'AVAILABLE', color: 'var(--status-available)', icon: '✓' },
    { value: 'ONROUTE', label: 'En Route', color: 'var(--status-on-route)', icon: '🚗' },
    { value: 'RESOLVING', label: 'At Scene', color: 'var(--status-resolving)', icon: '🔧' },
  ];

  const actions = {
    accept: {
      label: 'Accept Assignment',
      icon: '✓',
      vehicleStatus: 'ONROUTE',
      assignmentStatus: 'ACTIVE',
      color: 'var(--status-available)',
      confirmMessage: 'Accept this assignment and start heading to the incident?',
    },
    arrive: {
      label: 'Mark Arrival',
      icon: '📍',
      vehicleStatus: 'RESOLVING',
      confirmMessage: 'Mark that you have arrived at the scene?',
    },
    complete: {
      label: 'Complete Assignment',
      icon: '✓',
      assignmentStatus: 'COMPLETED',
      color: 'var(--status-available)',
      confirmMessage: 'Mark this assignment as completed? This will resolve the incident.',
    },
  };

  const getAvailableActions = () => {
    const available = [];

    if (assignmentStatus === 'assigned' || !assignmentStatus) {
      available.push(actions.accept);
    }

    if (currentStatus === 'ONROUTE' && assignmentStatus === 'ACTIVE') {
      available.push(actions.arrive);
    }

    if (currentStatus === 'RESOLVING' && assignmentStatus === 'ACTIVE') {
      available.push(actions.complete);
    }

    return available;
  };

  const handleActionClick = (action) => {
    setPendingAction(action);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;

    try {
      await onStatusChange({
        vehicleStatus: pendingAction.vehicleStatus,
        assignmentStatus: pendingAction.assignmentStatus,
      });
      setShowConfirm(false);
      setPendingAction(null);
      if (pendingAction.assignmentStatus == "COMPLETED") {
        onBack()
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingAction(null);
  };

  const getCurrentStatusInfo = () => {
    return statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];
  };

  const availableActions = getAvailableActions();
  const currentStatusInfo = getCurrentStatusInfo();

  return (
    <div className="status-control">
      <div className="current-status">
        <h3 className="status-label">Current Status</h3>
        <div
          className="status-display"
          style={{ borderColor: currentStatusInfo.color }}
        >
          <span className="status-icon">{currentStatusInfo.icon}</span>
          <span className="status-text">{currentStatusInfo.label}</span>
          <div
            className="status-indicator"
            style={{ backgroundColor: currentStatusInfo.color }}
          />
        </div>
      </div>

      {availableActions.length > 0 && (
        <div className="status-actions">
          <h3 className="actions-label">Actions</h3>
          <div className="action-buttons">
            {availableActions.map((action, index) => (
              <button
                key={index}
                className="action-btn"
                onClick={() => handleActionClick(action)}
                disabled={loading}
                style={{ borderColor: action.color }}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-text">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showConfirm && pendingAction && (
        <div className="confirm-modal-overlay" onClick={handleCancel}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header">
              <h3>Confirm Action</h3>
            </div>
            <div className="confirm-body">
              <p>{pendingAction.confirmMessage}</p>
            </div>
            <div className="confirm-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusControl;