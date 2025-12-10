import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateProduct.css';
import apiService from '../services/apiService';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Dropdown options state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [plantParts, setPlantParts] = useState([]);
  const [procurementMethods, setProcurementMethods] = useState([]);
  const [extractionProcesses, setExtractionProcesses] = useState([]);
  const [sapMaterials, setSapMaterials] = useState([]);

  const [formData, setFormData] = useState({
    product_number: '',
    common_name: '',
    botanical_name: '',
    product_short_description: '',
    product_long_description: '',
    plant_part: '',
    source_country: '',
    harvest_region_new: [],
    peak_season_enabled: false,
    peak_season_months: [],
    harvest_season_enabled: false,
    harvest_season_months: [],
    material: '',
    sap_material_ids: [],
    procurement_method: [],
    main_components: '',
    sensory_notes: '',
    color_absolute: '',
    extraction_process: '',
    applications_uses: '',
    production_availability: '',
    status: 'active'
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

  const [imageErrors, setImageErrors] = useState({
    image1: '',
    image2: ''
  });

  const [errors, setErrors] = useState({});

  // Month options for season checkboxes
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load dropdown data on component mount
  useEffect(() => {
    loadDropdownData();
  }, []);

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
        'Import', 'Local Sourcing', 'Market Procurement','Other'
      ]);

      // Load extraction processes
      setExtractionProcesses([
        'Solvent Extraction', 'Steam Distillation', 'CO2 Extraction',
        'Cold Press', 'Enfleurage', 'Hydro Distillation', 'Water Distillation',
        'Alcohol Extraction', 'Hexane Extraction', 'Supercritical Fluid Extraction',
        'Expression', 'Maceration', 'Other'
      ]);

      // Load SAP Materials from API
      try {
        const sapResponse = await apiService.getActiveSapMaterials();
        if (sapResponse.success && sapResponse.data) {
          setSapMaterials(sapResponse.data);
        }
      } catch (err) {
        console.error('Error loading SAP materials:', err);
      }

    } catch (error) {
      console.error('Error loading dropdown data:', error);
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
      // Clear previous image error
      if (imageKey === 'image1' || imageKey === 'image2') {
        setImageErrors(prev => ({ ...prev, [imageKey]: '' }));
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        if (imageKey === 'image1' || imageKey === 'image2') {
          setImageErrors(prev => ({ ...prev, [imageKey]: 'Please select a valid image file (JPEG, PNG)' }));
        } else {
          setError(`Please select a valid image file (JPEG, PNG) for ${imageKey}`);
        }
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        if (imageKey === 'image1' || imageKey === 'image2') {
          setImageErrors(prev => ({ ...prev, [imageKey]: 'Image file size should be less than 5MB' }));
        } else {
          setError(`Image file size should be less than 5MB for ${imageKey}`);
        }
        return;
      }

      // For image1 and image2, validate dimensions (1100 x 600)
      if (imageKey === 'image1' || imageKey === 'image2') {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          
          const requiredWidth = 1100;
          const requiredHeight = 600;
          
          if (img.width !== requiredWidth || img.height !== requiredHeight) {
            setImageErrors(prev => ({
              ...prev,
              [imageKey]: `Image must be exactly ${requiredWidth} x ${requiredHeight} pixels. Your image is ${img.width} x ${img.height} pixels.`
            }));
            // Reset file input
            e.target.value = '';
            return;
          }
          
          // Dimensions are valid, proceed with upload
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
          setImageErrors(prev => ({ ...prev, [imageKey]: '' }));
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          setImageErrors(prev => ({ ...prev, [imageKey]: 'Failed to load image for validation. Please try again.' }));
        };
        
        img.src = objectUrl;
      } else {
        // For harvest_region_image, no dimension validation
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
    }
  };

  const removeImage = (imageKey) => {
    setImages(prev => ({
      ...prev,
      [imageKey]: null
    }));
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
        } else if (key === 'sap_material_ids' && Array.isArray(formData[key])) {
          // Convert sap_material_ids array to JSON string
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

      const response = await apiService.createProductWithImages(submitData);
      
      if (response.success || response.id) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const resetForm = () => {
    setFormData({
      product_number: '',
      common_name: '',
      botanical_name: '',
      product_short_description: '',
      product_long_description: '',
      plant_part: '',
      source_country: '',
      harvest_region_new: [],
      peak_season_enabled: false,
      peak_season_months: [],
      harvest_season_enabled: false,
      harvest_season_months: [],
      material: '',
      sap_material_ids: [],
      procurement_method: [],
      main_components: '',
      sensory_notes: '',
      color_absolute: '',
      extraction_process: '',
      applications_uses: '',
      production_availability: '',
      status: 'active'
    });
    setImages({
      image1: null,
      image2: null,
      harvest_region_image: null
    });
    setImagePreviews({
      image1: null,
      image2: null,
      harvest_region_image: null
    });
    setErrors({});
    setError(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="create-product">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>Product Created Successfully!</h2>
          <p>The product "{formData.common_name || formData.product_number}" has been created successfully.</p>
          <p>Redirecting to product list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-product">
      <div className="page-header">
        <div className="header-content">
          <button onClick={handleCancel} className="back-btn">
            ← Back to Products
          </button>
          <h1>Add New Product</h1>
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
                required={true}
                disabled={loading}
              />
              {errors.product_number && <span className="error-text">{errors.product_number}</span>}
            </div>

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
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
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
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>SAP Material Numbers</label>
              <div className="multi-select-container">
                <div className="selected-items">
                  {formData.sap_material_ids.length > 0 ? (
                    formData.sap_material_ids.map(id => {
                      const sap = sapMaterials.find(s => s.id === id);
                      return sap ? (
                        <span key={id} className="selected-item">
                          {sap.sap_material_number}
                          <button
                            type="button"
                            onClick={() => handleMultiSelectChange('sap_material_ids', id)}
                            className="remove-item-btn"
                            disabled={loading}
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="placeholder">Select SAP Material Numbers</span>
                  )}
                </div>
                <div className="dropdown-options">
                  {sapMaterials.map(sap => (
                    <label key={sap.id} className="dropdown-option">
                      <input
                        type="checkbox"
                        checked={formData.sap_material_ids.includes(sap.id)}
                        onChange={() => handleMultiSelectChange('sap_material_ids', sap.id)}
                        disabled={loading}
                      />
                      {sap.sap_material_number}
                    </label>
                  ))}
                  {sapMaterials.length === 0 && (
                    <div className="no-options">No SAP Materials available. Add them in Settings.</div>
                  )}
                </div>
              </div>
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
              rows="3"
              disabled={loading}
            />
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
              rows="5"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plant_part">Part</label>
              <select
                id="plant_part"
                name="plant_part"
                value={formData.plant_part}
                onChange={handleInputChange}
                className="form-control"
                disabled={loading}
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
                disabled={loading}
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
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
                          disabled={loading}
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
                        disabled={loading}
                      />
                      {state}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Harvest Region Image */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>Harvest Region Map Image</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="harvest_region_image"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleImageChange(e, 'harvest_region_image')}
                  className="file-input"
                  disabled={loading}
                />
                <label htmlFor="harvest_region_image" className="upload-btn">
                  {imagePreviews.harvest_region_image ? (
                    <div className="image-preview">
                      <img src={imagePreviews.harvest_region_image} alt="Harvest Region Preview" />
                      <div className="image-overlay">
                        <span>📁 Change Image</span>
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
                    disabled={loading}
                  >
                    ✕ Remove
                  </button>
                )}
              </div>
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
                  disabled={loading}
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
                      disabled={loading}
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
                  disabled={loading}
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
                      disabled={loading}
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
                        disabled={loading}
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
                      disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="form-section">
          <h3>Product Images</h3>
          <div className="form-row">
            {/* Image 1 */}
            <div className="form-group">
              <label>Image 1</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="image1"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleImageChange(e, 'image1')}
                  className="file-input"
                  disabled={loading}
                />
                <label htmlFor="image1" className="upload-btn">
                  {imagePreviews.image1 ? (
                    <div className="image-preview">
                      <img src={imagePreviews.image1} alt="Product Preview 1" />
                      <div className="image-overlay">
                        <span>📁 Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📁</span>
                      <span>Upload Image (JPEG, PNG)</span>
                      <small>Required: 1100 x 600 pixels | Max: 5MB</small>
                    </div>
                  )}
                </label>
                {imagePreviews.image1 && (
                  <button
                    type="button"
                    onClick={() => removeImage('image1')}
                    className="remove-image-btn"
                    disabled={loading}
                  >
                    ✕ Remove
                  </button>
                )}
                {imageErrors.image1 && <div className="image-error-text">{imageErrors.image1}</div>}
              </div>
            </div>

            {/* Image 2 */}
            <div className="form-group">
              <label>Image 2</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="image2"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleImageChange(e, 'image2')}
                  className="file-input"
                  disabled={loading}
                />
                <label htmlFor="image2" className="upload-btn">
                  {imagePreviews.image2 ? (
                    <div className="image-preview">
                      <img src={imagePreviews.image2} alt="Product Preview 2" />
                      <div className="image-overlay">
                        <span>📁 Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📁</span>
                      <span>Upload Image (JPEG, PNG)</span>
                      <small>Required: 1100 x 600 pixels | Max: 5MB</small>
                    </div>
                  )}
                </label>
                {imagePreviews.image2 && (
                  <button
                    type="button"
                    onClick={() => removeImage('image2')}
                    className="remove-image-btn"
                    disabled={loading}
                  >
                    ✕ Remove
                  </button>
                )}
                {imageErrors.image2 && <div className="image-error-text">{imageErrors.image2}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={resetForm} className="btn btn-secondary" disabled={loading}>
            Reset Form
          </button>
          <button type="button" onClick={handleCancel} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Product...
              </>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
