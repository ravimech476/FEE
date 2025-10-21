import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CustomerProductView.css';
import apiService from '../services/apiService';

const CustomerProductView = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState({
    image1: 'loading',
    image2: 'loading'
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProductById(productId);
      
      console.log('API Response:', response); // Debug log
      
      let productData = null;
      
      if (response) {
        if (response.success && response.data) {
          productData = response.data;
        } else if (response.product) {
          productData = response.product;
        } else if (response.id) {
          productData = response;
        } else {
          throw new Error('Unexpected response format from server');
        }
      }
      
      console.log('Product Data:', productData); // Debug log
      console.log('Harvest Region Image:', productData?.harvest_region_image); // Debug log
      console.log('Harvest Region Image URL:', productData?.harvest_region_image_url); // Debug log
      
      if (productData) {
        // Only show active products to customers
        if (productData.status !== 'active') {
          throw new Error('Product not available');
        }
        
        setProduct(productData);
        
        // Reset image load states
        const image1 = productData.image1_url || productData.product_image1;
        const image2 = productData.image2_url || productData.product_image2;
        
        setImageLoadStates({
          image1: image1 ? 'loading' : 'loaded',
          image2: image2 ? 'loading' : 'loaded'
        });
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  const handleImageLoad = (imageKey) => {
    setImageLoadStates(prev => ({
      ...prev,
      [imageKey]: 'loaded'
    }));
  };

  const handleImageError = (imageKey) => {
    console.log(`Image ${imageKey} failed to load`);
    setImageLoadStates(prev => ({
      ...prev,
      [imageKey]: 'error'
    }));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const parseJsonField = (field) => {
    if (!field) return [];
    try {
      return JSON.parse(field);
    } catch (e) {
      return [];
    }
  };

  const getCountryName = (countryCode) => {
    const countries = {
      'IN': 'India', 'CN': 'China', 'US': 'United States', 'BR': 'Brazil',
      'ID': 'Indonesia', 'PK': 'Pakistan', 'BD': 'Bangladesh', 'NG': 'Nigeria',
      'RU': 'Russia', 'MX': 'Mexico', 'JP': 'Japan', 'PH': 'Philippines',
      'VN': 'Vietnam', 'TR': 'Turkey', 'EG': 'Egypt', 'DE': 'Germany',
      'IR': 'Iran', 'TH': 'Thailand', 'GB': 'United Kingdom', 'FR': 'France',
      'IT': 'Italy', 'ZA': 'South Africa', 'MM': 'Myanmar', 'KR': 'South Korea',
      'CO': 'Colombia', 'ES': 'Spain', 'UA': 'Ukraine', 'AR': 'Argentina',
      'DZ': 'Algeria', 'SD': 'Sudan', 'CA': 'Canada', 'AU': 'Australia',
      'NL': 'Netherlands', 'MY': 'Malaysia', 'LK': 'Sri Lanka', 'SG': 'Singapore'
    };
    return countries[countryCode] || countryCode;
  };

  const getAvailableImages = () => {
    const images = [];
    const image1Url = getImageUrl(product.image1_url || product.product_image1);
    const image2Url = getImageUrl(product.image2_url || product.product_image2);
    
    if (image1Url) images.push({ url: image1Url, key: 'image1' });
    if (image2Url) images.push({ url: image2Url, key: 'image2' });
    
    return images;
  };

  const handleImageNavigation = (direction) => {
    const images = getAvailableImages();
    if (images.length === 0) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (loading) {
    return (
      <div className="customer-product-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-product-view">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Product Not Available</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="btn btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="customer-product-view">
        <div className="error-container">
          <div className="error-icon">📦</div>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <button onClick={handleBack} className="btn btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const harvestRegions = parseJsonField(product.harvest_region_new);
  const peakSeasonMonths = parseJsonField(product.peak_season_months);
  const harvestSeasonMonths = parseJsonField(product.harvest_season_months);
  const availableImages = getAvailableImages();

  return (
    <div className="customer-product-view">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={handleBack} className="breadcrumb-link">
          ← Back to Products
        </button>
      </div>

      <div className="product-container">
        {/* Product Images */}
        <div className="product-images-section">
          {availableImages.length > 0 ? (
            <>
              <div className="main-image-container">
                <img
                  src={availableImages[currentImageIndex]?.url}
                  alt={product.common_name || product.product_name}
                  className="main-product-image"
                  onLoad={() => handleImageLoad(availableImages[currentImageIndex]?.key)}
                  onError={() => handleImageError(availableImages[currentImageIndex]?.key)}
                  onClick={() => setSelectedImage(availableImages[currentImageIndex]?.url)}
                />
                
                {availableImages.length > 1 && (
                  <>
                    <button 
                      className="image-nav-btn prev-btn"
                      onClick={() => handleImageNavigation('prev')}
                    >
                      ‹
                    </button>
                    <button 
                      className="image-nav-btn next-btn"
                      onClick={() => handleImageNavigation('next')}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              
              {availableImages.length > 1 && (
                <div className="image-thumbnails">
                  {availableImages.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`${product.common_name || product.product_name} ${index + 1}`}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-image-placeholder">
              <span className="no-image-icon">📸</span>
              <p>No images available</p>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">
              {product.common_name || product.product_name}
            </h1>
            
            {product.botanical_name && (
              <p className="botanical-name">
                <em>{product.botanical_name}</em>
              </p>
            )}
            
            <div className="product-meta">
              <span className="product-number">#{product.product_number}</span>
              {product.priority > 5 && (
                <span className="featured-badge">Featured Product</span>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="quick-info">
            {product.plant_part && (
              <div className="info-item">
                <span className="info-label">Part:</span>
                <span className="info-value">{product.plant_part}</span>
              </div>
            )}
            
            {product.source_country && (
              <div className="info-item">
                <span className="info-label">Source:</span>
                <span className="info-value">{getCountryName(product.source_country)}</span>
              </div>
            )}
            
            {product.extraction_process && (
              <div className="info-item">
                <span className="info-label">Process:</span>
                <span className="info-value">{product.extraction_process}</span>
              </div>
            )}
          </div>

          {/* Descriptions */}
          {(product.product_short_description || product.sensory_notes) && (
            <div className="product-descriptions">
              {product.product_short_description && (
                <div className="description-section">
                  <h3>Description</h3>
                  <p className="description-text">{product.product_short_description}</p>
                </div>
              )}
              
              {product.sensory_notes && (
                <div className="description-section">
                  <h3>Sensory Profile</h3>
                  <p className="sensory-text">{product.sensory_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Detailed Information Tabs */}
          <div className="product-details-tabs">
            <div className="tab-content">
              {/* Source & Origin */}
              <div className="detail-section">
                <h3>Source & Origin</h3>
                <div className="detail-grid">
                  {harvestRegions.length > 0 && (
                    <div className="detail-item">
                      <label>Harvest Regions:</label>
                      <div className="region-tags">
                        {harvestRegions.map(region => (
                          <span key={region} className="region-tag">{region}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {product.procurement_method && (
                    <div className="detail-item">
                      <label>Procurement:</label>
                      <span>{product.procurement_method}</span>
                    </div>
                  )}
                  
                  {product.production_availability && (
                    <div className="detail-item">
                      <label>Availability:</label>
                      <span>{product.production_availability}</span>
                    </div>
                  )}
                </div>
                
                {/* Harvest Region Image */}
                <div className="harvest-region-map">
                  <label>Interactive India Harvest Regions Map:</label>
                  {(product.harvest_region_image_url || product.harvest_region_image) ? (
                    <div className="region-map-container">
                      <img
                        src={getImageUrl(product.harvest_region_image_url || product.harvest_region_image)}
                        alt="Harvest Region Map"
                        className="region-map-image"
                        onClick={() => setSelectedImage(getImageUrl(product.harvest_region_image_url || product.harvest_region_image))}
                        onLoad={() => console.log('Harvest region image loaded successfully')}
                        onError={(e) => {
                          console.error('Harvest region image failed to load');
                          console.error('Attempted URL:', e.target.src);
                          e.target.style.display = 'none';
                          // Show error message
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'image-error-message';
                          errorDiv.textContent = 'Failed to load harvest region map image';
                          e.target.parentNode.appendChild(errorDiv);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="region-map-placeholder">
                      <p>No harvest region map image uploaded for this product.</p>
                      <small>Harvest regions: {harvestRegions.join(', ') || 'None selected'}</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Season Information */}
              {(product.peak_season_enabled || product.harvest_season_enabled) && (
                <div className="detail-section">
                  <h3>Seasonal Information</h3>
                  <div className="detail-grid">
                    {product.peak_season_enabled && peakSeasonMonths.length > 0 && (
                      <div className="detail-item">
                        <label>Peak Season:</label>
                        <div className="month-tags">
                          {peakSeasonMonths.map(month => (
                            <span key={month} className="month-tag">{month}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {product.harvest_season_enabled && harvestSeasonMonths.length > 0 && (
                      <div className="detail-item">
                        <label>Harvest Season:</label>
                        <div className="month-tags">
                          {harvestSeasonMonths.map(month => (
                            <span key={month} className="month-tag">{month}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Properties */}
              <div className="detail-section">
                <h3>Product Properties</h3>
                <div className="detail-grid">
                  {product.main_components && (
                    <div className="detail-item full-width">
                      <label>Main Components:</label>
                      <span>{product.main_components}</span>
                    </div>
                  )}
                  
                  {product.color_absolute && (
                    <div className="detail-item">
                      <label>Color:</label>
                      <span>{product.color_absolute}</span>
                    </div>
                  )}
                  
                  {product.applications_uses && (
                    <div className="detail-item full-width">
                      <label>Applications & Uses:</label>
                      <span>{product.applications_uses}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Description */}
              {product.product_long_description && (
                <div className="detail-section">
                  <h3>Detailed Information</h3>
                  <div className="long-description">
                    {product.product_long_description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="contact-section">
            <h3>Interested in this product?</h3>
            <p>Contact us for pricing, samples, or more information about this product.</p>
            <div className="contact-buttons">
              <button className="btn btn-primary">Request Quote</button>
              <button className="btn btn-secondary">Request Sample</button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Product Image" />
            <button className="close-modal" onClick={() => setSelectedImage(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProductView;
