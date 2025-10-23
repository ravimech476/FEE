import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewProduct.css';
import apiService from '../services/apiService';

const ViewProduct = ({ userType, user }) => {
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
  
  // Expert Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expertSettings, setExpertSettings] = useState({
    email: '',
    socialMedia: []
  });
  const [loadingExpert, setLoadingExpert] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Fetch expert settings when drawer opens
  useEffect(() => {
    if (isDrawerOpen && userType === 'customer') {
      fetchExpertSettings();
    }
  }, [isDrawerOpen, userType]);

  const fetchExpertSettings = async () => {
    try {
      setLoadingExpert(true);
      
      // Fetch expert email settings
      const expertData = await apiService.getExpertSettings();
      
      // Fetch social media links
      const socialMediaData = await apiService.getSocialMediaLinks();
      
      setExpertSettings({
        email: expertData.email || '',
        socialMedia: socialMediaData.data || []
      });
    } catch (error) {
      console.error('Failed to fetch expert settings:', error);
    } finally {
      setLoadingExpert(false);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const getSocialMediaColor = (iconClass) => {
    const colorMap = {
      'fab fa-facebook-f': '#1877f2',
      'fab fa-twitter': '#1da1f2',
      'fab fa-instagram': '#e4405f',
      'fab fa-linkedin-in': '#0077b5',
      'fab fa-youtube': '#ff0000',
      'fab fa-whatsapp': '#25d366',
      'fab fa-telegram-plane': '#0088cc',
      'fab fa-tiktok': '#000000',
      'fab fa-pinterest-p': '#bd081c',
      'fab fa-snapchat-ghost': '#fffc00',
      'fas fa-globe': '#6c757d',
      'fab fa-discord': '#7289da',
      'fab fa-reddit-alien': '#ff4500',
      'fab fa-twitch': '#9146ff',
      'fas fa-link': '#6c757d'
    };
    return colorMap[iconClass] || '#6c757d';
  };

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
    if (userType === 'customer') {
      navigate('/products');
    } else {
      navigate('/admin/products');
    }
  };

  const handleEdit = () => {
    navigate(`/admin/products/${productId}/edit`);
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

  if (loading) {
    return (
      <div className="view-product">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-product">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Product</h2>
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
      <div className="view-product">
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

  return (
    <div className="view-product">
      <div className="page-header">
        <div className="header-content">
          {/* Left Side - Ask Our Experts button (only for customers) */}
          {userType === 'customer' && (
            <button onClick={toggleDrawer} className="ask-experts-btn">
              Ask our Experts
            </button>
          )}
          {userType !== 'customer' && <div></div>}
          
          {/* Center - Title */}
          <div className="header-info" style={{textAlign: 'center', flex: 1}}>
            <h1>{userType === 'customer' ? 'Product Catalog' : 'Product Catalog'}</h1>
          </div>
          
          {/* Right Side - Back or Edit button */}
          {userType === 'customer' ? (
            <button onClick={handleBack} className="search-btn">
              ← Back to Products
            </button>
          ) : (
            <button onClick={handleEdit} className="search-btn" style={{background: '#007bff'}}>
              Edit Product
            </button>
          )}
        </div>
      </div>

      <div className="product-content">
        {/* Top Images Section */}
        <div className="product-images-header">
          {[
            { key: 'image1', url: getImageUrl(product.image1_url || product.product_image1), label: 'Product Image 1' },
            { key: 'image2', url: getImageUrl(product.image2_url || product.product_image2), label: 'Product Image 2' }
          ].filter(img => img.url).length > 0 ? (
            [
              { key: 'image1', url: getImageUrl(product.image1_url || product.product_image1), label: 'Product Image 1' },
              { key: 'image2', url: getImageUrl(product.image2_url || product.product_image2), label: 'Product Image 2' }
            ].filter(img => img.url).map((image, index) => (
              <div key={image.key} className="image-container">
                <label>{image.label}</label>
                <img
                  src={image.url}
                  alt={image.label}
                  className={`product-image ${imageLoadStates[image.key] === 'error' ? 'error' : ''}`}
                  onLoad={() => handleImageLoad(image.key)}
                  onError={() => handleImageError(image.key)}
                  onClick={() => setSelectedImage(image.url)}
                />
                {imageLoadStates[image.key] === 'loading' && (
                  <div className="image-loading">Loading...</div>
                )}
                {imageLoadStates[image.key] === 'error' && (
                  <div className="image-error">Failed to load</div>
                )}
              </div>
            ))
          ) : (
            <div className="no-images">
              <span className="no-image-icon">📸</span>
              <p>No images available</p>
            </div>
          )}
        </div>

        {/* Product Title Section */}
        <div className="product-title-section">
          <h1>{product.common_name || product.product_name}- [Floral]</h1>
          <div className="subtitle">[CAS No: {product.product_number}]</div>
        </div>

        {/* Product Description Section */}
        <div className="view-product-desc-section">
          <h3>Product Description</h3>
          <div className="view-product-desc-text">
            {product.product_long_description || product.product_short_description || 'Spanning cultures and continents, Jasminum grandiflorum weaves a fragrant legacy from Himalayan origins to its new home nestled along the Indian Ocean basin along Africa’s eastern shores. Treasured by diverse cultural symbolisms, adorning individuals and gracing global festivities, rituals, and ceremonies across time. the first-ever poetic flower offers a rich, mellow-floral fruity aroma that intoxicates the senses and delights the spirit.'}
          </div>
        </div>

        {/* Product Parameters Table */}
        <div className="product-parameters">
          <table className="parameters-table">
            <tbody>
              <tr>
                <td>Common Name:</td>
                <td>{product.common_name || 'Jasmine (English), Jathimalli (Tamil)'}</td>
              </tr>
              <tr>
                <td>Botanical Name:</td>
                <td>{product.botanical_name || 'Jasminum Grandiflorum (Oleaceae)'}</td>
              </tr>
              <tr>
                <td>Part:</td>
                <td>{product.plant_part || 'Flower'}</td>
              </tr>
              <tr>
                <td>Source:</td>
                <td>{product.source_country ? getCountryName(product.source_country) : 'India'}</td>
              </tr>
              <tr className="harvest-region-row">
                <td>Harvest Region:</td>
                <td>
                  {harvestRegions.length > 0 ? (
                    <div className="region-tags">
                      {harvestRegions.map(region => (
                        <span key={region} className="region-tag">{region}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="region-tags">
                      <span className="region-tag">Tamil Nadu</span>
                      <span className="region-tag">Karnataka</span>
                      <span className="region-tag">Andhra Pradesh</span>
                      <span className="region-tag">Kerala</span>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td>Season Calendar:</td>
                <td>
                  <div className="season-calendar">
                    {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => {
                      const isPeak = peakSeasonMonths.includes(month) || ['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'].includes(month);
                      const isActive = harvestSeasonMonths.includes(month) || true; // Default to year-round
                      return (
                        <div key={month} className={`month-block ${isPeak ? 'peak' : ''} ${isActive ? 'active' : ''}`}>
                          {month}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                    <span style={{ color: '#90EE90' }}>■</span> Peak Season &nbsp;
                    <span style={{ color: '#FFD700' }}>■</span> Harvest Season
                  </div>
                </td>
              </tr>
              <tr>
                <td>Procurement:</td>
                <td>{product.procurement_method || 'Contract Farming'}</td>
              </tr>
              <tr>
                <td>Main Component:</td>
                <td>
                  {product.main_components ? (
                    <div className="component-tags">
                      {product.main_components.split(',').map((component, index) => (
                        <span key={index} className="component-tag">{component.trim()}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="component-tags">
                      <span className="component-tag">Linalool</span>
                      <span className="component-tag">Phenyl methyl acetate</span>
                      <span className="component-tag">Indole</span>
                      <span className="component-tag">Benzyl benzoate</span>
                      <span className="component-tag">Phytol</span>
                      <span className="component-tag">Farnesene</span>
                      <span className="component-tag">cis-Jasmone</span>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td>Sensory Notes:</td>
                <td>{product.sensory_notes || 'Sweet, Floral, Fruity, Honey, Waxy, Creamy'}</td>
              </tr>
              <tr>
                <td>Color[Absolute]:</td>
                <td>{product.color_absolute || 'Light to dark reddish brown with yellow tinge'}</td>
              </tr>
              <tr>
                <td>Extraction Process:</td>
                <td>{product.extraction_process || 'Solvent'}</td>
              </tr>
              <tr>
                <td>Application / Uses:</td>
                <td>{product.applications_uses || 'Fine Fragrance, Cosmetics, Aromatherapy, Candle Industry'}</td>
              </tr>
              <tr>
                <td>Production Availability:</td>
                <td>{product.production_availability || '2000 Ton. [Flowers]'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Interactive Harvest Regions Map */}
        <div className="harvest-regions-map-section">
          <h3 style={{textAlign: 'center', marginBottom: '20px', color: '#2c3e50'}}>Interactive India Harvest Regions Map</h3>
          {(product.harvest_region_image_url || product.harvest_region_image) ? (
            <div className="uploaded-harvest-map-container">
              <img
                src={getImageUrl(product.harvest_region_image_url || product.harvest_region_image)}
                alt="Harvest Region Map"
                className="uploaded-harvest-map-image"
                onClick={() => setSelectedImage(getImageUrl(product.harvest_region_image_url || product.harvest_region_image))}
                onLoad={() => console.log('Harvest region image loaded successfully')}
                onError={(e) => {
                  console.error('Harvest region image failed to load');
                  console.error('Attempted URL:', e.target.src);
                  e.target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'harvest-image-error';
                  errorDiv.innerHTML = '<p>❌ Failed to load harvest region map image</p><small>The uploaded image could not be displayed.</small>';
                  e.target.parentNode.appendChild(errorDiv);
                }}
              />
              <div className="harvest-map-footer">
                <p className="harvest-map-note">📍 Click image to enlarge</p>
              </div>
              {harvestRegions.length > 0 && (
                <div className="harvest-regions-display">
                  <h4>Harvest Regions ({harvestRegions.length} states):</h4>
                  <div className="regions-list">
                    {harvestRegions.map((region, index) => (
                      <span key={index} className="region-badge">{region}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-harvest-map-placeholder">
              <div className="placeholder-icon">🗺️</div>
              <p>No harvest region map image uploaded for this product</p>
              {harvestRegions.length > 0 ? (
                <div className="placeholder-regions">
                  <small>Harvest Regions ({harvestRegions.length} states):</small>
                  <div className="placeholder-regions-list">
                    {harvestRegions.map((region, index) => (
                      <span key={index} className="placeholder-region-tag">{region}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <small>No harvest regions specified</small>
              )}
            </div>
          )}
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

      {/* Expert Drawer - Only for Customer */}
      {userType === 'customer' && (
        <>
          {/* Backdrop */}
          {isDrawerOpen && (
            <div className="drawer-backdrop" onClick={toggleDrawer}></div>
          )}
          
          {/* Drawer */}
          <div className={`expert-drawer ${isDrawerOpen ? 'open' : ''}`}>
            <div className="drawer-header">
              <h2>Contact Ask Our Experts</h2>
              <button className="drawer-close-btn" onClick={toggleDrawer}>
                ✕
              </button>
            </div>
            
            <div className="drawer-content">
              {loadingExpert ? (
                <div className="drawer-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading expert information...</p>
                </div>
              ) : (
                <>
                  <div className="drawer-intro">
                    <p>For expert guidance, feel free to reach out to our support team</p>
                  </div>

                  {expertSettings.email && (
                    <div className="expert-email-section">
                      <h3>Email</h3>
                      <a href={`mailto:${expertSettings.email}`} className="expert-email-link">
                        {expertSettings.email}
                      </a>
                    </div>
                  )}

                  {expertSettings.socialMedia.length > 0 && (
                    <div className="social-media-section">
                      <h3>Connect with us</h3>
                      <div className="social-media-icons">
                        {expertSettings.socialMedia.map(sm => (
                          <a
                            key={sm.id}
                            href={sm.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-icon-link"
                            title={sm.name}
                          >
                            <i 
                              className={sm.icon} 
                              style={{ color: getSocialMediaColor(sm.icon) }}
                            ></i>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="drawer-footer">
                    <p>Our team is here to help you with any queries or concerns.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewProduct;
