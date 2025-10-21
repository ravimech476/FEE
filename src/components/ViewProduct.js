import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewProduct.css';
import apiService from '../services/apiService';
import IndiaHarvestMapComplete from './IndiaHarvestMapComplete';

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
          <button onClick={handleBack} className="search-btn">
            {userType === 'customer' ? '← Back to Products' : '← Back to Product List'}
          </button>
          <div className="header-info" style={{textAlign: 'center', flex: 1}}>
            <h1>{userType === 'customer' ? 'Product Catalog' : 'Product Catalog'}</h1>
            
          </div>
          {userType !== 'customer' && (
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
        <div className="product-description-section">
          <h3>Product Description</h3>
          <div className="description-text">
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
          <IndiaHarvestMapComplete 
            harvestRegions={harvestRegions.length > 0 ? harvestRegions : [
              'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Kerala', 'Telangana'
            ]} 
          />
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

export default ViewProduct;
