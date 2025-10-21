import React, { useState, useEffect } from 'react';
import './Products.css';
import apiService from '../services/apiService';

const Products = ({ onAddProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productNameSearch, setProductNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, searchTerm, statusFilter]);

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

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await apiService.updateProduct(productId, { status: newStatus });
      // Refresh the products list
      fetchProducts(currentPage);
    } catch (err) {
      console.error('Error updating product status:', err);
      alert('Failed to update product status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(productId);
        // Refresh the products list
        fetchProducts(currentPage);
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="jasmine-products-management">
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
    <div className="jasmine-products-management">
      <div className="jasmine-products-header">
        <h1>Products</h1>
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
      <div className="jasmine-search-section">
        <div className="jasmine-search-header">
          <h2>Search</h2>
          <button className="jasmine-clear-search-btn" onClick={clearSearch}>
            Clear Search
          </button>
        </div>
        
        <div className="jasmine-search-grid">
          <div className="jasmine-search-group">
            <label className="jasmine-search-label">Product Number</label>
            <input
              type="text"
              placeholder="Search by product number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="jasmine-search-input"
            />
          </div>

          <div className="jasmine-search-group">
            <label className="jasmine-search-label">Product Name</label>
            <input
              type="text"
              placeholder="Search by product name"
              value={productNameSearch}
              onChange={(e) => setProductNameSearch(e.target.value)}
              className="jasmine-search-input"
            />
          </div>

          <div className="jasmine-search-group">
            <label className="jasmine-search-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="jasmine-search-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="jasmine-search-actions">
            <button className="jasmine-search-btn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="jasmine-products-table-section">
        <div className="jasmine-table-header">
          <div className="jasmine-table-header-content">
            <span>Product Number</span>
            <span>Product Name</span>
            <span>Status</span>
            <button className="jasmine-add-product-btn" onClick={onAddProduct} title="Add New Product">
              +
            </button>
          </div>
        </div>

        <div className="jasmine-products-table">
          {products.map(product => (
            <div key={product.id} className="jasmine-product-row">
              <div className="jasmine-product-cell jasmine-product-number">
                {product.product_number}
              </div>
              <div className="jasmine-product-cell jasmine-product-name">
                {product.product_name}
              </div>
              <div className="jasmine-product-cell jasmine-product-status">
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
              <div className="jasmine-product-cell jasmine-product-actions">
                <button 
                  className="jasmine-action-btn jasmine-edit-btn"
                  onClick={() => onAddProduct(product)}
                  title="Edit Product"
                >
                  ✏️
                </button>
                <button 
                  className="jasmine-action-btn jasmine-delete-btn"
                  onClick={() => handleDeleteProduct(product.id)}
                  title="Delete Product"
                  style={{ color: 'var(--color-error-main)' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="jasmine-pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`jasmine-page-btn ${currentPage === index + 1 ? 'jasmine-page-active' : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {products.length === 0 && !loading && (
        <div className="jasmine-no-products">
          <div className="jasmine-no-products-content">
            <span className="jasmine-no-products-icon">📦</span>
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or add your first product</p>
            <button className="jasmine-btn jasmine-btn-primary" onClick={onAddProduct}>
              Add New Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;