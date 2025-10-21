import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../PaymentInfoManagement.css';
import apiService from '../../services/apiService';

const CustomerPaymentInfo = ({ userType, user }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.customer_code) {
        setError('Customer code not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Use customer-specific payments API
      const response = await apiService.getCustomerPayments(user.customer_code, params);

      if (response.success) {
        setPayments(response.data.payments || response.data);
        setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / 10));
      } else {
        setError(response.message || 'Failed to fetch payment information');
      }
    } catch (error) {
      console.error('Error fetching payment information:', error);
      setError(`Failed to load payment information. Please try again. ${JSON.stringify(error.response || error.message, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewPayment = (id) => {
    navigate(`/payment-details/${id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'completed': 'status-completed',
      'pending': 'status-pending',
      'overdue': 'status-overdue',
      'partial': 'status-partial',
      'paid': 'status-completed',
      'failed': 'status-failed',
      'cancelled': 'status-cancelled',
      'refunded': 'status-refunded'
    };
    return statusClasses[status?.toLowerCase()] || 'status-pending';
  };

  if (loading && payments.length === 0) {
    return (
      <div className="payment-management">
        <div className="loading">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1>Payment Information</h1>
        <div className="header-subtitle">
          <p>View your payment statements and transaction history</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search and Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
        <div className="table-info">
          <span>Total: {payments.length} records</span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Invoice Number</th>
              <th>Amount</th>
              <th>Statement Date</th>
              <th>Payment Method</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>
                  <div className="customer-name">{payment.customer_name || user?.username || 'Customer'}</div>
                </td>
                <td>{payment.invoice_number}</td>
                <td>
                  <div className="amount">{formatCurrency(payment.amount)}</div>
                  {payment.remaining_amount > 0 && (
                    <div className="remaining-amount">
                      Remaining: {formatCurrency(payment.remaining_amount)}
                    </div>
                  )}
                </td>
                <td>{formatDate(payment.statement_date)}</td>
                <td>
                  <span className="payment-method">
                    {payment.payment_method ? payment.payment_method.replace('_', ' ').toUpperCase() : '-'}
                  </span>
                </td>
                <td>{payment.reference_number || '-'}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(payment.payment_status)}`}>
                    {payment.payment_status || 'pending'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                        className="action-btn view-btn"
                        onClick={() => handleViewPayment(payment.id)}
                        title="View Payment Details"
                      >
                        👁️
                      </button>
                   
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-content">
              <span className="empty-state-icon">💳</span>
              <h3>No payment information found</h3>
              <p>No payment records are available for your account.</p>
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

export default CustomerPaymentInfo;
