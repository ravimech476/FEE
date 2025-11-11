import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InvoiceToDeliveryManagement.css';
import apiService from '../services/apiService';

const InvoiceToDeliveryManagement = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: filterStatus
      };
      const response = await apiService.getInvoiceToDeliveries(params);
      setInvoices(response.invoices || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getInvoiceToDeliveryStats();
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

  const viewInvoiceDetails = (invoice) => {
    navigate(`/admin/invoice-to-delivery/view/${invoice.sl_no}`);
  };

  const getStatusColor = (status) => {
    switch (status?.trim()) {
      case 'Pending': return '#ffc107'; // Yellow
      case 'Dispatched': return '#17a2b8'; // Blue
      case 'In Transit': return '#6f42c1'; // Purple
      case 'Delivered': return '#28a745'; // Green
      default: return '#6c757d'; // Grey
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  if (loading && invoices.length === 0) {
    return <div className="invoice-delivery-management"><div className="loading">Loading invoices...</div></div>;
  }

  return (
    <div className="invoice-delivery-management">
      <div className="page-header">
        <h1>Invoice to Delivery Management</h1>
       
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics Cards */}
      {/* {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Invoices</h3>
              <span className="stat-icon">📄</span>
            </div>
            <div className="stat-value">{stats.totalRecords || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <h3>Pending</h3>
              <span className="stat-icon">⏳</span>
            </div>
            <div className="stat-value">{stats.pendingCount || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <h3>Dispatched</h3>
              <span className="stat-icon">🚚</span>
            </div>
            <div className="stat-value">{stats.dispatchedCount || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <h3>Delivered</h3>
              <span className="stat-icon">✅</span>
            </div>
            <div className="stat-value">{stats.deliveredCount || 0}</div>
          </div>
        </div>
      )} */}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by customer code, invoice, LR number, status..."
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
          <option value="Delivered">Delivered</option>
          <option value="Shipment Delivered">Shipment Delivered</option>
          <option value="In Transit">Delivery</option>
          {/* <option value="Delivered">Delivered</option> */}
        </select>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Customer Code</th>
              <th>Invoice #</th>
              <th>Invoice Date</th>
              <th>Value</th>
              <th>LR Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={index}>
                <td>
                  <div className="customer-code">{invoice.customer_code || '-'}</div>
                </td>
                <td>
                  <div className="invoice-number">{invoice.invoice_no || '-'}</div>
                </td>
                <td>{formatDate(invoice.InvoiceDate)}</td>
                <td>
                  <div className="amount">{formatCurrency(invoice.Value)}</div>
                </td>
                <td>
                  <div className="lr-number">{invoice.LRNumber || '-'}</div>
                </td>
                <td>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span 
                      className="status-dot" 
                      style={{
                        backgroundColor: getStatusColor(invoice.Status)
                      }}
                    ></span>
                    <span className="status-text">{invoice.Status?.trim() || '-'}</span>
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

export default InvoiceToDeliveryManagement;