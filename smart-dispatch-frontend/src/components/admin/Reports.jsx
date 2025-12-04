import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './styles/Reports.css';

// Fix for default markers in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Reports = ({ reports, totalPages, currentPage, setCurrentPage }) => {
  const [selected, setSelected] = useState(null);
  const [showFullMap, setShowFullMap] = useState(false);

  const openDetails = (report) => setSelected(report);
  const closeDetails = () => setSelected(null);

  const formatDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(); } catch(e) { return iso; }
  }

  return (
    <div className="view-container">
      <h1 className="page-title">Reports</h1>

      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={() => setShowFullMap(true)}
          className="btn btn-primary"
        >
          View All Reports on Map
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Report Title</th>
              <th>Type</th>
              <th>Reported</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} onClick={() => openDetails(report)} style={{cursor: 'pointer'}}>
                <td>{report.type ? report.type : (report.title || 'Report')}</td>
                <td>{report.level || report.type || '-'}</td>
                <td>{formatDate(report.timeReported || report.date)}</td>
                <td>
                  <span className={`badge ${report.status === 'RESOLVED' || report.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-primary"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '600px' }}>
            <div className="modal-header">
              <h3>Report Details</h3>
              <button onClick={closeDetails} className="modal-close">✕</button>
            </div>
            <div className="modal-body">
              <p><strong>ID:</strong> {selected.id}</p>
              <p><strong>Type:</strong> {selected.type}</p>
              <p><strong>Level:</strong> {selected.level}</p>
              <p><strong>Reported By:</strong> {selected.reporterName || 'Unknown'}</p>
              <p><strong>Reported At:</strong> {formatDate(selected.timeReported || selected.date)}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <p><strong>Description:</strong></p>
              <p>{selected.description}</p>
              <p><strong>Location:</strong> {selected.latitude}, {selected.longitude}</p>
              
              {selected.latitude && selected.longitude && (
                <div style={{ marginTop: '16px', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                  <MapContainer 
                    center={[selected.latitude, selected.longitude]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <Marker position={[selected.latitude, selected.longitude]}>
                      <Popup>{selected.type} - {selected.level}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={closeDetails} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {showFullMap && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div style={{ width: '95vw', height: '95vh', backgroundColor: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>All Reports Map</h3>
              <button onClick={() => setShowFullMap(false)} className="modal-close">✕</button>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <MapContainer 
                center={[30.0, 31.0]} 
                zoom={10} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {reports.map((report) => {
                  if (!report.latitude || !report.longitude) return null;
                  
                  let color = '#FFD700'; // PENDING = yellow
                  let shape = 'circle';
                  if (report.status === 'ASSIGNED') {
                    color = '#FFA500'; // orange
                    shape = 'square';
                  }
                  if (report.status === 'RESOLVED') {
                    color = '#22C55E'; // green
                    shape = 'diamond';
                  }
                  
                  let svgShape = '';
                  if (shape === 'circle') {
                    svgShape = `<circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>`;
                  } else if (shape === 'square') {
                    svgShape = `<rect x="4" y="4" width="16" height="16" fill="${color}" stroke="white" stroke-width="2"/>`;
                  } else if (shape === 'diamond') {
                    svgShape = `<polygon points="12,4 20,12 12,20 4,12" fill="${color}" stroke="white" stroke-width="2"/>`;
                  }
                  
                  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${svgShape}</svg>`;
                  const iconUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
                  
                  const icon = L.icon({
                    iconUrl: iconUrl,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                  });
                  
                  return (
                    <Marker key={report.id} position={[report.latitude, report.longitude]} icon={icon}>
                      <Popup>{report.type} ({report.status})</Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '12px' }}>Legend: <strong style={{ color: '#FFD700' }}>●</strong> PENDING  <strong style={{ color: '#FFA500' }}>●</strong> ASSIGNED  <strong style={{ color: '#22C55E' }}>●</strong> RESOLVED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
