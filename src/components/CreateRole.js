import React, { useState, useEffect } from 'react';
import './CreateRole.css';
import apiService from '../services/apiService';

const CreateRole = ({ onBack, editingRole = null, viewOnly = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    status: 'active',
    permissions: {
      dashboard: { view: false },
      users: { view: false, add: false, edit: false, delete: false },
      roles: { view: false, add: false, edit: false, delete: false },
      products: { view: false, add: false, edit: false, delete: false },
      orders: { view: false, add: false, edit: false, delete: false },
      meetings: { view: false, add: false, edit: false, delete: false },
      market_reports: { view: false, add: false, edit: false, delete: false },
      payments: { view: false, add: false, edit: false, delete: false }
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
    view: 'View',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete'
  };

  const operationDescriptions = {
    view: 'Can view and read data',
    add: 'Can create new records',
    edit: 'Can modify existing records',
    delete: 'Can remove records'
  };

  useEffect(() => {
    if (editingRole) {
      setFormData({
        role_name: editingRole.role_name || '',
        description: editingRole.description || '',
        status: editingRole.status || 'active',
        permissions: editingRole.permissions || {
          dashboard: { view: false },
          users: { view: false, add: false, edit: false, delete: false },
          roles: { view: false, add: false, edit: false, delete: false },
          products: { view: false, add: false, edit: false, delete: false },
          orders: { view: false, add: false, edit: false, delete: false },
          meetings: { view: false, add: false, edit: false, delete: false },
          market_reports: { view: false, add: false, edit: false, delete: false },
          payments: { view: false, add: false, edit: false, delete: false }
        }
      });
    }
  }, [editingRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (module, operation) => {
    if (viewOnly) return;
    
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
    if (viewOnly) return;
    
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

  const toggleAllModulePermissions = (enable) => {
    if (viewOnly) return;
    
    const updatedPermissions = {};
    Object.keys(formData.permissions).forEach(module => {
      updatedPermissions[module] = {};
      Object.keys(formData.permissions[module]).forEach(operation => {
        updatedPermissions[module][operation] = enable;
      });
    });

    setFormData(prev => ({
      ...prev,
      permissions: updatedPermissions
    }));
  };

  const validateForm = () => {
    if (!formData.role_name.trim()) {
      setError('Role name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (viewOnly) return;
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingRole) {
        await apiService.updateRole(editingRole.id, formData);
      } else {
        await apiService.createRole(formData);
      }
      onBack();
    } catch (error) {
      setError(error.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionCount = () => {
    let count = 0;
    Object.values(formData.permissions).forEach(modulePerms => {
      Object.values(modulePerms).forEach(perm => {
        if (perm) count++;
      });
    });
    return count;
  };

  const getTotalPermissionCount = () => {
    let count = 0;
    Object.entries(formData.permissions).forEach(([module, perms]) => {
      count += Object.keys(perms).length;
    });
    return count;
  };

  const getPageTitle = () => {
    if (viewOnly) return 'View Role Details';
    if (editingRole) return 'Edit Role';
    return 'Create New Role';
  };

  return (
    <div className="create-role-page">
      <div className="page-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Roles
        </button>
        <h1>{getPageTitle()}</h1>
        {viewOnly && (
          <div className="view-mode-indicator">
            <span className="view-badge">View Only</span>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="role-form">
          
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  name="role_name"
                  value={formData.role_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter role name"
                  disabled={loading || viewOnly}
                  readOnly={viewOnly}
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  disabled={loading || viewOnly}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter role description"
                disabled={loading || viewOnly}
                readOnly={viewOnly}
              />
            </div>
          </div>

          {/* Permissions Summary */}
          <div className="form-section">
            <h3>Permissions Summary</h3>
            <div className="permissions-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Permissions:</span>
                  <span className="stat-value">{getPermissionCount()} of {getTotalPermissionCount()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Coverage:</span>
                  <span className="stat-value">
                    {Math.round((getPermissionCount() / getTotalPermissionCount()) * 100)}%
                  </span>
                </div>
              </div>
              {!viewOnly && (
                <div className="global-actions">
                  <button
                    type="button"
                    onClick={() => toggleAllModulePermissions(true)}
                    className="global-btn enable-all"
                    disabled={loading}
                  >
                    Enable All Permissions
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllModulePermissions(false)}
                    className="global-btn disable-all"
                    disabled={loading}
                  >
                    Disable All Permissions
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Module Permissions */}
          <div className="form-section">
            <h3>Module Permissions</h3>
            <div className="permissions-matrix">
              {Object.entries(moduleLabels).map(([module, label]) => (
                <div key={module} className="permission-module-section">
                  <div className="module-header">
                    <div className="module-title">
                      <h4>{label}</h4>
                      <span className="module-permissions-count">
                        {Object.values(formData.permissions[module]).filter(Boolean).length} of {Object.keys(formData.permissions[module]).length} enabled
                      </span>
                    </div>
                    {!viewOnly && (
                      <div className="module-actions">
                        <button
                          type="button"
                          onClick={() => toggleAllPermissions(module, true)}
                          className="toggle-btn enable-all"
                          disabled={loading}
                        >
                          Enable All
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAllPermissions(module, false)}
                          className="toggle-btn disable-all"
                          disabled={loading}
                        >
                          Disable All
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="permissions-grid">
                    {Object.entries(formData.permissions[module]).map(([operation, enabled]) => (
                      <div key={operation} className={`permission-item ${enabled ? 'enabled' : 'disabled'}`}>
                        <label className="permission-label">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => handlePermissionChange(module, operation)}
                            disabled={loading || viewOnly}
                          />
                          <span className="checkmark"></span>
                          <div className="permission-details">
                            <span className="permission-name">{operationLabels[operation]}</span>
                            <span className="permission-description">{operationDescriptions[operation]}</span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          {!viewOnly && (
            <div className="form-actions">
              <button 
                type="button" 
                onClick={onBack} 
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    {editingRole ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingRole ? 'Update Role' : 'Create Role'
                )}
              </button>
            </div>
          )}

          {viewOnly && (
            <div className="form-actions">
              <button 
                type="button" 
                onClick={onBack} 
                className="btn btn-secondary"
              >
                Back to Roles
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateRole;