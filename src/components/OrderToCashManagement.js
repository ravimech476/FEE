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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
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
                  {order.BillDate ? new Date(order.BillDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) : '-'}
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
