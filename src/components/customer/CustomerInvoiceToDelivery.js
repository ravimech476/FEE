import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../InvoiceToDeliveryManagement.css';
import apiService from '../../services/apiService';

const CustomerInvoiceToDelivery = ({ user }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchInvoices = async () => {
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

      console.log('Fetching invoices for customer:', user.customer_code);
      const response = await apiService.getCustomerInvoiceToDelivery(user.customer_code, params);
      console.log('API Response:', response);

      if (response.success) {
        const invoicesData = response.data.invoices || [];
        console.log('Setting invoices:', invoicesData);
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.message || 'Failed to fetch invoices');
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to load invoices. Please try again.');
      setInvoices([]);
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
    return (
      <div className="invoice-delivery-management">
        <div className="loading">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="invoice-delivery-management">
      <div className="page-header">
        <h1>Invoice to Delivery</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by invoice, LR number, status..."
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
            {Array.isArray(invoices) && invoices.length > 0 ? (
              invoices.map((invoice, index) => (
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
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state">
                    <div className="empty-state-content">
                      <span className="empty-state-icon">📦</span>
                      <h3>No invoices found</h3>
                      <p>You don't have any invoice-to-delivery records yet or no records match your search criteria.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

export default CustomerInvoiceToDelivery;
