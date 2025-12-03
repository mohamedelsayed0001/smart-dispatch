import React, { useState } from 'react';
import './styles/Report.css';

export default function EmergencyReportForm() {
  const [formData, setFormData] = useState({
    type: 'FIRE',
    level: 'HIGH',
    description: '',
    latitude: '',
    longitude: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const authToken = localStorage.getItem('authToken');

      console.log(formData)

      const response = await fetch('http://localhost:8080/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('Report submitted successfully!');
        setFormData({
          type: 'FIRE',
          level: 'HIGH',
          description: '',
          latitude: '',
          longitude: ''
        });
      } else {
        setStatus('Failed to submit report. Please try again.');
      }
    } catch (error) {
      setStatus('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report">
      <div className="form-card">
        <h1 className="form-title">Emergency Report</h1>
        
        <div onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">Emergency Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="FIRE">FIRE</option>
              <option value="MEDICAL">MEDICAL</option>
              <option value="CRIME">CRIME</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="level">Priority Level</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Describe the emergency..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="form-input"
                step="any"
                placeholder="31.2001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="form-input"
                step="any"
                placeholder="29.9187"
                required
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={handleSubmit}
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>

          {status && (
            <div className={`status-message ${status.includes('success') ? 'success' : 'error'}`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}