import { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen'
  });

  const API_BASE = 'http://localhost:8080/api/check/users';

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setError(null);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setSuccess('User created successfully!');
        setFormData({ name: '', email: '', password: '', role: 'citizen' });
        setShowForm(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to create user');
      }
    } catch (err) {
      setError('Error creating user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setUsers(users.filter(u => u.id !== userId));
          setSuccess('User deleted successfully!');
          if (selectedUser?.id === userId) {
            setSelectedUser(null);
            setUserToken(null);
          }
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError('Failed to delete user');
        }
      } catch (err) {
        setError('Error deleting user: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Get JWT token for user
  const handleGetToken = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${userId}/token`, {
        method: 'POST'
      });

      if (response.ok) {
        const userData = await response.json();
        setSelectedUser(userData);
        setUserToken(userData.jwt);
        setSuccess('JWT token generated!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to get JWT token');
      }
    } catch (err) {
      setError('Error getting JWT token: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy token to clipboard
  const copyTokenToClipboard = () => {
    if (userToken) {
      navigator.clipboard.writeText(userToken);
      setSuccess('Token copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Add User Form */}
      <div className="form-section">
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? 'Cancel' : 'Add New User'}
        </button>

        {showForm && (
          <form onSubmit={handleAddUser} className="user-form">
            <input
              type="text"
              name="name"
              placeholder="User Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="citizen">Citizen</option>
              <option value="operator">Operator</option>
              <option value="dispatcher">Dispatcher</option>
            </select>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        )}
      </div>

      {/* Users List */}
      <div className="users-section">
        <h3>All Users</h3>
        {loading && !users.length ? (
          <p className="loading">Loading users...</p>
        ) : (
          <div className="users-list">
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className={selectedUser?.id === user.id ? 'selected' : ''}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-small btn-info"
                          onClick={() => handleGetToken(user.id)}
                          disabled={loading}
                        >
                          Get JWT
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* JWT Token Display */}
      {selectedUser && (
        <div className="token-section">
          <h3>JWT Token for {selectedUser.name}</h3>
          <div className="token-display">
            <p className="token-text">{userToken}</p>
            <button
              className="btn btn-success"
              onClick={copyTokenToClipboard}
            >
              Copy Token
            </button>
          </div>
          <div className="user-info">
            <p><strong>User ID:</strong> {selectedUser.id}</p>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
