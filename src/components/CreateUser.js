import React, { useState, useEffect } from 'react';
import './CreateUser.css';
import apiService from '../services/apiService';

const CreateUser = ({ onBack, editingUser = null }) => {
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
    if (editingUser) {
      setFormData({
        username: editingUser.username || '',
        email_id: editingUser.email_id || '',
        password: '',
        confirmPassword: '',
        first_name: editingUser.first_name || '',
        last_name: editingUser.last_name || '',
        phone: editingUser.phone || '',
        customer_code: editingUser.customer_code || '',
        role: editingUser.role || 'customer',
        role_id: editingUser.role_id || '',
        status: editingUser.status || 'active'
      });
    }
  }, [editingUser]);

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
    if (!editingUser && !formData.password) {
      setError('Password is required');
      return false;
    }
    if (!editingUser && formData.password !== formData.confirmPassword) {
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

      if (editingUser) {
        await apiService.updateUser(editingUser.id, userData);
      } else {
        await apiService.createUser(userData);
      }

      onBack();
    } catch (error) {
      setError(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-page">
      <div className="page-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Users
        </button>
        <h1>{editingUser ? 'Edit User' : 'Create New User'}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="user-form">
          
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            {/* Row 1: Username, Email, First Name */}
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 2: Last Name, Phone, Customer Code */}
            <div className="form-row">
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Customer Code</label>
                <div className="customer-code-input">
                  <input
                    type="text"
                    name="customer_code"
                    value={formData.customer_code}
                    onChange={handleInputChange}
                    placeholder="Enter customer code"
                    disabled={loading}
                  />
                  <button 
                    type="button" 
                    onClick={generateCustomerCode}
                    className="generate-btn"
                    disabled={loading}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="form-section">
            <h3>Security Information</h3>
            
            {/* Row 3: Password, Confirm Password, Status */}
            <div className="form-row">
              <div className="form-group">
                <label>Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  placeholder="Enter password"
                  disabled={loading}
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password {editingUser ? '(if changing password)' : '*'}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!editingUser}
                  placeholder="Confirm password"
                  disabled={loading}
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="form-section">
            <h3>Role & Permissions</h3>
            
            {/* Row 4: System Role, Custom Role, Empty space */}
            <div className="form-row">
              <div className="form-group">
                <label>System Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="customer">Customer</option>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Custom Role</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="">Select Custom Role (Optional)</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                {/* Empty space for visual balance - you can add another field here if needed */}
                <div style={{ visibility: 'hidden' }}>
                  <label>&nbsp;</label>
                  <input type="text" disabled style={{ visibility: 'hidden' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
                  {editingUser ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingUser ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;