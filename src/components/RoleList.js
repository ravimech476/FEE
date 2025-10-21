import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleList.css';
import apiService from '../services/apiService';

const RoleList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const moduleLabels = {
    dashboard: 'Dashboard',
    users: 'User Management',
    roles: 'Role Management',
    products: 'Product Management',
    orders: 'Order To Cash',
    meetings: 'Meeting Minutes',
    market_reports: 'Market Reports',
    payments: 'Payment Information'
  };

  const operationLabels = {
    view: 'View',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete'
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, searchTerm]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiService.getRoles(params);
      setRoles(response.roles || response.data || []);
      setTotalPages(response.totalPages || Math.ceil((response.total || 0) / 10));
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await apiService.deleteRole(roleId);
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Failed to delete role');
      }
    }
  };

  const handleCreateRole = () => {
    navigate('/admin/roles/create');
  };

  const handleEditRole = (roleId) => {
    navigate(`/admin/roles/${roleId}/edit`);
  };

  const handleViewRole = (roleId) => {
    navigate(`/admin/roles/${roleId}/view`);
  };

  const renderPermissions = (permissions) => {
    if (!permissions || Object.keys(permissions).length === 0) {
      return <span className="no-permissions">No permissions assigned</span>;
    }

    const permissionList = [];
    Object.entries(permissions).forEach(([module, operations]) => {
      if (operations && Object.keys(operations).length > 0) {
        const moduleLabel = moduleLabels[module] || module;
        const allowedOps = Object.entries(operations)
          .filter(([op, allowed]) => allowed)
          .map(([op]) => operationLabels[op] || op);
        
        if (allowedOps.length > 0) {
          permissionList.push(`${moduleLabel}: ${allowedOps.join(', ')}`);
        }
      }
    });

    return permissionList.length > 0 ? (
      <div className="permissions-list">
        {permissionList.slice(0, 3).map((perm, index) => (
          <div key={index} className="permission-item">{perm}</div>
        ))}
        {permissionList.length > 3 && (
          <div className="permission-item more">+{permissionList.length - 3} more</div>
        )}
      </div>
    ) : <span className="no-permissions">No permissions assigned</span>;
  };

  if (loading) {
    return (
      <div className="role-list-container">
        <div className="loading">Loading roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="role-list-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="role-list-container">
      <div className="page-header">
        <h1>Role Management</h1>
        <button className="search-btn" onClick={handleCreateRole}>
          Create New Role
        </button>
      </div>

      <div className="search-controls">
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="roles-table">
        <table>
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No roles found</td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id}>
                  <td className="role-name">{role.role_name || role.name || 'No name'}</td>
                  <td className="role-description">{role.description || 'No description'}</td>
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
                          backgroundColor: role.status === 'active' ? 'rgb(40, 167, 69)' : '#dc3545'
                        }}
                      ></span>
                      <span className="status-text">{role.status?.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="permissions-cell">
                    {renderPermissions(role.permissions)}
                  </td>
                  <td className="actions">
                    <span
                      className="icon-action"
                      onClick={() => handleViewRole(role.id)}
                      title="View Role"
                      style={{ cursor: 'pointer', fontSize: '16px', marginRight: '8px' }}
                    >
                      👁️
                    </span>
                    <span
                      className="icon-action"
                      onClick={() => handleEditRole(role.id)}
                      title="Edit Role"
                      style={{ cursor: 'pointer', fontSize: '16px', marginRight: '8px' }}
                    >
                      ✏️
                    </span>
                    <span
                      className="icon-action"
                      onClick={() => handleDelete(role.id)}
                      title="Delete Role"
                      style={{ cursor: 'pointer', fontSize: '16px' }}
                    >
                      🗑️
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
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
      )}
    </div>
  );
};

export default RoleList;
