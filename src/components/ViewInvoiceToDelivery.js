import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewInvoiceToDelivery.css';
import apiService from '../services/apiService';
import CustomerInvoiceToDelivery from './customer/CustomerInvoiceToDelivery';

const ViewInvoiceToDelivery = ({ userType, user }) => {
  // Always call hooks first
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch details if we have an ID and it's not a customer
    if (id && userType !== 'customer') {
      fetchInvoiceDetails();
    } else if (userType !== 'customer') {
      setLoading(false);
    }
  }, [id, userType]);

  // Then handle conditional rendering
  if (userType === 'customer') {
    return <CustomerInvoiceToDelivery userType={userType} user={user} />;
  }

  // Original detailed view for admin or specific invoice ID

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInvoiceToDeliveryById(id);
      setInvoice(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const getStatusProgress = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 33;
      case 'dispatched': return 66;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return <div className="view-invoice-delivery"><div className="loading">Loading invoice details...</div></div>;
  }

  if (error) {
    return <div className="view-invoice-delivery"><div className="error-message">{error}</div></div>;
  }

  if (!invoice) {
    return <div className="view-invoice-delivery"><div className="error-message">Invoice not found</div></div>;
  }

  return (
    <div className="view-invoice-delivery">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/invoice-to-delivery')} className="search-btn">
            ← Back to Invoices
          </button>
          
        </div>
        <div className="header-right">
          <span 
            className="status-badge large"
            style={{ backgroundColor: getStatusColor(invoice.status) }}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <h3>Delivery Progress</h3>
          <span className="progress-percentage">{getStatusProgress(invoice.status)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${getStatusProgress(invoice.status)}%`,
              backgroundColor: getStatusColor(invoice.status)
            }}
          ></div>
        </div>
        <div className="progress-labels">
          <span className={invoice.status ? 'active' : ''}>Invoice Created</span>
          <span className={['dispatched', 'delivered'].includes(invoice.status?.toLowerCase()) ? 'active' : ''}>Dispatched</span>
          <span className={invoice.status?.toLowerCase() === 'delivered' ? 'active' : ''}>Delivered</span>
        </div>
      </div>

      <div className="invoice-details-container">
        <div className="left-column">
          {/* Invoice Information Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Invoice Information</h3>
              <span className="section-icon">📄</span>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Invoice Number:</label>
                  <span className="detail-value invoice-highlight">{invoice.invoice_number}</span>
                </div>
                <div className="detail-item">
                  <label>Invoice Date:</label>
                  <span className="detail-value">{formatDate(invoice.invoice_date)}</span>
                </div>
                <div className="detail-item">
                  <label>Invoice Value (USD):</label>
                  <span className="detail-value">${invoice.invoice_value}</span>
                </div>
                <div className="detail-item">
                  <label>Invoice Value (INR):</label>
                  <span className="detail-value amount-highlight">{formatCurrency(invoice.invoice_value_inr)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Delivery Timeline</h3>
              <span className="section-icon">⏱️</span>
            </div>
            <div className="section-content">
              <div className="timeline">
                <div className={`timeline-item ${invoice.invoice_date ? 'completed' : ''}`}>
                  <div className="timeline-marker">
                    <span className="timeline-icon">📄</span>
                  </div>
                  <div className="timeline-content">
                    <h5>Invoice Created</h5>
                    <p className="timeline-date">{formatDate(invoice.invoice_date)}</p>
                    <p className="timeline-description">Invoice generated and ready for processing</p>
                  </div>
                </div>
                
                <div className={`timeline-item ${invoice.dispatch_date ? 'completed' : ''}`}>
                  <div className="timeline-marker">
                    <span className="timeline-icon">📦</span>
                  </div>
                  <div className="timeline-content">
                    <h5>Dispatched</h5>
                    <p className="timeline-date">{formatDate(invoice.dispatch_date)}</p>
                    <p className="timeline-description">
                      {invoice.delivery_partner ? `Shipped via ${invoice.delivery_partner}` : 'Package dispatched for delivery'}
                      {invoice.lr_number && <span><br />LR Number: {invoice.lr_number}</span>}
                    </p>
                  </div>
                </div>
                
                <div className={`timeline-item ${invoice.delivered_date ? 'completed' : ''}`}>
                  <div className="timeline-marker">
                    <span className="timeline-icon">✅</span>
                  </div>
                  <div className="timeline-content">
                    <h5>Delivered</h5>
                    <p className="timeline-date">{formatDate(invoice.delivered_date)}</p>
                    <p className="timeline-description">Package successfully delivered to customer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-column">
          {/* Delivery Information Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Delivery Information</h3>
              <span className="section-icon">🚚</span>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Current Status:</label>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(invoice.status) }}
                  >
                    {invoice.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>LR Number:</label>
                  <span className="detail-value">{invoice.lr_number || 'Not assigned'}</span>
                </div>
                <div className="detail-item">
                  <label>Delivery Partner:</label>
                  <span className="detail-value">{invoice.delivery_partner || 'Not assigned'}</span>
                </div>
                <div className="detail-item">
                  <label>Dispatch Date:</label>
                  <span className="detail-value">{formatDate(invoice.dispatch_date)}</span>
                </div>
                <div className="detail-item">
                  <label>Delivered Date:</label>
                  <span className="detail-value">{formatDate(invoice.delivered_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Information Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>System Information</h3>
              <span className="section-icon">⚙️</span>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Serial Number:</label>
                  <span className="detail-value">{invoice.sl_no}</span>
                </div>
                <div className="detail-item">
                  <label>Created Date:</label>
                  <span className="detail-value">{formatDate(invoice.created_date)}</span>
                </div>
                <div className="detail-item">
                  <label>Last Modified:</label>
                  <span className="detail-value">{formatDate(invoice.modified_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <button onClick={() => navigate('/admin/invoice-to-delivery')} className="btn btn-secondary">
            Back to Invoice List
          </button>
          {/* <button onClick={() => window.print()} className="btn btn-primary">
            Print Invoice Details
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ViewInvoiceToDelivery;
