import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditUser.css';
import apiService from '../services/apiService';

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email_id: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    customer_code: '',
    role: 'customer',
    role_id: '',
    status: 'active'
  });

  useEffect(() => {
    fetchRoles();
    fetchUser();
  }, [id]);

  const fetchRoles = async () => {
    try {
      const response = await apiService.getActiveRoles();
      setRoles(response || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchUser = async () => {
    try {
      setInitialLoading(true);
      const response = await apiService.getUserById(id);
      console.log('API Response:', response); // Debug log
      
      // Handle both response.user and direct response formats
      const userData = response.user || response;
      
      if (userData && userData.id) {
        setUser(userData);
        setFormData({
          username: userData.username || '',
          email_id: userData.email_id || '',
          password: '',
          confirmPassword: '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          customer_code: userData.customer_code || '',
          role: userData.role || 'customer',
          role_id: userData.role_id || '',
          status: userData.status || 'active'
        });
      } else {
        setError('User data not found');
      }
    } catch (error) {
      setError('Failed to load user data');
      console.error('Error fetching user:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCustomerCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const code = `CUST${timestamp}${random}`;
    setFormData(prev => ({
      ...prev,
      customer_code: code
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email_id.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = {
        username: formData.username,
        email_id: formData.email_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        customer_code: formData.customer_code,
        role: formData.role,
        role_id: formData.role_id || null,
        status: formData.status
      };

      // Only include password if it's provided
      if (formData.password) {
        userData.password = formData.password;
      }

      await apiService.updateUser(id, userData);
      navigate('/admin/users');
    } catch (error) {
      setError(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/users');
  };

  if (initialLoading) {
    return (
      <div className="edit-user-page">
        <div className="edit-user-header">
          <button onClick={handleBack} className="search-btn">
            ← Back to Users
          </button>
          <h1 className="edit-user-title">Edit User</h1>
        </div>
        <div className="edit-user-loading">Loading user data...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="edit-user-page">
        <div className="edit-user-header">
          <button onClick={handleBack} className="search-btn">
            ← Back to Users
          </button>
          <h1 className="edit-user-title">Edit User</h1>
        </div>
        <div className="edit-user-error-message">
          {error || 'User not found'}
        </div>
        <button onClick={handleBack} className="search-btn">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="edit-user-page">
      <div className="edit-user-header">
        <button onClick={handleBack} className="search-btn">
          ← Back to Users
        </button>
        <h1 className="edit-user-title">Edit User</h1>
      </div>

      {error && <div className="edit-user-error-message">{error}</div>}

      <div className="edit-user-form-container">
        <form onSubmit={handleSubmit} className="edit-user-form">
          
          {/* Basic Information */}
          <div className="edit-user-section">
            <h3 className="edit-user-section-title">Basic Information</h3>
            <div className="edit-user-form-row">
              <div className="edit-user-form-group">
                <label className="edit-user-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter username"
                  disabled={loading}
                  className="edit-user-input"
                />
              </div>
              <div className="edit-user-form-group">
                <label className="edit-user-label">Email *</label>
                <input
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                  disabled={loading}
                  className="edit-user-input"
                />
              </div>
              <div className="edit-user-form-group">
                <label className="edit-user-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  disabled={loading}
                  className="edit-user-input"
                />
              </div>
            </div>

            <div className="edit-user-form-row">
              <div className="edit-user-form-group">
                <label className="edit-user-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  disabled={loading}
                  className="edit-user-input"
                />
              </div>
              <div className="edit-user-form-group">
                <label className="edit-user-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  disabled={loading}
                  className="edit-user-input"
                />
              </div>
              <div className="edit-user-form-group">
                <label className="edit-user-label">Customer Code</label>
                <div className="edit-user-customer-code-input">
                  <input
                    type="text"
                    name="customer_code"
                    value={formData.customer_code}
                    onChange={handleInputChange}
                    placeholder="Enter customer code"
                    disabled={loading}
                    className="edit-user-input"
                  />
                  <button 
                    type="button" 
                    onClick={generateCustomerCode}
                    className="search-btn"
                    disabled={loading}
                    style={{background: '#28a745', fontSize: '11px', padding: '10px 14px'}}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="edit-user-section">
            <h3 className="edit-user-section-title">Security Information</h3>
            <div className="edit-user-form-row">
              <div className="edit-user-form-group">
                <label className="edit-user-label">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  disabled={loading}
                  minLength="6"
                  className="edit-user-input"
                />
              </div>
              <div className="edit-user-form-group">
                <label className="edit-user-label">Confirm Password (if changing password)</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  disabled={loading}
                  minLength="6"
                  className="edit-user-input"
                />
              </div>
              <div className="edit-user-form-group">
                <label className="edit-user-label">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="edit-user-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="edit-user-section">
            <h3 className="edit-user-section-title">Role & Permissions</h3>
            <div className="edit-user-form-row">
              <div className="edit-user-form-group">
                <label className="edit-user-label">System Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="edit-user-select"
                >
                  <option value="customer">Customer</option>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="edit-user-form-group">
                <label className="edit-user-label">Custom Role</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="edit-user-select"
                >
                  <option value="">Select Custom Role (Optional)</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="edit-user-form-group">
                {/* Empty space for visual balance */}
                <div className="edit-user-hidden-placeholder">
                  <label>&nbsp;</label>
                  <input type="text" disabled />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="edit-user-form-actions">
            <button 
              type="button" 
              onClick={handleBack} 
              className="search-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="search-btn"
              disabled={loading}
              style={{background: '#007bff'}}
            >
              {loading ? (
                <>
                  <span className="edit-user-spinner"></span>
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;