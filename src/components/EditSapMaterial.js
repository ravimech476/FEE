import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/apiService';
import './SapMaterialList.css';

const EditSapMaterial = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [linkedProducts, setLinkedProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    sap_material_number: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSapMaterialById(id);
      
      if (response.success && response.data) {
        setFormData({
          sap_material_number: response.data.sap_material_number || '',
          status: response.data.status || 'active'
        });
        setLinkedProducts(response.data.products || []);
      } else {
        setError('SAP Material not found');
      }
    } catch (err) {
      console.error('Error fetching SAP material:', err);
      setError('Failed to load SAP Material');
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

    setSaving(true);
    setError(null);

    try {
      const response = await apiService.updateSapMaterial(id, {
        sap_material_number: formData.sap_material_number.trim(),
        status: formData.status
      });
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/settings/sap-materials');
        }, 1500);
      } else {
        setError(response.message || 'Failed to update SAP Material');
      }
    } catch (err) {
      console.error('Error updating SAP material:', err);
      setError(err.message || 'Failed to update SAP Material. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/settings/sap-materials');
  };

  if (loading) {
    return (
      <div className="sap-material-form">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading SAP Material...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="sap-material-form">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>SAP Material Updated Successfully!</h2>
          <p>SAP Material Number "{formData.sap_material_number}" has been updated.</p>
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
          <h1>Edit SAP Material Number</h1>
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
              disabled={saving}
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
              disabled={saving}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Linked Products Section */}
        {linkedProducts.length > 0 && (
          <div className="form-section">
            <h3>Linked Products ({linkedProducts.length})</h3>
            <div className="linked-products-list">
              {linkedProducts.map(product => (
                <div key={product.id} className="linked-product-item">
                  <span className="product-number">{product.product_number}</span>
                  <span className="product-name">{product.product_name || product.common_name}</span>
                </div>
              ))}
            </div>
            <p className="info-text">
              ℹ️ This SAP Material is linked to the products above. Changing its status to "Inactive" will hide it from product forms.
            </p>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-cancel" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={saving}>
            {saving ? 'Saving...' : 'Update SAP Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSapMaterial;
