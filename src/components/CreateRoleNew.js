import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRoleNew.css';
import apiService from '../services/apiService';

const CreateRoleNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    setLoading(true);
    setError(null);
    
    try {
      await apiService.createRole(formData);
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/admin/roles');
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/roles');
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
    setError(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="create-role">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>Role Created Successfully!</h2>
          <p>The role "{formData.role_name}" has been created successfully.</p>
          <p>Redirecting to role management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-role">
      <div className="page-header">
        <div className="header-content">
          <button onClick={handleCancel} className="search-btn">
            ← Back to Role List
          </button>
          <h1 style={{textAlign: 'center', flex: 1}}>Create New Role</h1>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="role-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="role_name">Role Name *</label>
            <input
              type="text"
              id="role_name"
              name="role_name"
              value={formData.role_name}
              onChange={handleInputChange}
              required
              placeholder="Enter role name (e.g., Sales Manager, Customer Support)"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Enter role description and responsibilities"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <div className="permissions-header">
            <h3>Module Permissions</h3>
            <span className="permissions-count">
              {Object.values(formData.permissions).reduce((total, module) => 
                total + Object.values(module).filter(enabled => enabled).length, 0
              )} permissions enabled
            </span>
          </div>
          <p className="section-description">
            Configure what actions this role can perform in each module
          </p>
          
          <div className="permissions-matrix">
            {Object.entries(moduleLabels).map(([module, label]) => (
              <div key={module} className="permission-module-section">
                <div className="module-header">
                  <h4>
                    <span className="module-icon">📋</span>
                    {label}
                  </h4>
                  <div className="module-actions">
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(module, true)}
                      className="search-btn toggle-btn enable-all"
                      style={{background: '#28a745', fontSize: '11px', padding: '6px 12px'}}
                    >
                      Enable All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(module, false)}
                      className="search-btn toggle-btn disable-all"
                      style={{background: '#dc3545', fontSize: '11px', padding: '6px 12px'}}
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
                          className="permission-checkbox"
                        />
                        <span className="checkmark"></span>
                        <span className="permission-text">{operationLabels[operation]}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={resetForm} className="search-btn" style={{background: '#6c757d'}}>
            Reset Form
          </button>
          <button type="button" onClick={handleCancel} className="search-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="search-btn" style={{background: '#007bff'}}>
            {loading ? 'Creating Role...' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoleNew;