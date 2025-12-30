import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import '../styles/Vehicles.css';
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api.js';

const Vehicles = ({ vehicles, setVehicles }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'AMBULANCE',
    status: 'AVAILABLE',
    capacity: '',
    operatorId: ''
  });

  // Load vehicles on mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    const data = await fetchVehicles();
    setVehicles(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingVehicle) {
        const result = await updateVehicle(formData, editingVehicle.id);
        if (result.success) {
          setVehicles(
            vehicles.map(v => v.id === editingVehicle.id 
              ? {
                  ...v,
                  ...formData,
                  capacity: parseInt(formData.capacity),
                  operatorId: formData.operatorId ? parseInt(formData.operatorId) : null
                }
              : v
            )
          );
          setShowModal(false);
          resetForm();
        } else {
          console.log(result.error || 'Failed to update vehicle');
        }
      } else {
        const result = await createVehicle(formData);
        if (result.success) {
          await loadVehicles();
          setShowModal(false);
          resetForm();
        } else {
          console.log(result.error || 'Failed to create vehicle');
        }
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    setLoading(true);

    try {
      const result = await deleteVehicle(id);
      if (result.success) {
        setVehicles(vehicles.filter(v => v.id !== id));
      } else {
        console.log(result.error || 'Failed to delete vehicle');
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
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
        <h1 className="page-title">Vehicles</h1>
        <button 
          className="btn-primary" 
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          <Plus size={20} />
          Add Vehicle
        </button>
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
            {loading && vehicles.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">Loading vehicles...</td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No vehicles found</td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.id}</td>
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
                        disabled={loading}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(vehicle.id)}
                        title="Delete"
                        disabled={loading}
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
              <button className="btn-close" onClick={handleCloseModal} disabled={loading}>
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (editingVehicle ? 'Update Vehicle' : 'Create Vehicle')}
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