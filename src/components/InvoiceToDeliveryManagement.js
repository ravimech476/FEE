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
    switch (status?.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'dispatched': return '#17a2b8';
      case 'delivered': return '#28a745';
      default: return '#6c757d';
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
      {stats && (
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
      )}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by invoice, LR number..."
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
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Invoice #</th>
              <th>Invoice Date</th>
              <th>Value (INR)</th>
              <th>LR Number</th>
              <th>Partner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.sl_no}>
                <td>{invoice.sl_no}</td>
                <td>
                  <div className="invoice-number">{invoice.invoice_number}</div>
                </td>
                <td>{formatDate(invoice.invoice_date)}</td>
                <td>
                  <div className="amount">{formatCurrency(invoice.invoice_value_inr)}</div>
                </td>
                <td>{invoice.lr_number || '-'}</td>
                <td>
                  <div className="partner-name">{invoice.delivery_partner || '-'}</div>
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
                        backgroundColor: getStatusColor(invoice.status)
                      }}
                    ></span>
                    <span className="status-text">{invoice.status?.toUpperCase()}</span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => viewInvoiceDetails(invoice)}
                      className="btn-icon-only"
                      title="View Details"
                    >
                      👁️
                    </button>
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