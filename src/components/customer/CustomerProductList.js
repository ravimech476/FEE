import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerProductList.css';
import apiService from '../../services/apiService';

const CustomerProductList = ({ userType, user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productNameSearch, setProductNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await apiService.getProducts(params);
      
      if (response.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setProductNameSearch('');
    setStatusFilter('');
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handleViewProduct = (product) => {
    navigate(`/products/${product.id}`);
  };

  if (loading && products.length === 0) {
    return (
      <div className="customer-products-management">
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div className="spinner"></div>
          <span style={{ marginLeft: '10px' }}>Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-products-management">
      <div className="customer-products-header">
        <h1>Product Catalog</h1>
        <p className="header-subtitle">Browse our complete product collection</p>
      </div>

      {error && (
        <div className="error-message" style={{
          color: 'var(--color-error-main)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          {error}
        </div>
      )}

      {/* Search Section */}
      <div className="customer-search-section">
        <div className="customer-search-header">
          <h2>Search Products</h2>
          <button className="customer-clear-search-btn" onClick={clearSearch}>
            Clear Search
          </button>
        </div>
        
        <div className="customer-search-grid">
          <div className="customer-search-group">
            <label className="customer-search-label">Product Number</label>
            <input
              type="text"
              placeholder="Search by product number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="customer-search-input"
            />
          </div>

          <div className="customer-search-group">
            <label className="customer-search-label">Product Name</label>
            <input
              type="text"
              placeholder="Search by product name"
              value={productNameSearch}
              onChange={(e) => setProductNameSearch(e.target.value)}
              className="customer-search-input"
            />
          </div>

          <div className="customer-search-group">
            <label className="customer-search-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="customer-search-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="customer-search-actions">
            <button className="customer-search-btn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="customer-products-table-section">
        <div className="customer-table-header">
          <div className="customer-table-header-content">
            <span>Product Number</span>
            <span>Product Name</span>
            <span>Status</span>
            <span style={{ textAlign: 'center' }}>Actions</span>
          </div>
        </div>

        <div className="customer-products-table">
          {products.map(product => (
            <div key={product.id} className="customer-product-row">
              <div className="customer-product-cell customer-product-number">
                {product.product_number}
              </div>
              <div className="customer-product-cell customer-product-name">
                <div className="product-name-container">
                  <span className="product-name">{product.product_name}</span>
                  {product.product_short_description && (
                    <span className="product-description">{product.product_short_description}</span>
                  )}
                </div>
              </div>
              <div className="customer-product-cell customer-product-status">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span 
                    className="status-dot" 
                    style={{
                      backgroundColor: product.status?.toLowerCase() === 'active' ? 'rgb(40, 167, 69)' : '#dc3545'
                    }}
                  ></span>
                  <span className="status-text">{product.status?.toUpperCase()}</span>
                </div>
              </div>
              <div className="customer-product-cell customer-product-actions">
                <button 
                  className="customer-action-btn customer-view-btn"
                  onClick={() => handleViewProduct(product)}
                  title="View Product Details"
                >
                  👁️ View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="customer-pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`customer-page-btn ${currentPage === index + 1 ? 'customer-page-active' : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {products.length === 0 && !loading && (
        <div className="customer-no-products">
          <div className="customer-no-products-content">
            <span className="customer-no-products-icon">📦</span>
            <h3>No products found</h3>
            <p>Try adjusting your search criteria to find the products you're looking for</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProductList;