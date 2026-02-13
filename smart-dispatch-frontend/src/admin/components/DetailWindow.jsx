// Incident type emojis
const INCIDENT_TYPE_EMOJIS = {
  FIRE: '🔥',
  MEDICAL: '🏥',
  ACCIDENT: '🚗',
  CRIME: '🚨',
  OTHER: '⚠️',
  EMERGENCY: '🆘',
  NATURAL_DISASTER: '🌪️',
  HAZMAT: '☢️'
};

// Vehicle type emojis
const VEHICLE_TYPE_EMOJIS = {
  AMBULANCE: '🚑',
  FIRETRUCK: '🚒',
  POLICE: '🚓',
  RESCUE: '🚐',
  OTHER: '🚙'
};

const DetailWindow = ({ item, type, onClose, vehicles, incidents }) => {
  if (!item) return null;

  return (
    <div className="livemap-detail-window">
      <div className="livemap-detail-header">
        <h3>{type === 'incident' ? 'Incident Details' : 'Vehicle Details'}</h3>
        <button onClick={onClose} className="livemap-close-btn">×</button>
      </div>
      <div className="livemap-detail-content">
        {type === 'incident' ? (
          <>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Type:</span>
              <span className="livemap-detail-value">
                {INCIDENT_TYPE_EMOJIS[item.type] || '⚠️'} {item.type || 'N/A'}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Status:</span>
              <span className={`livemap-detail-value livemap-status-${incidents.find(v => v.id === item.id)?.status?.toLowerCase()}`}>
                {incidents.find(v => v.id === item.id)?.status || 'N/A'}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Severity:</span>
              <span className="livemap-detail-value">{item.severity || item.level || 'N/A'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Description:</span>
              <span className="livemap-detail-value">{item.description || 'No description'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Location:</span>
              <span className="livemap-detail-value">
                {item.latitude?.toFixed(6)}, {item.longitude?.toFixed(6)}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Reported:</span>
              <span className="livemap-detail-value">
                {item.reportedAt ? new Date(item.reportedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">ID:</span>
              <span className="livemap-detail-value">{item.id || item.vehicle_id || 'N/A'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Type:</span>
              <span className="livemap-detail-value">
                {VEHICLE_TYPE_EMOJIS[item.type] || '🚙'} {item.type || 'N/A'}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Status:</span>
              <span className={`livemap-detail-value livemap-status-${vehicles.find(v => v.id === item.id).status?.toLowerCase()}`}>
                {vehicles.find(v => v.id === item.id)?.status || 'N/A'}
              </span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Operator ID:</span>
              <span className="livemap-detail-value">{item.operatorId || 'N/A'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Capacity:</span>
              <span className="livemap-detail-value">{item.capacity || 'N/A'}</span>
            </div>
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Location:</span>
              <span className="livemap-detail-value">
                {item.latitude?.toFixed(6) || item.lat?.toFixed(6)},
                {item.longitude?.toFixed(6) || item.lng?.toFixed(6)}
              </span>
            </div>
            {item.assignedTo && (
              <div className="livemap-detail-row">
                <span className="livemap-detail-label">Assigned To:</span>
                <span className="livemap-detail-value">{item.assignedTo}</span>
              </div>
            )}
            <div className="livemap-detail-row">
              <span className="livemap-detail-label">Last Update:</span>
              <span className="livemap-detail-value">
                {item.timestamp ? new Date(item.timestamp).toLocaleString() : (item.lastUpdate ? new Date(item.lastUpdate).toLocaleString() : 'N/A')}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailWindow;