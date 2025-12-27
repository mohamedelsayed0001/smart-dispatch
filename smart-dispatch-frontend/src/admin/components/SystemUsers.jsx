import { useState } from 'react';
import { Search, MoreVertical, X } from 'lucide-react';
import { updateUserRole } from './../api.js';
import '../styles/SystemUsers.css';

const SystemUsers = ({ users, totalPages, currentPage, setCurrentPage, userFilter, setUserFilter, searchQuery, setSearchQuery, onRefresh }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [promoteModal, setPromoteModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  const handlePromote = (user) => {
    setPromoteModal(user);
    setSelectedRole(user.role);
    setOpenMenuId(null);
  };

  const confirmPromotion = async () => {
    try {
      await updateUserRole(promoteModal.id, selectedRole);
      setPromoteModal(null);
      // Refresh the users list
      onRefresh();
    } catch (error) {
      alert('Failed to promote user: ' + error.message);
    }
  };

  return (
    <div className="view-container">
      <h1 className="page-title">System Users</h1>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {['all', 'admin', 'dispatcher', 'operator', 'citizen'].map(filter => (
            <button
              key={filter}
              onClick={() => setUserFilter(filter)}
              className={userFilter === filter ? 'filter-btn filter-btn-active' : 'filter-btn'}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              {/* <th>Status</th> */}
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.name.split(' ').map(n => n[0]).join('')}</div>
                    <span className="user-name">{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>{user.joinedDate}</td>
                <td>
                  <div className="action-menu">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      className="action-btn"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openMenuId === user.id && (
                      <div className="dropdown-menu">
                        <button
                          onClick={() => handlePromote(user)}
                          className="dropdown-item"
                        >
                          Promote
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Promote Modal */}
      {promoteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Promote User</h3>
              <button onClick={() => setPromoteModal(null)} className="modal-close">
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-text">Promoting: <span className="modal-highlight">{promoteModal.name}</span></p>
              <p className="modal-text">Current role: <span className="modal-highlight">{promoteModal.role}</span></p>

              <label className="modal-label">New Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="modal-select"
              >
                <option value="CITIZEN">Citizen</option>
                <option value="OPERATOR">Operator</option>
                <option value="DISPATCHER">Dispatcher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setPromoteModal(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmPromotion}
                className="btn btn-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemUsers;
