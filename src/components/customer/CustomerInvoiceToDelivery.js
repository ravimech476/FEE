import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../ViewInvoiceToDelivery.css';
import apiService from '../../services/apiService';

const CustomerInvoiceToDelivery = ({ userType, user }) => {
  const [invoiceDeliveries, setInvoiceDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('invoice_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoiceDeliveries();
  }, [searchTerm, statusFilter, sortBy, sortOrder, currentPage]);

  const fetchInvoiceDeliveries = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.customer_code) {
        setError('Customer code not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        order: sortOrder
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await apiService.getCustomerInvoiceToDelivery(user.customer_code, params);

      if (response.success) {
        setInvoiceDeliveries(response.data.invoiceDeliveries || response.data);
        setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to fetch invoice to delivery data');
      }
    } catch (error) {
      console.error('Error fetching invoice to delivery data:', error);
      setError('Failed to load invoice to delivery data. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInvoiceDeliveries();
  };

  const handleViewDetails = (id) => {
    navigate(`/invoice-delivery-details/${id}`);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return ' ↕️';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'invoiced': 'status-invoiced',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status?.toLowerCase()] || 'status-pending';
  };

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => setCurrentPage(1)} className="pagination-btn">
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-btn">
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="invoice-delivery-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading invoice to delivery data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-delivery-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Invoice to Delivery</h1>
          <p>Track your orders from invoice to delivery</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="invoice-delivery-content">
        <div className="table-controls">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-group">
              <input
                type="text"
                placeholder="Search by invoice number, product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </div>
          </form>

          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="invoiced">Invoiced</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="table-info">
            <span>Total: {invoiceDeliveries.length} records</span>
          </div>
        </div>

        <div className="table-container">
          <table className="invoice-delivery-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('invoice_number')} className="sortable">
                  Invoice Number {getSortIcon('invoice_number')}
                </th>
                <th onClick={() => handleSort('product_name')} className="sortable">
                  Product {getSortIcon('product_name')}
                </th>
                <th onClick={() => handleSort('quantity')} className="sortable">
                  Quantity {getSortIcon('quantity')}
                </th>
                <th onClick={() => handleSort('amount')} className="sortable">
                  Amount {getSortIcon('amount')}
                </th>
                <th onClick={() => handleSort('delivery_status')} className="sortable">
                  Delivery Status {getSortIcon('delivery_status')}
                </th>
                <th onClick={() => handleSort('invoice_date')} className="sortable">
                  Invoice Date {getSortIcon('invoice_date')}
                </th>
                <th onClick={() => handleSort('delivery_date')} className="sortable">
                  Delivery Date {getSortIcon('delivery_date')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoiceDeliveries.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="invoice-info">
                      <div className="invoice-number">{item.invoice_number}</div>
                    </div>
                  </td>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{parseFloat(item.amount || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(item.delivery_status)}`}>
                      {item.delivery_status || 'pending'}
                    </span>
                  </td>
                  <td>
                    {item.invoice_date 
                      ? new Date(item.invoice_date).toLocaleDateString('en-IN')
                      : 'N/A'
                    }
                  </td>
                  <td>
                    {item.delivery_date 
                      ? new Date(item.delivery_date).toLocaleDateString('en-IN')
                      : 'Pending'
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewDetails(item.id)}
                        className="btn btn-sm btn-outline"
                        title="View Details"
                      >
                        👁️ View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {invoiceDeliveries.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-state-content">
                <span className="empty-state-icon">🚚</span>
                <h3>No invoice to delivery records found</h3>
                <p>No delivery tracking information is available for your account.</p>
              </div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            {renderPagination()}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInvoiceToDelivery;
