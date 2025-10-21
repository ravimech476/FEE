import React, { useState, useEffect } from 'react';
import './RoleManagement.css';
import apiService from '../services/apiService';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    status: 'active',
    permissions: {
      dashboard: { view: false },
      users: { view: false },
      roles: { view: false },
      products: { view: false },
      orders: { view: false },
      meetings: { view: false },
      market_reports: { view: false },
      payments: { view: false }
    }
  });

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
    view: 'View'
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, searchTerm]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };
      const response = await apiService.getRoles(params);
      setRoles(response.roles || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (module, operation) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [operation]: !prev.permissions[module][operation]
        }
      }
    }));
  };

  const toggleAllPermissions = (module, enable) => {
    const modulePermissions = formData.permissions[module];
    const updatedPermissions = {};
    
    Object.keys(modulePermissions).forEach(operation => {
      updatedPermissions[operation] = enable;
    });

    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: updatedPermissions
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await apiService.updateRole(editingRole.id, formData);
      } else {
        await apiService.createRole(formData);
      }
      setShowModal(false);
      setEditingRole(null);
      resetForm();
      fetchRoles();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      role_name: role.role_name || '',
      description: role.description || '',
      status: role.status || 'active',
      permissions: role.permissions || {
        dashboard: { view: false },
        users: { view: false },
        roles: { view: false },
        products: { view: false },
        orders: { view: false },
        meetings: { view: false },
        market_reports: { view: false },
        payments: { view: false }
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (roleId) => {
    if (window.confirm('Are you sure you want to deactivate this role?')) {
      try {
        await apiService.deleteRole(roleId);
        fetchRoles();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      role_name: '',
      description: '',
      status: 'active',
      permissions: {
        dashboard: { view: false },
        users: { view: false },
        roles: { view: false },
        products: { view: false },
        orders: { view: false },
        meetings: { view: false },
        market_reports: { view: false },
        payments: { view: false }
      }
    });
  };

  const openCreateModal = () => {
    setEditingRole(null);
    resetForm();
    setShowModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getPermissionCount = (permissions) => {
    let count = 0;
    Object.values(permissions || {}).forEach(modulePerms => {
      Object.values(modulePerms).forEach(perm => {
        if (perm) count++;
      });
    });
    return count;
  };

  const getTotalPermissionCount = () => {
    let count = 0;
    Object.values(moduleLabels).forEach(module => {
      count += 1; // Only view permission for all modules
    });
    return count;
  };

  if (loading && roles.length === 0) {
    return <div className="role-management"><div className="loading">Loading roles...</div></div>;
  }

  return (
    <div className="role-management">
      <div className="page-header">
        <h1>Role Management</h1>
        <button onClick={openCreateModal} className="search-btn">
          Create New Role
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Roles Table */}
      <div className="table-container">
        <table className="roles-table">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
              <th>Permissions</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>
                  <div className="role-name">
                    {role.role_name}
                  </div>
                </td>
                <td>
                  <div className="role-description">
                    {role.description || '-'}
                  </div>
                </td>
                <td>
                  <div className="permissions-summary">
                    <span className="permission-count">
                      {getPermissionCount(role.permissions)} of {getTotalPermissionCount()}
                    </span>
                    <div className="permission-modules">
                      {Object.entries(role.permissions || {}).map(([module, perms]) => {
                        const enabledOps = Object.entries(perms).filter(([_, enabled]) => enabled);
                        if (enabledOps.length === 0) return null;
                        
                        return (
                          <div key={module} className="permission-module">
                            <span className="module-name">{moduleLabels[module]}</span>
                            <div className="module-operations">
                              {enabledOps.map(([operation, _]) => (
                                <span key={operation} className="operation-tag">
                                  {operationLabels[operation]}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
                        backgroundColor: role.status === 'active' ? 'rgb(40, 167, 69)' : '#dc3545'
                      }}
                    ></span>
                    <span className="status-text">{role.status?.toUpperCase()}</span>
                  </div>
                </td>
                <td>{new Date(role.created_date).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(role)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(role.id)}
                      className="btn btn-sm btn-danger"
                      disabled={role.status === 'inactive'}
                    >
                      Deactivate
                    </button>
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

      {/* Role Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  name="role_name"
                  value={formData.role_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter role name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter role description"
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Module Permissions</label>
                <div className="permissions-matrix">
                  {Object.entries(moduleLabels).map(([module, label]) => (
                    <div key={module} className="permission-module-section">
                      <div className="module-header">
                        <h4>{label}</h4>
                        <div className="module-actions">
                          <button
                            type="button"
                            onClick={() => toggleAllPermissions(module, true)}
                            className="toggle-btn enable-all"
                          >
                            Enable All
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAllPermissions(module, false)}
                            className="toggle-btn disable-all"
                          >
                            Disable All
                          </button>
                        </div>
                      </div>
                      <div className="permissions-grid">
                        {Object.entries(formData.permissions[module]).map(([operation, enabled]) => (
                          <div key={operation} className="permission-item">
                            <label className="permission-label">
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={() => handlePermissionChange(module, operation)}
                              />
                              <span className="checkmark"></span>
                              {operationLabels[operation]}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;