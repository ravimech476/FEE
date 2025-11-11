import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../OrderToCashManagement.css';
import apiService from '../../services/apiService';

const CustomerOrderToCash = ({ userType, user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchOrders = async () => {
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
        limit: 10,
        search: searchTerm,
        status: filterStatus
      };

      const response = await apiService.getCustomerOrders(user.customer_code, params);

      if (response.success) {
        setOrders(response.data.orders || response.data || []);
        setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / 10));
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const viewOrderDetails = (order) => {
    // Navigate to customer order view page
    navigate(`/order-details/${order.id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.trim()) {
      case 'Over Due': return '#dc3545'; // Red for overdue
      case 'Due': return '#ffc107'; // Yellow/Orange for due today
      case 'No Due': return '#28a745'; // Green for no due
      default: return '#6c757d'; // Grey for unknown
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="order-management">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="page-header">
        <h1>Order to Cash</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <select 
          value={filterStatus} 
          onChange={handleStatusFilter} 
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="Over Due">Over Due</option>
          <option value="Due">Due</option>
          <option value="No Due">No Due</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Customer Code</th>
              <th>PO Number</th>
              <th>Invoice</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Bill Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>
                  <div className="customer-code">{order.CustomerCode || '-'}</div>
                </td>
                <td>
                  <div className="po-number">{order.customer_po_number || '-'}</div>
                </td>
                <td>
                  <div className="invoice-number">{order.Invoice || '-'}</div>
                </td>
                <td>
                  <div className="product-name">{order.Product || '-'}</div>
                </td>
                <td>
                  <div className="quantity">{order.Quantity || 0}</div>
                </td>
                <td>
                  <div className="amount">{formatCurrency(order.Amount)}</div>
                </td>
                <td>
                  {order.BillDate 
                    ? new Date(order.BillDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : '-'
                  }
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(order.Status) }}
                    ></span>
                    <span className="status-text">{order.Status?.trim()}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-content">
              <span className="empty-state-icon">📋</span>
              <h3>No orders found</h3>
              <p>You don't have any orders yet or no orders match your search criteria.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerOrderToCash;
