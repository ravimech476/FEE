import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditProduct.css';
import apiService from '../services/apiService';

const EditProduct = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Dropdown options state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [plantParts, setPlantParts] = useState([]);
  const [procurementMethods, setProcurementMethods] = useState([]);
  const [extractionProcesses, setExtractionProcesses] = useState([]);

  const [formData, setFormData] = useState({
    product_number: '',
    product_name: '',
    product_short_description: '',
    uom: '',
    priority: '',
    product_long_description: '',
    product_group: 'Auto Complete',
    status: 'active',
    // New fields matching database structure
    common_name: '',
    botanical_name: '',
    plant_part: '',
    source_country: '',
    harvest_region_new: [],
    peak_season_enabled: false,
    peak_season_months: [],
    harvest_season_enabled: false,
    harvest_season_months: [],
    material: '',
    procurement_method: [],
    main_components: '',
    sensory_notes: '',
    color_absolute: '',
    extraction_process: '',
    applications_uses: '',
    production_availability: ''
  });

  const [images, setImages] = useState({
    image1: null,
    image2: null,
    harvest_region_image: null
  });

  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    harvest_region_image: null
  });

  const [existingImages, setExistingImages] = useState({
    image1: null,
    image2: null,
    harvest_region_image: null
  });

  const [imageLoadStates, setImageLoadStates] = useState({
    image1: 'loading',
    image2: 'loading',
    harvest_region_image: 'loading'
  });

  const [errors, setErrors] = useState({});

  // Month options for season checkboxes
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    loadDropdownData();
    fetchProduct();
  }, [productId]);

  const loadDropdownData = async () => {
    try {
      // Load countries
      setCountries([
        { code: 'IN', name: 'India' },
        { code: 'CN', name: 'China' },
        { code: 'US', name: 'United States' },
        { code: 'BR', name: 'Brazil' },
        { code: 'ID', name: 'Indonesia' },
        { code: 'PK', name: 'Pakistan' },
        { code: 'BD', name: 'Bangladesh' },
        { code: 'NG', name: 'Nigeria' },
        { code: 'RU', name: 'Russia' },
        { code: 'MX', name: 'Mexico' },
        { code: 'JP', name: 'Japan' },
        { code: 'PH', name: 'Philippines' },
        { code: 'VN', name: 'Vietnam' },
        { code: 'TR', name: 'Turkey' },
        { code: 'EG', name: 'Egypt' },
        { code: 'DE', name: 'Germany' },
        { code: 'IR', name: 'Iran' },
        { code: 'TH', name: 'Thailand' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'FR', name: 'France' },
        { code: 'IT', name: 'Italy' },
        { code: 'ZA', name: 'South Africa' },
        { code: 'MM', name: 'Myanmar' },
        { code: 'KR', name: 'South Korea' },
        { code: 'CO', name: 'Colombia' },
        { code: 'ES', name: 'Spain' },
        { code: 'UA', name: 'Ukraine' },
        { code: 'AR', name: 'Argentina' },
        { code: 'DZ', name: 'Algeria' },
        { code: 'SD', name: 'Sudan' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'LK', name: 'Sri Lanka' },
        { code: 'SG', name: 'Singapore' }
      ]);

      // Load Indian states
      setStates([
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
        'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
      ]);

      // Load plant parts
      setPlantParts([
        'Flower', 'Leaf', 'Root', 'Bark', 'Seed', 'Fruit',
        'Wood', 'Resin', 'Stem', 'Rhizome', 'Bulb', 'Whole Plant',
        'Essential Oil', 'Extract', 'Other'
      ]);

      // Load procurement methods
      setProcurementMethods([
        'Contract Farming', 'Wild Collection', 'Cultivation', 'Direct Purchase',
        'Cooperative', 'Organic Farming', 'Sustainable Harvesting',
        'Import', 'Local Sourcing', 'Other'
      ]);

      // Load extraction processes
      setExtractionProcesses([
        'Solvent Extraction', 'Steam Distillation', 'CO2 Extraction',
        'Cold Press', 'Enfleurage', 'Hydro Distillation', 'Water Distillation',
        'Alcohol Extraction', 'Hexane Extraction', 'Supercritical Fluid Extraction',
        'Expression', 'Maceration', 'Other'
      ]);

    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrors({});
      
      const response = await apiService.getProductById(productId);
      
      let product = null;
      
      if (response) {
        if (response.success && response.data) {
          product = response.data;
        } else if (response.product) {
          product = response.product;
        } else if (response.id) {
          product = response;
        } else {
          throw new Error('Unexpected response format from server');
        }
      }
      
      if (product) {
        // Parse JSON fields
        let harvestRegions = [];
        let peakSeasonMonths = [];
        let harvestSeasonMonths = [];

        try {
          if (product.harvest_region_new) {
            harvestRegions = JSON.parse(product.harvest_region_new);
          }
        } catch (e) {
          console.warn('Failed to parse harvest_region_new:', e);
        }

        try {
          if (product.peak_season_months) {
            peakSeasonMonths = JSON.parse(product.peak_season_months);
          }
        } catch (e) {
          console.warn('Failed to parse peak_season_months:', e);
        }

        try {
          if (product.harvest_season_months) {
            harvestSeasonMonths = JSON.parse(product.harvest_season_months);
          }
        } catch (e) {
          console.warn('Failed to parse harvest_season_months:', e);
        }

        let procurementMethods = [];
        try {
          if (product.procurement_method) {
            procurementMethods = JSON.parse(product.procurement_method);
          }
        } catch (e) {
          // If it's not JSON, it might be old single string format
          if (product.procurement_method && typeof product.procurement_method === 'string') {
            procurementMethods = [product.procurement_method];
          }
          console.warn('Failed to parse procurement_method:', e);
        }

        const newFormData = {
          product_number: product.product_number || '',
          product_name: product.product_name || '',
          product_short_description: product.product_short_description || '',
          uom: product.uom || '',
          priority: product.priority || '',
          product_long_description: product.product_long_description || '',
          product_group: product.product_group || 'Auto Complete',
          status: product.status || 'active',
          // New fields
          common_name: product.common_name || '',
          botanical_name: product.botanical_name || '',
          plant_part: product.plant_part || '',
          source_country: product.source_country || '',
          harvest_region_new: harvestRegions,
          peak_season_enabled: product.peak_season_enabled || false,
          peak_season_months: peakSeasonMonths,
          harvest_season_enabled: product.harvest_season_enabled || false,
          harvest_season_months: harvestSeasonMonths,
          material: product.material || '',
          procurement_method: procurementMethods,
          main_components: product.main_components || '',
          sensory_notes: product.sensory_notes || '',
          color_absolute: product.color_absolute || '',
          extraction_process: product.extraction_process || '',
          applications_uses: product.applications_uses || '',
          production_availability: product.production_availability || ''
        };

        setFormData(newFormData);

        // Set existing images
        const image1Url = product.image1_url || product.product_image1 || null;
        const image2Url = product.image2_url || product.product_image2 || null;
        const harvestRegionImageUrl = product.harvest_region_image_url || product.harvest_region_image || null;
        
        setExistingImages({
          image1: image1Url,
          image2: image2Url,
          harvest_region_image: harvestRegionImageUrl
        });
        
        if (image1Url) {
          setImagePreviews(prev => ({ ...prev, image1: image1Url }));
        }
        if (image2Url) {
          setImagePreviews(prev => ({ ...prev, image2: image2Url }));
        }
        if (harvestRegionImageUrl) {
          setImagePreviews(prev => ({ ...prev, harvest_region_image: harvestRegionImageUrl }));
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && (name === 'peak_season_enabled' || name === 'harvest_season_enabled')) {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // Clear months when disabling
        ...(name === 'peak_season_enabled' && !checked && { peak_season_months: [] }),
        ...(name === 'harvest_season_enabled' && !checked && { harvest_season_months: [] })
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => {
      const currentValues = prev[name] || [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [name]: updatedValues
      };
    });
  };

  const handleMonthChange = (monthType, month) => {
    const monthsField = `${monthType}_months`;
    setFormData(prev => {
      const currentMonths = prev[monthsField] || [];
      const updatedMonths = currentMonths.includes(month)
        ? currentMonths.filter(m => m !== month)
        : [...currentMonths, month];
      
      return {
        ...prev,
        [monthsField]: updatedMonths
      };
    });
  };

  const handleImageChange = (e, imageKey) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError(`Please select a valid image file (JPEG, PNG) for ${imageKey}`);
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError(`Image file size should be less than 5MB for ${imageKey}`);
        return;
      }

      // Update images state
      setImages(prev => ({
        ...prev,
        [imageKey]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({
          ...prev,
          [imageKey]: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      // Clear any existing error
      setError(null);
    }
  };

  const removeImage = (imageKey) => {
    setImages(prev => ({ ...prev, [imageKey]: null }));
    setImagePreviews(prev => ({
      ...prev,
      [imageKey]: null
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_number.trim()) {
      newErrors.product_number = 'CAS Number is required';
    }

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product Name is required';
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
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key.includes('_months') && Array.isArray(formData[key])) {
          // Convert arrays to JSON strings
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'harvest_region_new' && Array.isArray(formData[key])) {
          // Convert harvest_region_new array to JSON string
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'procurement_method' && Array.isArray(formData[key])) {
          // Convert procurement_method array to JSON string
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Append images if they exist
      if (images.image1) {
        submitData.append('image1', images.image1);
      }
      if (images.image2) {
        submitData.append('image2', images.image2);
      }
      if (images.harvest_region_image) {
        submitData.append('harvest_region_image', images.harvest_region_image);
      }

      const response = await apiService.updateProductWithImages(productId, submitData);
      
      if (response.success || response.id) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.message || 'Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleImageLoad = (imageKey) => {
    setImageLoadStates(prev => ({
      ...prev,
      [imageKey]: 'loaded'
    }));
  };

  const handleImageError = (imageKey) => {
    setImageLoadStates(prev => ({
      ...prev,
      [imageKey]: 'error'
    }));
  };

  // Helper function to render image section
  const renderImageSection = (imageKey, imageNumber) => {
    const hasPreview = imagePreviews[imageKey];
    const loadState = imageLoadStates[imageKey];
    
    return (
      <div className="form-group">
        <label>Image {imageNumber}</label>
        <div className="image-upload-container">
          <input
            type="file"
            id={`${imageKey}_edit`}
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => handleImageChange(e, imageKey)}
            className="file-input"
            disabled={saving}
          />
          <label htmlFor={`${imageKey}_edit`} className="upload-btn">
            {hasPreview ? (
              <div className="image-preview">
                <img 
                  src={imagePreviews[imageKey]} 
                  alt={`Product Preview ${imageNumber}`}
                  onLoad={() => handleImageLoad(imageKey)}
                  onError={() => handleImageError(imageKey)}
                  style={{ 
                    opacity: loadState === 'loaded' ? 1 : 0.7,
                    filter: loadState === 'error' ? 'grayscale(100%)' : 'none'
                  }}
                />
                <div className="image-overlay">
                  <span>📁 Change Image</span>
                  {loadState === 'loading' && <div className="image-loading">Loading...</div>}
                  {loadState === 'error' && <div className="image-error">⚠️ Load Error</div>}
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">📁</span>
                <span>Upload Image (JPEG, PNG)</span>
                <small>Maximum file size: 5MB</small>
              </div>
            )}
          </label>
          {hasPreview && (
            <button
              type="button"
              onClick={() => removeImage(imageKey)}
              className="remove-image-btn"
              disabled={saving}
            >
              ✕ Remove
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="edit-product">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="edit-product">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>Product Updated Successfully!</h2>
          <p>The product "{formData.common_name || formData.product_name}" has been updated successfully.</p>
          <p>Redirecting to product list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product">
      <div className="page-header">
        <div className="header-content">
          <button onClick={handleCancel} className="search-btn">
            ← Back to Product List
          </button>
          <div className="header-info" style={{textAlign: 'center', flex: 1}}>
            <h1>Edit Product</h1>
            <div className="product-meta" style={{float: "right"}}>
              <span className="product-number">{formData.product_number}</span>
              <span className={`status-badge status-${formData.status}`}>
                {formData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        {/* Basic Product Information */}
        <div className="form-section">
          <h3>Product Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product_number">CAS Number *</label>
              <input
                type="text"
                id="product_number"
                name="product_number"
                value={formData.product_number}
                onChange={handleInputChange}
                className={`form-control ${errors.product_number ? 'error' : ''}`}
                placeholder="Enter CAS number"
                disabled={saving}
              />
              {errors.product_number && <span className="error-text">{errors.product_number}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="product_name">Product Name *</label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className={`form-control ${errors.product_name ? 'error' : ''}`}
                placeholder="Enter product name"
                disabled={saving}
              />
              {errors.product_name && <span className="error-text">{errors.product_name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product_short_description">Short Description</label>
            <textarea
              id="product_short_description"
              name="product_short_description"
              value={formData.product_short_description}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter short description"
              rows="4"
              disabled={saving}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="uom">UOM (Unit of Measurement)</label>
              <input
                type="text"
                id="uom"
                name="uom"
                value={formData.uom}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g., kg, nos, pieces"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <input
                type="number"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter priority (0-10)"
                min="0"
                max="10"
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product_long_description">Long Description</label>
            <textarea
              id="product_long_description"
              name="product_long_description"
              value={formData.product_long_description}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter detailed description"
              rows="6"
              disabled={saving}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="common_name">Common Name</label>
              <input
                type="text"
                id="common_name"
                name="common_name"
                value={formData.common_name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g., Jasmine"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="botanical_name">Botanical Name</label>
              <input
                type="text"
                id="botanical_name"
                name="botanical_name"
                value={formData.botanical_name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g., Jasminum Grandiflorum (Oleaceae)"
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="material">Material</label>
              <input
                type="text"
                id="material"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter material information"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="plant_part">Part</label>
              <select
                id="plant_part"
                name="plant_part"
                value={formData.plant_part}
                onChange={handleInputChange}
                className="form-control"
                disabled={saving}
              >
                <option value="">Select plant part</option>
                {plantParts.map(part => (
                  <option key={part} value={part}>{part}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="source_country">Source</label>
              <select
                id="source_country"
                name="source_country"
                value={formData.source_country}
                onChange={handleInputChange}
                className="form-control"
                disabled={saving}
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="harvest_region_new">Harvest Region</label>
            <div className="multi-select-container">
              <div className="selected-items">
                {formData.harvest_region_new.length > 0 ? (
                  formData.harvest_region_new.map(region => (
                    <span key={region} className="selected-item">
                      {region}
                      <button
                        type="button"
                        onClick={() => handleMultiSelectChange('harvest_region_new', region)}
                        className="remove-item-btn"
                        disabled={saving}
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="placeholder">Select states/regions</span>
                )}
              </div>
              <div className="dropdown-options">
                {states.map(state => (
                  <label key={state} className="dropdown-option">
                    <input
                      type="checkbox"
                      checked={formData.harvest_region_new.includes(state)}
                      onChange={() => handleMultiSelectChange('harvest_region_new', state)}
                      disabled={saving}
                    />
                    {state}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Harvest Region Image */}
          <div className="form-group">
            <label>Harvest Region Map Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="harvest_region_image_edit"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleImageChange(e, 'harvest_region_image')}
                className="file-input"
                disabled={saving}
              />
              <label htmlFor="harvest_region_image_edit" className="upload-btn">
                {imagePreviews.harvest_region_image ? (
                  <div className="image-preview">
                    <img 
                      src={imagePreviews.harvest_region_image} 
                      alt="Harvest Region Map Preview"
                      onLoad={() => handleImageLoad('harvest_region_image')}
                      onError={() => handleImageError('harvest_region_image')}
                      style={{ 
                        opacity: imageLoadStates.harvest_region_image === 'loaded' ? 1 : 0.7,
                        filter: imageLoadStates.harvest_region_image === 'error' ? 'grayscale(100%)' : 'none'
                      }}
                    />
                    <div className="image-overlay">
                      <span>📁 Change Image</span>
                      {imageLoadStates.harvest_region_image === 'loading' && <div className="image-loading">Loading...</div>}
                      {imageLoadStates.harvest_region_image === 'error' && <div className="image-error">⚠️ Load Error</div>}
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">🗺️</span>
                    <span>Upload Harvest Region Map (JPEG, PNG)</span>
                    <small>Maximum file size: 5MB</small>
                  </div>
                )}
              </label>
              {imagePreviews.harvest_region_image && (
                <button
                  type="button"
                  onClick={() => removeImage('harvest_region_image')}
                  className="remove-image-btn"
                  disabled={saving}
                >
                  ✕ Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Season Information */}
        <div className="form-section">
          <h3>Season Information</h3>
          
          {/* Peak Season */}
          <div className="season-group">
            <div className="season-header">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="peak_season_enabled"
                  checked={formData.peak_season_enabled}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                Peak Season
              </label>
            </div>
            
            {formData.peak_season_enabled && (
              <div className="months-grid">
                {months.map(month => (
                  <label key={`peak-${month}`} className="month-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.peak_season_months.includes(month)}
                      onChange={() => handleMonthChange('peak_season', month)}
                      disabled={saving}
                    />
                    {month}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Harvest Season */}
          <div className="season-group">
            <div className="season-header">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="harvest_season_enabled"
                  checked={formData.harvest_season_enabled}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                Harvest Season
              </label>
            </div>
            
            {formData.harvest_season_enabled && (
              <div className="months-grid">
                {months.map(month => (
                  <label key={`harvest-${month}`} className="month-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.harvest_season_months.includes(month)}
                      onChange={() => handleMonthChange('harvest_season', month)}
                      disabled={saving}
                    />
                    {month}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Production Details */}
        <div className="form-section">
          <h3>Production Details</h3>
          
          <div className="form-group">
            <label htmlFor="procurement_method">Procurement</label>
            <div className="multi-select-container">
              <div className="selected-items">
                {formData.procurement_method.length > 0 ? (
                  formData.procurement_method.map(method => (
                    <span key={method} className="selected-item">
                      {method}
                      <button
                        type="button"
                        onClick={() => handleMultiSelectChange('procurement_method', method)}
                        className="remove-item-btn"
                        disabled={saving}
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="placeholder">Select procurement methods</span>
                )}
              </div>
              <div className="dropdown-options">
                {procurementMethods.map(method => (
                  <label key={method} className="dropdown-option">
                    <input
                      type="checkbox"
                      checked={formData.procurement_method.includes(method)}
                      onChange={() => handleMultiSelectChange('procurement_method', method)}
                      disabled={saving}
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="extraction_process">Extraction Process</label>
              <select
                id="extraction_process"
                name="extraction_process"
                value={formData.extraction_process}
                onChange={handleInputChange}
                className="form-control"
                disabled={saving}
              >
                <option value="">Select extraction process</option>
                {extractionProcesses.map(process => (
                  <option key={process} value={process}>{process}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="main_components">Main Component</label>
            <textarea
              id="main_components"
              name="main_components"
              value={formData.main_components}
              onChange={handleInputChange}
              className="form-control"
              placeholder="e.g., Linalool, Phenyl methyl acetate, Indole, Benzyl benzoate"
              rows="3"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sensory_notes">Sensory Notes</label>
            <textarea
              id="sensory_notes"
              name="sensory_notes"
              value={formData.sensory_notes}
              onChange={handleInputChange}
              className="form-control"
              placeholder="e.g., Sweet, Floral, Fruity, Honey, Waxy, Creamy"
              rows="2"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="color_absolute">Color</label>
            <input
              type="text"
              id="color_absolute"
              name="color_absolute"
              value={formData.color_absolute}
              onChange={handleInputChange}
              className="form-control"
              placeholder="e.g., Light to dark reddish brown with yellow tinge"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="applications_uses">Application / Uses</label>
            <textarea
              id="applications_uses"
              name="applications_uses"
              value={formData.applications_uses}
              onChange={handleInputChange}
              className="form-control"
              placeholder="e.g., Fine Fragrance, Cosmetics, Aromatherapy, Candle Industry"
              rows="2"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="production_availability">Production Availability</label>
            <input
              type="text"
              id="production_availability"
              name="production_availability"
              value={formData.production_availability}
              onChange={handleInputChange}
              className="form-control"
              placeholder="e.g., 2000 Ton. [Flowers]"
              disabled={saving}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="form-section">
          <h3>Additional Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product_group">Product Group</label>
              <select
                id="product_group"
                name="product_group"
                value={formData.product_group}
                onChange={handleInputChange}
                className="form-control"
                disabled={saving}
              >
                <option value="Auto Complete">Auto Complete</option>
                <option value="Flowers">Flowers</option>
                <option value="Herbs">Herbs</option>
                <option value="Oils">Oils</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
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
        </div>

        {/* Product Images */}
        <div className="form-section">
          <h3>Product Images</h3>
          <div className="form-row">
            {renderImageSection('image1', 1)}
            {renderImageSection('image2', 2)}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="search-btn" disabled={saving}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="search-btn" style={{background: '#007bff'}}>
            {saving ? (
              <>
                <span className="spinner"></span>
                Updating Product...
              </>
            ) : (
              'Update Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
