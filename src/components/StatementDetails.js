import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PaymentInfoManagement.css';
import apiService from '../services/apiService';

const StatementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatementDetails();
  }, [id]);

  const fetchStatementDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStatementById(id);
      setStatement(response.statement);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/payments');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'paid':
        return 'status-completed';
      case 'partial':
        return 'status-pending';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  };

  const calculateBalance = () => {
    if (!statement) return 0;
    return (statement.outstanding_value || 0) - (statement.total_paid_amount || 0);
  };

  if (loading) {
    return (
      <div className="payment-management">
        <div className="loading">Loading statement details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-management">
        <div className="error-message">{error}</div>
        <button onClick={handleBack} className="search-btn">
          Back to Payment Statements
        </button>
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="payment-management">
        <div className="error-message">Statement not found</div>
        <button onClick={handleBack} className="search-btn">
          Back to Payment Statements
        </button>
      </div>
    );
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <div className="header-content">
          <button onClick={handleBack} className="search-btn">
            ← Back to Payment Statements
          </button>
          <div className="header-info" style={{textAlign: 'center', flex: 1}}>
            <h1>Payment Statement Details</h1>
            <div className="statement-meta">
              <span className="invoice-number">{statement.invoice_number}</span>
              <span className={`status-badge ${getStatusBadgeClass(statement.status)}`}>
                {statement.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="statement-details-container">
        {/* Customer Information Section */}
        <div className="details-section">
          <h2>Customer Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Customer Code</label>
              <div className="detail-value">{statement.customer_code}</div>
            </div>
            <div className="detail-item">
              <label>Customer Name</label>
              <div className="detail-value">{statement.customer_name}</div>
            </div>
            <div className="detail-item">
              <label>Customer Group</label>
              <div className="detail-value">{statement.customer_group || '-'}</div>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <div className="detail-value">
                <span className={`status-badge ${getStatusBadgeClass(statement.status)}`}>
                  {statement.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Information Section */}
        <div className="details-section">
          <h2>Invoice Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Invoice Number</label>
              <div className="detail-value invoice-number">{statement.invoice_number}</div>
            </div>
            <div className="detail-item">
              <label>Invoice Date</label>
              <div className="detail-value">{formatDate(statement.invoice_date)}</div>
            </div>
            <div className="detail-item">
              <label>Due Date</label>
              <div className="detail-value">{formatDate(statement.due_date)}</div>
            </div>
            <div className="detail-item">
              <label>Days Overdue</label>
              <div className="detail-value">
                {statement.due_date ? 
                  Math.max(0, Math.floor((new Date() - new Date(statement.due_date)) / (1000 * 60 * 60 * 24))) + ' days'
                  : '-'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Section */}
        <div className="details-section">
          <h2>Financial Summary</h2>
          <div className="financial-summary">
            <div className="summary-card">
              <div className="summary-label">Outstanding Value</div>
              <div className="summary-value amount-large">
                {formatCurrency(statement.outstanding_value)}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Paid Amount</div>
              <div className="summary-value amount-large paid">
                {formatCurrency(statement.total_paid_amount)}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Balance Due</div>
              <div className="summary-value amount-large balance">
                {formatCurrency(calculateBalance())}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="details-section">
          <h2>Timeline</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-date">{formatDate(statement.created_date)}</div>
                <div className="timeline-event">Statement Created</div>
              </div>
            </div>
            {statement.invoice_date && (
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-date">{formatDate(statement.invoice_date)}</div>
                  <div className="timeline-event">Invoice Issued</div>
                </div>
              </div>
            )}
            {statement.due_date && (
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-date">{formatDate(statement.due_date)}</div>
                  <div className="timeline-event">Payment Due</div>
                </div>
              </div>
            )}
            {statement.modified_date && statement.modified_date !== statement.created_date && (
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-date">{formatDate(statement.modified_date)}</div>
                  <div className="timeline-event">Last Modified</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatementDetails;
