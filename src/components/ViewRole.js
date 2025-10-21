import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewRole.css';
import apiService from '../services/apiService';

const ViewRole = () => {
  const { id: roleId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchRole();
  }, [roleId]);

  const fetchRole = async () => {
    try {
      setLoading(true);
      const roleData = await apiService.getRole(roleId);
      setRole(roleData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/roles');
  };

  const handleEdit = () => {
    navigate(`/admin/roles/${roleId}/edit`);
  };

  const getPermissionCount = (permissions) => {
    let count = 0;
    Object.values(permissions || {}).forEach(modulePerms => {
      // Only count view permissions
      if (modulePerms.view) {
        count++;
      }
    });
    return count;
  };

  const getTotalPermissionCount = () => {
    // All modules have only view permission
    return Object.keys(moduleLabels).length;
  };

  if (loading) {
    return (
      <div className="view-role">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading role details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-role">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={handleBack} className="btn btn-secondary">
            Back to Roles
          </button>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="view-role">
        <div className="error-container">
          <p>Role not found</p>
          <button onClick={handleBack} className="btn btn-secondary">
            Back to Roles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-role">
      <div className="page-header">
        <div className="header-content">
          <button onClick={handleBack} className="back-btn">
            ← Back to Roles
          </button>
          <div className="header-info">
            <h1>{role.role_name}</h1>
            <div className="role-meta">
              <span className={`status-badge status-${role.status}`}>
                {role.status}
              </span>
              <span className="created-date">
                Created: {new Date(role.created_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleEdit} className="btn btn-primary">
            Edit Role
          </button>
        </div>
      </div>

      <div className="role-details">
        <div className="details-section">
          <h3>Basic Information</h3>
          <div className="details-grid">
            <div className="detail-item">
              <label>Role Name</label>
              <span>{role.role_name}</span>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <span className={`status-badge status-${role.status}`}>
                {role.status}
              </span>
            </div>
            <div className="detail-item full-width">
              <label>Description</label>
              <span>{role.description || 'No description provided'}</span>
            </div>
            <div className="detail-item">
              <label>Created Date</label>
              <span>{new Date(role.created_date).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <label>Last Modified</label>
              <span>{role.updated_date ? new Date(role.updated_date).toLocaleString() : 'Never'}</span>
            </div>
          </div>
        </div>

        <div className="permissions-section">
          <div className="section-header">
            <h3>Permissions</h3>
            <div className="permission-summary">
              <span className="permission-count">
                {getPermissionCount(role.permissions)} of {getTotalPermissionCount()} permissions enabled
              </span>
            </div>
          </div>

          <div className="permissions-display">
            {Object.entries(moduleLabels).map(([module, label]) => {
              const modulePermissions = role.permissions?.[module] || {};
              const enabledPermissions = Object.entries(modulePermissions)
                .filter(([operation]) => operation === 'view') // Only count view permissions
                .filter(([_, enabled]) => enabled);
              
              return (
                <div key={module} className="permission-module">
                  <div className="module-header">
                    <h4>
                      <span className="module-icon">📋</span>
                      {label}
                    </h4>
                    <span className="permission-count-badge">
                      {enabledPermissions.length} / 1
                    </span>
                  </div>
                  
                  <div className="permissions-grid">
                    {Object.entries(modulePermissions)
                      .filter(([operation]) => operation === 'view') // Only show view permission
                      .map(([operation, enabled]) => (
                      <div key={operation} className={`permission-item ${enabled ? 'enabled' : 'disabled'}`}>
                        <span className={`permission-indicator ${enabled ? 'granted' : 'denied'}`}>
                          {enabled ? '✓' : '✗'}
                        </span>
                        <span className="permission-text">{operationLabels[operation]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="stats-section">
          <h3>Permission Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{getPermissionCount(role.permissions)}</div>
              <div className="stat-label">Total Permissions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {Object.entries(role.permissions || {}).filter(([_, modulePerms]) => 
                  Object.values(modulePerms).some(perm => perm)
                ).length}
              </div>
              <div className="stat-label">Modules Accessible</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {Object.entries(role.permissions || {}).filter(([_, modulePerms]) => 
                  modulePerms.view
                ).length}
              </div>
              <div className="stat-label">Modules with View Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRole;