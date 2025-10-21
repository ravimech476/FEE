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

  const itemsPerPage = 10;

  const fetchProducts = async (page = 1, searchParams = {}) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: page,
        limit: itemsPerPage
      };

      // Add search parameters if they exist
      if (searchText.trim()) {
        params.search = searchText.trim();
      }
      if (statusFilter.trim()) {
        params.status = statusFilter.trim();
      }
      if (dateFilter.trim()) {
        params.date = dateFilter.trim();
      }

      // Override with any passed search params
      Object.assign(params, searchParams);

      const response = await apiService.getProducts(params);

      // Handle API response format
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

  // Initial load
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

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  // Generate page numbers for pagination
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
    <div className="product-list-container">
      {/* Header - Consistent with ViewProduct */}
      <div className="page-header">
        <h1>Product Management</h1>
        {userType !== 'customer' && (
          <button onClick={handleCreateProduct} className="search-btn">
            Add New User Product
          </button>
        )}
        {userType === 'customer' && 'Actions'}

      </div>

      <div className="main-content">
        {/* Search Section */}
        <div className="search-section">
          <h2>Search & Filters</h2>

          <div className="search-filters">
            <div className="filter-group">
              <label>Search Products</label>
              <input
                type="text"
                placeholder="Search by product number or product name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
            </div>
            {userType !== 'customer' && (
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
            )}


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

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Products Table */}
        <div className="products-table">
          {/* Table Headers */}
          <div className="table-header">
            <div className="header-column">Product Number</div>
            <div className="header-column">Product Name</div>
            {/* <div className="header-column">Status</div> */}
            <div className="header-column actions-header">Action</div>
          </div>

          {/* Table Content */}
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
                  <div className="data-column" data-label="Product Number:">
                    <div className="data-value">{product.product_number || 'N/A'}</div>
                  </div>
                  <div className="data-column" data-label="Product Name:">
                    <div className="data-value">{product.product_name || product.name || 'N/A'}</div>
                  </div>
                  {/* <div className="data-column" data-label="Status:">
                    <div className="data-value">
                      <div className="status-display">
                        <span
                          className="status-dot"
                          style={{
                            backgroundColor: (product.status || 'active').toLowerCase() === 'active' ? '#228B22' : '#dc2626'
                          }}
                        ></span>
                        <span className="status-text">{(product.status || 'Active').toUpperCase()}</span>
                      </div>
                    </div>
                  </div> */}
                  <div className="data-column actions-column" data-label="Actions:">
                    <div className="action-buttons">
                      {userType !== 'customer' && (
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditProduct(product.id)}
                          title="Edit Product"
                        >
                          ✏️
                        </button>
                      )}
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