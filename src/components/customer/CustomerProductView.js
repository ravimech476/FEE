import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CustomerProductView.css';
import apiService from '../../services/apiService';

const CustomerProductView = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
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
      
      if (productData) {
        setProduct(productData);
        // Reset image load states - check for both possible field names
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
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with /uploads, construct the full URL
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // If it's just a filename, assume it's in uploads
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const getPlaceholderImage = (type = 'product') => {
    // Return a placeholder image URL
    return `https://via.placeholder.com/400x300/e0e0e0/666666?text=${type}+Image`;
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="customer-view-product">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-view-product">
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
          <button onClick={handleBack} className="btn btn-secondary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="customer-view-product">
        <div className="error-container">
          <div className="not-found">
            <span className="not-found-icon">🔍</span>
            <h2>Product Not Found</h2>
            <p>The requested product could not be found.</p>
          </div>
          <button onClick={handleBack} className="btn btn-secondary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-view-product">
      {/* Page Header */}
      <div className="customer-page-header">
        <div className="header-content">
          <button onClick={handleBack} className="back-btn">
            ← Back to Products
          </button>
          <div className="header-info">
            <h1>{product.product_name}</h1>
            <div className="product-meta">
              <span className="product-number">#{product.product_number}</span>
              <span className={`status-badge status-${product.status}`}>
                {product.status === 'active' ? '✅ Available' : '❌ Unavailable'}
              </span>
              {product.product_group && (
                <span className="product-group-badge">
                  {product.product_group}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="customer-product-content">
        {/* Product Images Section */}
        <div className="customer-images-section">
          <h3>Product Images</h3>
          <div className="customer-images-grid">
            {/* Image 1 */}
            <div className="customer-image-container">
              <label>Primary Image</label>
              <div className="customer-image-display">
                {(() => {
                  const image1 = product.image1_url || product.product_image1;
                  const imageUrl = getImageUrl(image1) || getPlaceholderImage('Primary');
                  
                  return (
                    <div className="customer-image-wrapper">
                      <img 
                        src={imageUrl} 
                        alt="Product Image 1"
                        onLoad={() => handleImageLoad('image1')}
                        onError={(e) => {
                          if (e.target.src !== getPlaceholderImage('Primary')) {
                            e.target.src = getPlaceholderImage('Primary');
                          }
                          handleImageError('image1');
                        }}
                        onClick={() => openImageModal(imageUrl)}
                        style={{ 
                          opacity: imageLoadStates.image1 === 'loaded' ? 1 : 0.7,
                          filter: imageLoadStates.image1 === 'error' ? 'grayscale(100%)' : 'none'
                        }}
                      />
                      {imageLoadStates.image1 === 'loading' && (
                        <div className="customer-image-loading-overlay">
                          <div className="customer-image-spinner"></div>
                          <span>Loading...</span>
                        </div>
                      )}
                      {imageLoadStates.image1 === 'error' && image1 && (
                        <div className="customer-image-error-overlay">
                          <span className="error-icon">⚠️</span>
                          <span>Showing placeholder</span>
                        </div>
                      )}
                      {imageLoadStates.image1 === 'loaded' && (
                        <div className="customer-image-overlay">
                          <span>🔍 Click to enlarge</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Image 2 */}
            <div className="customer-image-container">
              <label>Secondary Image</label>
              <div className="customer-image-display">
                {(() => {
                  const image2 = product.image2_url || product.product_image2;
                  const imageUrl = getImageUrl(image2) || getPlaceholderImage('Secondary');
                  
                  return (
                    <div className="customer-image-wrapper">
                      <img 
                        src={imageUrl} 
                        alt="Product Image 2"
                        onLoad={() => handleImageLoad('image2')}
                        onError={(e) => {
                          if (e.target.src !== getPlaceholderImage('Secondary')) {
                            e.target.src = getPlaceholderImage('Secondary');
                          }
                          handleImageError('image2');
                        }}
                        onClick={() => openImageModal(imageUrl)}
                        style={{ 
                          opacity: imageLoadStates.image2 === 'loaded' ? 1 : 0.7,
                          filter: imageLoadStates.image2 === 'error' ? 'grayscale(100%)' : 'none'
                        }}
                      />
                      {imageLoadStates.image2 === 'loading' && (
                        <div className="customer-image-loading-overlay">
                          <div className="customer-image-spinner"></div>
                          <span>Loading...</span>
                        </div>
                      )}
                      {imageLoadStates.image2 === 'error' && image2 && (
                        <div className="customer-image-error-overlay">
                          <span className="error-icon">⚠️</span>
                          <span>Showing placeholder</span>
                        </div>
                      )}
                      {imageLoadStates.image2 === 'loaded' && (
                        <div className="customer-image-overlay">
                          <span>🔍 Click to enlarge</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Sections */}
        <div className="customer-details-container">
          {/* Basic Information */}
          <div className="customer-details-section">
            <h3>Product Information</h3>
            <div className="customer-details-grid">
              <div className="customer-detail-item">
                <label>CAS Number</label>
                <span className="detail-value">{product.product_number}</span>
              </div>
              <div className="customer-detail-item">
                <label>Product Name</label>
                <span className="detail-value">{product.product_name}</span>
              </div>
              <div className="customer-detail-item">
                <label>Availability</label>
                <span className={`status-badge status-${product.status}`}>
                  {product.status === 'active' ? '✅ Available' : '❌ Unavailable'}
                </span>
              </div>
              {product.product_group && (
                <div className="customer-detail-item">
                  <label>Category</label>
                  <span className="detail-value">{product.product_group}</span>
                </div>
              )}
              {product.uom && (
                <div className="customer-detail-item">
                  <label>Unit of Measurement</label>
                  <span className="detail-value">{product.uom}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="customer-details-section">
            <h3>Product Description</h3>
            <div className="customer-description-content">
              {product.product_short_description && (
                <div className="customer-description-item">
                  <label>Overview</label>
                  <div className="description-text">
                    {product.product_short_description}
                  </div>
                </div>
              )}
              {product.product_long_description && (
                <div className="customer-description-item">
                  <label>Detailed Description</label>
                  <div className="description-text long-description">
                    {product.product_long_description}
                  </div>
                </div>
              )}
              {!product.product_short_description && !product.product_long_description && (
                <div className="no-description">
                  <span className="no-content">No description available for this product.</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(product.additional || product.additional2 || product.harvest_region_new || product.harvest_region_image || product.harvest_region_image_url) && (
            <div className="customer-details-section">
              <h3>Additional Information</h3>
              
              {/* Harvest Regions */}
              {product.harvest_region_new && (() => {
                try {
                  const regions = JSON.parse(product.harvest_region_new);
                  if (regions && regions.length > 0) {
                    return (
                      <div className="customer-detail-item full-width">
                        <label>Harvest Regions</label>
                        <div className="region-tags">
                          {regions.map((region, index) => (
                            <span key={index} className="region-tag">{region}</span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                } catch (e) {
                  return null;
                }
              })()}
              
              {/* Harvest Region Map Image */}
              {(product.harvest_region_image_url || product.harvest_region_image) && (
                <div className="customer-detail-item full-width harvest-map-section">
                  <label>Interactive India Harvest Regions Map</label>
                  <div className="harvest-map-container">
                    <img
                      src={getImageUrl(product.harvest_region_image_url || product.harvest_region_image)}
                      alt="Harvest Region Map"
                      className="harvest-map-image"
                      onClick={() => openImageModal(getImageUrl(product.harvest_region_image_url || product.harvest_region_image))}
                      onError={(e) => {
                        console.error('Harvest region image failed to load');
                        console.error('Attempted URL:', e.target.src);
                        e.target.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'image-error-msg';
                        errorDiv.textContent = 'Failed to load harvest region map';
                        e.target.parentNode.appendChild(errorDiv);
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Other Additional Info */}
              <div className="customer-details-grid">
                {product.additional && (
                  <div className="customer-detail-item">
                    <label>Additional Info</label>
                    <span className="detail-value">{product.additional}</span>
                  </div>
                )}
                {product.additional2 && (
                  <div className="customer-detail-item">
                    <label>More Info</label>
                    <span className="detail-value">{product.additional2}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="customer-image-modal" onClick={closeImageModal}>
          <div className="customer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="customer-modal-close" onClick={closeImageModal}>
              ✕
            </button>
            <img src={selectedImage} alt="Product Image Enlarged" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProductView;