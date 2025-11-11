import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderToCashManagement.css';
import apiService from '../services/apiService';

const OrderToCashManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: filterStatus
      };
      const response = await apiService.getOrders(params);
      setOrders(response.sales || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getOrderStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
    navigate(`/admin/orders/view/${order.id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#6f42c1';
      case 'delivered': return '#28a745';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'PEND';
      case 'processing': return 'PROC';
      case 'shipped': return 'SHIP';
      case 'delivered': return 'DELV';
      case 'completed': return 'COMP';
      case 'cancelled': return 'CANC';
      default: return status?.toUpperCase().slice(0, 4) || '';
    }
  };

  if (loading && orders.length === 0) {
    return <div className="order-management"><div className="loading">Loading orders...</div></div>;
  }

  return (
    <div className="order-management">
      <div className="page-header">
        <h1>Order to Cash Management</h1>
        
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics Cards */}
      {/* {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>No of Orders</h3>
              <span className="stat-icon">📦</span>
            </div>
            <div className="stat-value">{stats.totalOrders || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Revenue</h3>
              <span className="stat-icon">💰</span>
            </div>
            <div className="stat-value">{formatCurrency(stats.totalAmount)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <h3>Pending Orders</h3>
              <span className="stat-icon">⏳</span>
            </div>
            <div className="stat-value">{stats.pendingOrders || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <h3>This Month</h3>
              <span className="stat-icon">📅</span>
            </div>
            <div className="stat-value">{stats.thisMonthOrders || 0}</div>
            <div className="stat-subtitle">{formatCurrency(stats.thisMonthAmount)}</div>
          </div>
        </div>
      )} */}

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
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>
                  <div className="invoice-number">{order.invoice_number}</div>
                </td>
                <td>
                  <div className="customer-name">{order.customer_name}</div>
                </td>
                <td>
                  <div className="amount">{formatCurrency(order.amount)}</div>
                </td>
                <td>{new Date(order.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    ></span>
                    <span className="status-text">{order.status?.trim()}</span>
                  </div>
                </td>
                {/* <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => viewOrderDetails(order)}
                      className="btn-icon-only"
                      title="View Details"
                    >
                      👁️
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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


    </div>
  );
};

export default OrderToCashManagement;
