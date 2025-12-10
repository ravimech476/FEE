import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './SapMaterialList.css';

const AddSapMaterial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    sap_material_number: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sap_material_number.trim()) {
      newErrors.sap_material_number = 'SAP Material Number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.createSapMaterial({
        sap_material_number: formData.sap_material_number.trim(),
        status: formData.status
      });
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/settings/sap-materials');
        }, 1500);
      } else {
        setError(response.message || 'Failed to create SAP Material');
      }
    } catch (err) {
      console.error('Error creating SAP material:', err);
      setError(err.message || 'Failed to create SAP Material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/settings/sap-materials');
  };

  if (success) {
    return (
      <div className="sap-material-form">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>SAP Material Created Successfully!</h2>
          <p>SAP Material Number "{formData.sap_material_number}" has been created.</p>
          <p>Redirecting to list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sap-material-form">
      <div className="page-header">
        <div className="header-left">
          <button onClick={handleCancel} className="back-btn">
            ← Back to SAP Materials
          </button>
          <h1>Add SAP Material Number</h1>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="sap_material_number">SAP Material Number *</label>
            <input
              type="text"
              id="sap_material_number"
              name="sap_material_number"
              value={formData.sap_material_number}
              onChange={handleInputChange}
              className={`form-control ${errors.sap_material_number ? 'error' : ''}`}
              placeholder="Enter SAP Material Number"
              disabled={loading}
              autoFocus
            />
            {errors.sap_material_number && (
              <span className="error-text">{errors.sap_material_number}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-control"
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-cancel" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create SAP Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSapMaterial;
