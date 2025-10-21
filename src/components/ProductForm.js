import React, { useState, useEffect } from 'react';
import './ProductForm.css';
import apiService from '../services/apiService';

const ProductForm = ({ onClose, product = null }) => {
  const [formData, setFormData] = useState({
    product_number: '',
    product_name: '',
    product_short_description: '',
    uom: '',
    priority: '',
    product_long_description: '',
    product_group: 'Auto Complete',
    additional: '',
    additional2: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        product_number: product.product_number || '',
        product_name: product.product_name || '',
        product_short_description: product.product_short_description || '',
        uom: product.uom || '',
        priority: product.priority || '',
        product_long_description: product.product_long_description || '',
        product_group: product.product_group || 'Auto Complete',
        additional: product.additional || '',
        additional2: product.additional2 || '',
        status: product.status || 'active'
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_number.trim()) {
      newErrors.product_number = 'Product Number is required';
    }

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product Name is required';
    }

    if (!formData.product_short_description.trim()) {
      newErrors.product_short_description = 'Short Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      if (product) {
        // Update existing product
        response = await apiService.updateProduct(product.id, formData);
      } else {
        // Create new product
        response = await apiService.createProduct(formData);
      }

      if (response.success) {
        alert(product ? 'Product updated successfully!' : 'Product created successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      
      // Handle validation errors from API
      if (error.message.includes('validation') || error.message.includes('already exists')) {
        alert(error.message);
      } else {
        alert('Failed to save product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="jasmine-product-form-overlay">
      <div className="jasmine-product-form-container">
        <div className="jasmine-form-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="jasmine-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="jasmine-product-form">
          <div className="jasmine-form-grid">
            <div className="jasmine-form-row">
              <div className="jasmine-form-group">
                <label htmlFor="product_number" className="jasmine-form-label">
                  Product Number *
                </label>
                <input
                  type="text"
                  id="product_number"
                  name="product_number"
                  value={formData.product_number}
                  onChange={handleInputChange}
                  className={`jasmine-form-input ${errors.product_number ? 'error' : ''}`}
                  placeholder="Enter product number"
                  disabled={isSubmitting}
                />
                {errors.product_number && <span className="jasmine-error-message">{errors.product_number}</span>}
              </div>

              <div className="jasmine-form-group">
                <label htmlFor="product_name" className="jasmine-form-label">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="product_name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className={`jasmine-form-input ${errors.product_name ? 'error' : ''}`}
                  placeholder="Enter product name"
                  disabled={isSubmitting}
                />
                {errors.product_name && <span className="jasmine-error-message">{errors.product_name}</span>}
              </div>
            </div>

            <div className="jasmine-form-group">
              <label htmlFor="product_short_description" className="jasmine-form-label">
                Short Description *
              </label>
              <textarea
                id="product_short_description"
                name="product_short_description"
                value={formData.product_short_description}
                onChange={handleInputChange}
                className={`jasmine-form-input jasmine-form-textarea ${errors.product_short_description ? 'error' : ''}`}
                placeholder="Enter short description"
                rows="4"
                disabled={isSubmitting}
              />
              {errors.product_short_description && <span className="jasmine-error-message">{errors.product_short_description}</span>}
            </div>

            <div className="jasmine-form-row">
              <div className="jasmine-form-group">
                <label htmlFor="uom" className="jasmine-form-label">
                  UOM (Unit of Measurement)
                </label>
                <input
                  type="text"
                  id="uom"
                  name="uom"
                  value={formData.uom}
                  onChange={handleInputChange}
                  className="jasmine-form-input"
                  placeholder="e.g., kg, nos, pieces"
                  disabled={isSubmitting}
                />
              </div>

              <div className="jasmine-form-group">
                <label htmlFor="priority" className="jasmine-form-label">
                  Priority
                </label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="jasmine-form-input"
                  placeholder="Enter priority (0-10)"
                  min="0"
                  max="10"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="jasmine-form-group">
              <label htmlFor="product_long_description" className="jasmine-form-label">
                Long Description
              </label>
              <textarea
                id="product_long_description"
                name="product_long_description"
                value={formData.product_long_description}
                onChange={handleInputChange}
                className="jasmine-form-input jasmine-form-textarea"
                placeholder="Enter detailed description"
                rows="6"
                disabled={isSubmitting}
              />
            </div>

            <div className="jasmine-form-row">
              <div className="jasmine-form-group">
                <label className="jasmine-form-label">Image 1</label>
                <div className="jasmine-file-upload">
                  <button type="button" className="jasmine-upload-btn" disabled={isSubmitting}>
                    Upload Jpeg, PNG
                  </button>
                </div>
              </div>

              <div className="jasmine-form-group">
                <label className="jasmine-form-label">Image 2</label>
                <div className="jasmine-file-upload">
                  <button type="button" className="jasmine-upload-btn" disabled={isSubmitting}>
                    Upload Jpeg, PNG
                  </button>
                </div>
              </div>
            </div>

            <div className="jasmine-form-row">
              <div className="jasmine-form-group">
                <label htmlFor="product_group" className="jasmine-form-label">
                  Product Group
                </label>
                <select
                  id="product_group"
                  name="product_group"
                  value={formData.product_group}
                  onChange={handleInputChange}
                  className="jasmine-form-input jasmine-form-select"
                  disabled={isSubmitting}
                >
                  <option value="Auto Complete">Auto Complete</option>
                  <option value="Flowers">Flowers</option>
                  <option value="Herbs">Herbs</option>
                  <option value="Oils">Oils</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="jasmine-form-group">
                <label htmlFor="status" className="jasmine-form-label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="jasmine-form-input jasmine-form-select"
                  disabled={isSubmitting}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="jasmine-form-group">
                <label htmlFor="additional" className="jasmine-form-label">
                  Additional Info
                </label>
                <input
                  type="text"
                  id="additional"
                  name="additional"
                  value={formData.additional}
                  onChange={handleInputChange}
                  className="jasmine-form-input"
                  placeholder="Additional information"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="jasmine-form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="jasmine-btn jasmine-btn-secondary"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              className="jasmine-btn jasmine-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="jasmine-spinner"></span>
                  {product ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;