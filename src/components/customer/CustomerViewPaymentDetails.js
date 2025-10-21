import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/apiService';
import '../PaymentInfoManagement.css';

const CustomerViewPaymentDetails = ({ userType, user }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.customer_code) {
        setError('Customer code not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      // For customers, fetch via customer-specific API
      const response = await apiService.getCustomerPaymentById(user.customer_code, id);
      
      if (response.success) {
        setPayment(response.data);
      } else {
        setError(response.message || 'Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      setError(`Failed to load payment details. Please try again. ${JSON.stringify(error.response || error.message, null, 2)}`);
    } finally {
      setLoading(false);
    }
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
      month: 'long',
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

  if (loading) {
    return (
      <div className="payment-management">
        <div className="loading">Loading payment details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-management">
        <div className="page-header">
          <h1>Payment Details</h1>
          <p>Unable to load payment details</p>
        </div>
        <div className="error-message">{error}</div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate('/payment-info')} className="search-btn">
            ← Back to Payment Information
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="payment-management">
        <div className="page-header">
          <h1>Payment Details</h1>
          <p>Payment not found</p>
        </div>
        <div className="error-message">Payment record not found</div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate('/payment-info')} className="search-btn">
            ← Back to Payment Information
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/payment-info')} className="search-btn">
            ← Back to Payment Information
          </button>
          <div className="header-info" style={{textAlign: 'center', flex: 1}}>
            <h1>Payment Details</h1>
            <div className="payment-meta">
              <span className="statement-number">Statement: {payment.statement_number}</span>
              <span className={`status-badge ${getStatusBadgeClass(payment.payment_status)}`}>
                {payment.payment_status || 'pending'}
              </span>
            </div>
          </div>
          {/* Customer view - no edit actions */}
        </div>
      </div>

      <div className="payment-details">
        <div className="detail-section">
          <h2>Payment Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Customer Name</label>
              <p>{payment.customer_name || user?.username || 'Customer'}</p>
            </div>
            <div className="detail-item">
              <label>Invoice Number</label>
              <p>{payment.invoice_number}</p>
            </div>
            <div className="detail-item">
              <label>Statement Number</label>
              <p>{payment.statement_number}</p>
            </div>
            <div className="detail-item">
              <label>Reference Number</label>
              <p>{payment.reference_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Amount Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Total Amount</label>
              <p className="amount-highlight">{formatCurrency(payment.amount)}</p>
            </div>
            {payment.tax_amount && (
              <div className="detail-item">
                <label>Tax Amount</label>
                <p>{formatCurrency(payment.tax_amount)}</p>
              </div>
            )}
            {payment.discount_amount > 0 && (
              <div className="detail-item">
                <label>Discount Amount</label>
                <p className="discount-amount">-{formatCurrency(payment.discount_amount)}</p>
              </div>
            )}
            {payment.net_amount && (
              <div className="detail-item">
                <label>Net Amount</label>
                <p>{formatCurrency(payment.net_amount)}</p>
              </div>
            )}
            {payment.paid_amount > 0 && (
              <div className="detail-item">
                <label>Paid Amount</label>
                <p className="paid-amount">{formatCurrency(payment.paid_amount)}</p>
              </div>
            )}
            {payment.remaining_amount > 0 && (
              <div className="detail-item">
                <label>Remaining Amount</label>
                <p className="remaining-amount-detail">{formatCurrency(payment.remaining_amount)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h2>Payment Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Payment Method</label>
              <p>{payment.payment_method ? payment.payment_method.replace('_', ' ').toUpperCase() : 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Payment Status</label>
              <p>
                <span className={`status-badge ${getStatusBadgeClass(payment.payment_status)}`}>
                  {payment.payment_status || 'pending'}
                </span>
              </p>
            </div>
            <div className="detail-item">
              <label>Statement Date</label>
              <p>{formatDate(payment.statement_date)}</p>
            </div>
            <div className="detail-item">
              <label>Due Date</label>
              <p>{formatDate(payment.due_date)}</p>
            </div>
            {payment.payment_date && (
              <div className="detail-item">
                <label>Payment Date</label>
                <p>{formatDate(payment.payment_date)}</p>
              </div>
            )}
            <div className="detail-item">
              <label>Created Date</label>
              <p>{formatDate(payment.created_date)}</p>
            </div>
          </div>
        </div>

        {payment.description && (
          <div className="detail-section">
            <h2>Description</h2>
            <div className="content-box">
              <p>{payment.description}</p>
            </div>
          </div>
        )}

        {payment.notes && (
          <div className="detail-section">
            <h2>Notes</h2>
            <div className="content-box">
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{payment.notes}</p>
            </div>
          </div>
        )}

        {payment.payment_history && payment.payment_history.length > 0 && (
          <div className="detail-section">
            <h2>Payment History</h2>
            <div className="table-container">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.payment_history.map((history, index) => (
                    <tr key={index}>
                      <td>{formatDate(history.date)}</td>
                      <td>{formatCurrency(history.amount)}</td>
                      <td>{history.method ? history.method.replace('_', ' ').toUpperCase() : 'N/A'}</td>
                      <td>{history.reference || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(history.status)}`}>
                          {history.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerViewPaymentDetails;
