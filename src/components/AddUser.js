import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddUser.css';
import apiService from '../services/apiService';

const AddUser = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await apiService.getActiveRoles();
      setRoles(response || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
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
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
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
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        customer_code: formData.customer_code,
        role: formData.role,
        role_id: formData.role_id || null,
        status: formData.status
      };

      await apiService.createUser(userData);
      navigate('/admin/users');
    } catch (error) {
      setError(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/users');
  };

  return (
    <div className="add-user-page">
      <div className="add-user-header">
        <button onClick={handleBack} className="search-btn">
          ← Back to Users
        </button>
        <h1 className="add-user-title">Create New User</h1>
      </div>

      {error && <div className="add-user-error-message">{error}</div>}

      <div className="add-user-form-container">
        <form onSubmit={handleSubmit} className="add-user-form">
          
          {/* Basic Information */}
          <div className="add-user-section">
            <h3 className="add-user-section-title">Basic Information</h3>
            <div className="add-user-form-row">
              <div className="add-user-form-group">
                <label className="add-user-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter username"
                  disabled={loading}
                  className="add-user-input"
                />
              </div>
              <div className="add-user-form-group">
                <label className="add-user-label">Email *</label>
                <input
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                  disabled={loading}
                  className="add-user-input"
                />
              </div>
              <div className="add-user-form-group">
                <label className="add-user-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  disabled={loading}
                  className="add-user-input"
                />
              </div>
            </div>

            <div className="add-user-form-row">
              <div className="add-user-form-group">
                <label className="add-user-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  disabled={loading}
                  className="add-user-input"
                />
              </div>
              <div className="add-user-form-group">
                <label className="add-user-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  disabled={loading}
                  className="add-user-input"
                />
              </div>
              <div className="add-user-form-group">
                <label className="add-user-label">Customer Code</label>
                <div className="add-user-customer-code-input">
                  <input
                    type="text"
                    name="customer_code"
                    value={formData.customer_code}
                    onChange={handleInputChange}
                    placeholder="Enter customer code"
                    disabled={loading}
                    className="add-user-input"
                  />
                  <button 
                    type="button" 
                    onClick={generateCustomerCode}
                    className="search-btn"
                    disabled={loading}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="add-user-section">
            <h3 className="add-user-section-title">Security Information</h3>
            <div className="add-user-form-row">
              <div className="add-user-form-group">
                <label className="add-user-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter password"
                  disabled={loading}
                  minLength="6"
                  className="add-user-input"
                />
              </div>
              <div className="add-user-form-group">
                <label className="add-user-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm password"
                  disabled={loading}
                  minLength="6"
                  className="add-user-input"
                />
              </div>
              <div className="add-user-form-group">
                <label className="add-user-label">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="add-user-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="add-user-section">
            <h3 className="add-user-section-title">Role & Permissions</h3>
            <div className="add-user-form-row">
              <div className="add-user-form-group">
                <label className="add-user-label">System Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="add-user-select"
                >
                  <option value="customer">Customer</option>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="add-user-form-group">
                <label className="add-user-label">Custom Role</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="add-user-select"
                >
                  <option value="">Select Custom Role (Optional)</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="add-user-form-group">
                {/* Empty space for visual balance */}
                <div className="add-user-hidden-placeholder">
                  <label>&nbsp;</label>
                  <input type="text" disabled />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="add-user-form-actions">
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
            >
              {loading ? (
                <>
                  <span className="add-user-spinner"></span>
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;