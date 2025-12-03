import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import './styles/Vehicles.css';

const Vehicles = () => {
  
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    type: 'AMBULANCE',
    status: 'AVAILABLE',
    capacity: '',
    operatorId: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);
  
  const token = localStorage.getItem('jwt_token');
  
  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/vehicle/getAllVehicles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vehicles fetched:', data);
        setVehicles(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        alert('Failed to fetch vehicles: ' + errorText);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Failed to fetch vehicles: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingVehicle 
        ? `http://localhost:8080/api/vehicle/edit/${editingVehicle.id}`
        : 'http://localhost:8080/api/vehicle/create';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          operatorId: formData.operatorId ? parseInt(formData.operatorId) : null
        })
      });

      if (response.ok) {
        alert(editingVehicle ? 'Vehicle updated successfully!' : 'Vehicle created successfully!');
        setShowModal(false);
        resetForm();
        fetchVehicles();
      } else {
        const errorText = await response.text();
        alert(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Failed to save vehicle: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/vehicle/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Vehicle deleted successfully!');
        fetchVehicles();
      } else {
        const errorText = await response.text();
        alert(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle: ' + error.message);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      type: vehicle.type,
      status: vehicle.status,
      capacity: vehicle.capacity.toString(),
      operatorId: vehicle.operatorId ? vehicle.operatorId.toString() : ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'AMBULANCE',
      status: 'AVAILABLE',
      capacity: '',
      operatorId: ''
    });
    setEditingVehicle(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add display IDs (1, 2, 3, ...) for frontend only
  const vehiclesWithDisplayId = filteredVehicles.map((vehicle, index) => ({
    ...vehicle,
    displayId: index + 1
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'status-available';
      case 'ONROUTE': return 'status-onroute';
      case 'RESOLVING': return 'status-resolving';
      default: return '';
    }
  };

  const getVehicleTypeDisplay = (type) => {
    const typeMap = {
      'AMBULANCE': '🚑 Ambulance',
      'FIRETRUCK': '🚒 Fire Truck',
      'POLICE': '🚓 Police Car'
    };
    return typeMap[type] || type;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'AVAILABLE': 'Available',
      'ONROUTE': 'On Route',
      'RESOLVING': 'Resolving'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="vehicles-container">
      <div className="vehicles-header">
        <h1 className="page-title">Vehicle Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      <div className="vehicles-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="vehicles-table-container">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Capacity</th>
              <th>Operator ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehiclesWithDisplayId.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No vehicles found</td>
              </tr>
            ) : (
              vehiclesWithDisplayId.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.displayId}</td>
                  <td>{getVehicleTypeDisplay(vehicle.type)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(vehicle.status)}`}>
                      {getStatusDisplay(vehicle.status)}
                    </span>
                  </td>
                  <td>{vehicle.capacity}</td>
                  <td>{vehicle.operatorId || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => handleEdit(vehicle)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => handleDelete(vehicle.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Vehicle Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="AMBULANCE">🚑 Ambulance</option>
                  <option value="FIRETRUCK">🚒 Fire Truck</option>
                  <option value="POLICE">🚓 Police Car</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ONROUTE">On Route</option>
                  <option value="RESOLVING">Resolving</option>
                </select>
              </div>

              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 4"
                  min="1"
                  max="20"
                  required
                />
              </div>

              <div className="form-group">
                <label>Operator ID (Optional)</label>
                <input
                  type="number"
                  value={formData.operatorId}
                  onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                  placeholder="Leave empty if no operator assigned"
                  min="1"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;