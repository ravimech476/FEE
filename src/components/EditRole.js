import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditRole.css';
import apiService from '../services/apiService';

const EditRole = () => {
  const { id: roleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      invoice_to_delivery: { view: false }
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
    invoice_to_delivery: 'Invoice to Delivery'
  };

  const operationLabels = {
    view: 'View'
  };

  useEffect(() => {
    fetchRole();
  }, [roleId]);

  const fetchRole = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching role with ID:', roleId);
      
      const response = await apiService.getRole(roleId);
      console.log('Role API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null response');
      
      // Handle different response structures
      let role;
      if (response && response.success && response.data) {
        role = response.data;
        console.log('Using response.data:', role);
      } else if (response && response.id && response.role_name) {
        role = response;
        console.log('Using response directly:', role);
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Unable to load role data - unexpected response format');
      }
      
      console.log('Final role data:', role);
      console.log('Role permissions:', role.permissions);
      console.log('Permissions type:', typeof role.permissions);
      
      // Parse permissions if they're a string
      let permissions = role.permissions;
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
          console.log('Parsed permissions from string:', permissions);
        } catch (parseError) {
          console.error('Failed to parse permissions string:', parseError);
          console.error('Permissions string was:', role.permissions);
          throw new Error('Invalid permissions format in role data');
        }
      }
      
      if (!permissions || typeof permissions !== 'object') {
        console.error('Permissions is not a valid object:', permissions);
        throw new Error('Role permissions are not properly formatted');
      }
      
      // Normalize permissions to only include view
      const normalizedPermissions = {};
      Object.keys(moduleLabels).forEach(module => {
        const modulePermission = permissions[module];
        normalizedPermissions[module] = {
          view: (modulePermission && modulePermission.view) || false
        };
        console.log(`Permission for ${module}:`, modulePermission, '→ view:', normalizedPermissions[module].view);
      });
      
      console.log('Final normalized permissions:', normalizedPermissions);
      
      const newFormData = {
        role_name: role.role_name || '',
        description: role.description || '',
        status: role.status || 'active',
        permissions: normalizedPermissions
      };
      
      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
      
    } catch (error) {
      console.error('Error fetching role:', error);
      setError(`Failed to load role: ${error.message}`);
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
    setSaving(true);
    setError(null);
    
    try {
      await apiService.updateRole(roleId, formData);
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/admin/roles');
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/roles');
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

  if (loading) {
    return (
      <div className="edit-role">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading role details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="edit-role">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>Role Updated Successfully!</h2>
          <p>The role "{formData.role_name}" has been updated successfully.</p>
          <p>Redirecting to role management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-role">
      <div className="page-header">
        <div className="header-content">
          <button onClick={handleCancel} className="search-btn">
            ← Back to Role List
          </button>
          <div className="header-info" style={{textAlign: 'center', flex: 1}}>
            <h1>Edit Role</h1>
            <div className="role-meta" style={{float:"right"}}>
              <span className="role-name">{formData.role_name}</span>
              <span className={`status-badge status-${formData.status}`}>
                {formData.status}
              </span>
            </div>
          </div>
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
              placeholder="Enter role name"
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
          <div className="section-header">
            <h3>Module Permissions</h3>
            <div className="permission-summary">
              <span className="permission-count">
                {getPermissionCount(formData.permissions)} permissions enabled
              </span>
            </div>
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
          <button type="button" onClick={handleCancel} className="search-btn">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="search-btn" style={{background: '#007bff'}}>
            {saving ? 'Updating Role...' : 'Update Role'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRole;