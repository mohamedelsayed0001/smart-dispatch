import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import './styles/Vehicles.css';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    status: 'Available',
    capacity: '',
    operator_id: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJpZCI6IjE3IiwiZW1haWwiOiJib21iQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZmZmIiwic3ViIjoiMTciLCJpYXQiOjE3NjQ1Mzg0MjAsImV4cCI6MTc2NDYyNDgyMH0.EJBoAUTo3SqLFKanRD2ha0_Cp9Q49IJ0UlvSGZKKirQ";
      
      const response = await fetch('http://localhost:8080/api/vehicle/getAllVehicles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        console.error('Failed to fetch vehicles:', response.status);
        alert('Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      alert('Failed to fetch vehicles: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJpZCI6IjE3IiwiZW1haWwiOiJib21iQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZmZmIiwic3ViIjoiMTciLCJpYXQiOjE3NjQ1Mzg0MjAsImV4cCI6MTc2NDYyNDgyMH0.EJBoAUTo3SqLFKanRD2ha0_Cp9Q49IJ0UlvSGZKKirQ";
      
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
          operator_id: parseInt(formData.operator_id)
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
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJpZCI6IjE3IiwiZW1haWwiOiJib21iQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZmZmIiwic3ViIjoiMTciLCJpYXQiOjE3NjQ1Mzg0MjAsImV4cCI6MTc2NDYyNDgyMH0.EJBoAUTo3SqLFKanRD2ha0_Cp9Q49IJ0UlvSGZKKirQ";
      
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
      operator_id: vehicle.operatorId.toString()
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      status: 'Available',
      capacity: '',
      operator_id: ''
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
      case 'Available': return 'status-available';
      case 'OnRoute': return 'status-onroute';
      case 'Resolving': return 'status-resolving';
      default: return '';
    }
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
                  <td>{vehicle.type}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td>{vehicle.capacity}</td>
                  <td>{vehicle.operatorId}</td>
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
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Ambulance, Fire Truck"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="Available">Available</option>
                  <option value="OnRoute">OnRoute</option>
                  <option value="Resolving">Resolving</option>
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
                  required
                />
              </div>

              <div className="form-group">
                <label>Operator ID *</label>
                <input
                  type="number"
                  value={formData.operator_id}
                  onChange={(e) => setFormData({ ...formData, operator_id: e.target.value })}
                  placeholder="e.g., 1"
                  min="1"
                  required
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