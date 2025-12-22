import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';
import apiService from '../services/apiService';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: filterRole
      };
      const response = await apiService.getUsers(params);
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/${user.id}/edit`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await apiService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleCreateUser = () => {
    navigate('/admin/users/create');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e) => {
    setFilterRole(e.target.value);
    setCurrentPage(1);
  };

  if (loading && users.length === 0) {
    return <div className="user-management"><div className="loading">Loading users...</div></div>;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <button onClick={handleCreateUser} className="search-btn">
          Add New User
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <select value={filterRole} onChange={handleRoleFilter} className="filter-select">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Customer Code</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email_id}</td>
                <td>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || '-'}</td>
                <td>
                  <span className="customer-code">
                    {user.customer_code || '-'}
                  </span>
                </td>
                <td>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span 
                      className="status-dot" 
                      style={{
                        backgroundColor: user.role === 'admin' ? '#dc3545' : 
                                       user.role === 'customer' ? '#28a745' : 
                                       user.role === 'manager' ? '#fd7e14' : '#6f42c1'
                      }}
                    ></span>
                    <span className="status-text">{user.role?.toUpperCase()}</span>
                  </div>
                  {user.userRole && (
                    <div className="custom-role">
                      {user.userRole.role_name}
                    </div>
                  )}
                </td>
                <td>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span 
                      className="status-dot" 
                      style={{
                        backgroundColor: user.status === 'active' ? 'rgb(40, 167, 69)' : '#dc3545'
                      }}
                    ></span>
                    <span className="status-text">{user.status?.toUpperCase()}</span>
                  </div>
                </td>
                <td>{new Date(user.created_date).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <span 
                      onClick={() => handleEdit(user)}
                      className="icon-action"
                      title="Edit User"
                      style={{ cursor: 'pointer' }}
                    >
                      ✏️
                    </span>
                    {/* <span 
                      onClick={() => handleDelete(user.id)}
                      className="icon-action"
                      title={user.status === 'inactive' ? 'User already inactive' : 'Deactivate User'}
                      style={{ 
                        cursor: user.status === 'inactive' ? 'not-allowed' : 'pointer',
                        opacity: user.status === 'inactive' ? 0.4 : 1
                      }}
                    >
                      🚫
                    </span> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserManagement;