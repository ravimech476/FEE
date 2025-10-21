import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerProducts.css';
import apiService from '../services/apiService';

const CustomerProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('product_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, sortBy, sortOrder, filterBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy: sortBy,
        sortOrder: sortOrder,
        status: filterBy === 'all' ? undefined : filterBy
      };

      const response = await apiService.getAllProducts(params);
      
      if (response && response.success) {
        // Filter only active products for customers
        const activeProducts = response.data.products.filter(product => product.status === 'active');
        setProducts(activeProducts);
        setTotalProducts(activeProducts.length);
        setTotalPages(Math.ceil(activeProducts.length / itemsPerPage));
      } else if (response && response.products) {
        const activeProducts = response.products.filter(product => product.status === 'active');
        setProducts(activeProducts);
        setTotalProducts(activeProducts.length);
        setTotalPages(Math.ceil(activeProducts.length / itemsPerPage));
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/api/placeholder/300/200';
    
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

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="customer-products">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading our products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-products">
      {/* Header Section */}
      <div className="products-header">
        <div className="header-content">
          <h1>Our Products</h1>
          <p className="header-description">
            Discover our premium collection of natural products sourced from the finest regions
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="products-controls">
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products by name, botanical name, or components..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="filter-sort-container">
          <div className="sort-controls">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="sort-select"
            >
              <option value="product_name">Product Name</option>
              <option value="common_name">Common Name</option>
              <option value="botanical_name">Botanical Name</option>
              <option value="plant_part">Plant Part</option>
              <option value="source_country">Source Country</option>
              <option value="priority">Priority</option>
            </select>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-order-btn"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Products Count */}
      <div className="products-info">
        <p className="products-count">
          {searchTerm ? (
            `Found ${products.length} product${products.length !== 1 ? 's' : ''} matching "${searchTerm}"`
          ) : (
            `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`
          )}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="products-grid">
            {products.map((product) => {
              const harvestRegions = parseJsonField(product.harvest_region_new);
              const peakSeasonMonths = parseJsonField(product.peak_season_months);
              
              return (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image-container">
                    <img
                      src={getImageUrl(product.product_image1)}
                      alt={product.common_name || product.product_name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                    {product.priority > 5 && (
                      <div className="priority-badge">Featured</div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-title">
                      {product.common_name || product.product_name}
                    </h3>
                    
                    {product.botanical_name && (
                      <p className="botanical-name">
                        <em>{product.botanical_name}</em>
                      </p>
                    )}
                    
                    <div className="product-details">
                      {product.plant_part && (
                        <span className="detail-tag plant-part">
                          {product.plant_part}
                        </span>
                      )}
                      
                      {product.source_country && (
                        <span className="detail-tag source-country">
                          {getCountryName(product.source_country)}
                        </span>
                      )}
                    </div>
                    
                    {harvestRegions.length > 0 && (
                      <div className="harvest-regions">
                        <small>Regions: {harvestRegions.slice(0, 2).join(', ')}
                        {harvestRegions.length > 2 && ` +${harvestRegions.length - 2} more`}
                        </small>
                      </div>
                    )}
                    
                    {peakSeasonMonths.length > 0 && (
                      <div className="peak-season">
                        <small>Peak: {peakSeasonMonths.slice(0, 3).join(', ')}
                        {peakSeasonMonths.length > 3 && '...'}
                        </small>
                      </div>
                    )}
                    
                    {product.sensory_notes && (
                      <p className="sensory-notes">
                        {product.sensory_notes.length > 80 
                          ? `${product.sensory_notes.substring(0, 80)}...` 
                          : product.sensory_notes
                        }
                      </p>
                    )}
                    
                    <div className="product-footer">
                      <span className="product-number">
                        #{product.product_number}
                      </span>
                      <button className="view-details-btn">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn prev-btn"
              >
                ← Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn next-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>No Products Found</h3>
            <p>
              {searchTerm 
                ? `No products match your search "${searchTerm}"` 
                : 'No products are currently available'
              }
            </p>
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="clear-search-btn"
              >
                Clear Search
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default CustomerProducts;
