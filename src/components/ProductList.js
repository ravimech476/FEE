import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductList.css';
import apiService from '../services/apiService';

const ProductList = ({ userType, user }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const itemsPerPage = 10;

  const getImageUrl = (product) => {
    if (product.image1_url) {
      return product.image1_url;
    }
    
    const imagePath = product.product_image1;
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    if (imagePath.startsWith('uploads/')) {
      return `http://localhost:5000/${imagePath}`;
    }
    
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const handleImageError = (productId) => {
    console.error('Image failed to load for product:', productId);
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const fetchProducts = async (page = 1, searchParams = {}) => {
    try {
      setLoading(true);
      setError('');
      setImageErrors({}); // Reset image errors

      const params = {
        page: page,
        limit: itemsPerPage
      };

      if (searchText.trim()) {
        params.search = searchText.trim();
      }
      if (statusFilter.trim()) {
        params.status = statusFilter.trim();
      }
      if (dateFilter.trim()) {
        params.date = dateFilter.trim();
      }

      Object.assign(params, searchParams);

      const response = await apiService.getProducts(params);

      let productsData = [];
      let totalPagesData = 1;
      let totalCountData = 0;

      if (response && response.success && response.data && response.data.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
        totalCountData = response.data.pagination?.total || response.data.total || response.total || response.data.products.length;
        totalPagesData = response.data.pagination?.totalPages || response.data.totalPages || response.totalPages || Math.ceil(totalCountData / itemsPerPage);
      } else {
        throw new Error('Unexpected response format from server');
      }

      console.log('Products loaded:', productsData);

      setProducts(productsData);
      setTotalPages(totalPagesData);
      setTotalCount(totalCountData);
      setCurrentPage(page);

    } catch (apiError) {
      setError(`Failed to load products: ${apiError.message}`);
      setProducts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
    setIsSearching(true);
    fetchProducts(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchProducts(page);
    }
  };

  const handleCreateProduct = () => {
    navigate('/admin/products/create');
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/${productId}/edit`);
  };

  const handleViewProduct = (productId) => {
    if (userType === 'customer') {
      navigate(`/products/${productId}`);
    } else {
      navigate(`/admin/products/${productId}/view`);
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        pages.push('...');
      }
    }

    return pages;
  };

  if (loading && !isSearching) {
    return (
      <div className="product-list-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className={`product-list-container ${userType === 'customer' ? 'customer-view' : 'admin-view'}`}>
      
      {/* CUSTOMER HEADER - Single Row with Inline Search */}
      {userType === 'customer' && (
        <div className="page-header-with-search">
          <div className="header-left">
            <h1>Product Catalogue</h1>
          </div>

          <div className="header-right">
            <div className="search-filters-inline">
              <div className="filter-group-inline">
                <label>Search Products</label>
                <input
                  type="text"
                  placeholder="Search by CAS number or name"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="search-input"
                />
              </div>

              <div className="filter-group-inline">
                <label>Date Filter</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="filter-group-inline">
                <button
                  className="search-btn"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              <div className="filter-group-inline">
                <button className="clear-btn" onClick={handleClearSearch}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN HEADER - Separate Rows */}
      {userType !== 'customer' && (
        <>
          <div className="page-header">
            <h1>Product Management</h1>
            <button onClick={handleCreateProduct} className="search-btn">
              Add New Product
            </button>
          </div>

          <div className="search-section">
            <div className="search-filters">
              <div className="filter-group">
                <label>Search Products</label>
                <input
                  type="text"
                  placeholder="Search by CAS number or product name"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="search-input"
                />
              </div>

              <div className="filter-group">
                <label>Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Date Filter</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="filter-group">
                <button
                  className="search-btn"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              <div className="filter-group">
                <button className="search-btn" onClick={handleClearSearch}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="main-content">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* CUSTOMER VIEW - Card Layout */}
        {userType === 'customer' && (
          <div className="products-card-list">
            {loading && isSearching ? (
              <div className="loading-row">
                <div className="loading-spinner"></div>
                <span>Searching products...</span>
              </div>
            ) : !Array.isArray(products) || products.length === 0 ? (
              <div className="no-data">
                {error ? 'Failed to load products' : 'No products found'}
                {(searchText || statusFilter || dateFilter) && (
                  <div className="no-data-suggestion">
                    Try adjusting your search criteria or <button onClick={handleClearSearch} className="link-btn">clear all filters</button>
                  </div>
                )}
              </div>
            ) : (
              safeProducts.map((product) => {
                const imageUrl = getImageUrl(product);
                const description = product.product_short_description || product.product_long_description || 'No description available';
                const productName = product.product_name || product.name || 'N/A';
                const hasImageError = imageErrors[product.id];

                console.log('Product:', product.id, 'Image URL:', imageUrl);

                return (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <div className="product-image-section">
                      <div className="product-image-wrapper">
                        {imageUrl && !hasImageError ? (
                          <img 
                            src={imageUrl} 
                            alt={productName}
                            className="product-image"
                            onLoad={() => console.log('Image loaded:', imageUrl)}
                            onError={() => handleImageError(product.id)}
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            <span>📦</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="product-content-section">
                      <div className="product-description-new">
                        <p className="product-description">
                          {description}
                        </p>
                      </div>
                      <div className="product-name">
                        {productName}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ADMIN VIEW - Table Layout */}
        {userType !== 'customer' && (
          <div className="products-table">
            <div className="table-header">
              <div className="header-column">CAS Number</div>
              <div className="header-column">Product Name</div>
              <div className="header-column actions-header">Action</div>
            </div>

            <div className="table-body">
              {loading && isSearching ? (
                <div className="loading-row">
                  <div className="loading-spinner"></div>
                  <span>Searching products...</span>
                </div>
              ) : !Array.isArray(products) || products.length === 0 ? (
                <div className="no-data">
                  {error ? 'Failed to load products' : 'No products found'}
                  {(searchText || statusFilter || dateFilter) && (
                    <div className="no-data-suggestion">
                      Try adjusting your search criteria or <button onClick={handleClearSearch} className="link-btn">clear all filters</button>
                    </div>
                  )}
                </div>
              ) : (
                safeProducts.map((product) => (
                  <div key={product.id} className="table-row">
                    <div className="data-column" data-label="CAS Number:">
                      <div className="data-value">{product.product_number || 'N/A'}</div>
                    </div>
                    <div className="data-column" data-label="Product Name:">
                      <div className="data-value">{product.product_name || product.name || 'N/A'}</div>
                    </div>
                    <div className="data-column actions-column" data-label="Actions:">
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditProduct(product.id)}
                          title="Edit Product"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewProduct(product.id)}
                          title="View Product"
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Page {currentPage} of {totalPages} ({totalCount} total products)
            </div>

            <div className="pagination-controls">
              <button
                className="page-btn prev-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {generatePageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''} ${typeof pageNum !== 'number' ? 'dots' : ''}`}
                  disabled={typeof pageNum !== 'number'}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="page-btn next-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
