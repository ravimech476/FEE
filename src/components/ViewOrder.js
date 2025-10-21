import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewOrder.css';
import apiService from '../services/apiService';

const ViewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrderById(id);
      setOrder(response);
    } catch (error) {
      setError(error.message);
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

  if (loading) {
    return <div className="view-order"><div className="loading">Loading order details...</div></div>;
  }

  if (error) {
    return <div className="view-order"><div className="error-message">{error}</div></div>;
  }

  if (!order) {
    return <div className="view-order"><div className="error-message">Order not found</div></div>;
  }

  return (
    <div className="view-order">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/orders')} className="search-btn">
            ← Back to Orders
          </button>
          <h1>Order Details - {order.invoice_number}</h1>
        </div>
        <div className="header-right">
          <span 
            className="status-badge large"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="order-details-container">
        <div className="details-grid">
          {/* Customer Information Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Customer Information</h3>
              <span className="section-icon">👤</span>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Customer Name:</label>
                  <span className="detail-value">{order.customer_name}</span>
                </div>
                <div className="detail-item">
                  <label>Invoice Number:</label>
                  <span className="detail-value invoice-highlight">{order.invoice_number}</span>
                </div>
                <div className="detail-item">
                  <label>Invoice Date:</label>
                  <span className="detail-value">{new Date(order.invoice_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Order Status:</label>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Product Information</h3>
              <span className="section-icon">📦</span>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Product Name:</label>
                  <span className="detail-value">{order.product_name}</span>
                </div>
                {order.quantity && (
                  <div className="detail-item">
                    <label>Quantity:</label>
                    <span className="detail-value">{order.quantity}</span>
                  </div>
                )}
                {order.unit_price && (
                  <div className="detail-item">
                    <label>Unit Price:</label>
                    <span className="detail-value">{formatCurrency(order.unit_price)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <label>Total Amount:</label>
                  <span className="detail-value amount-highlight">{formatCurrency(order.amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information Section */}
          {order.delivery_date && (
            <div className="detail-section">
              <div className="section-header">
                <h3>Delivery Information</h3>
                <span className="section-icon">🚚</span>
              </div>
              <div className="section-content">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Expected Delivery:</label>
                    <span className="detail-value">{new Date(order.delivery_date).toLocaleDateString()}</span>
                  </div>
                  {order.delivery_address && (
                    <div className="detail-item">
                      <label>Delivery Address:</label>
                      <span className="detail-value">{order.delivery_address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Information Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Additional Information</h3>
              <span className="section-icon">📋</span>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Created Date:</label>
                  <span className="detail-value">{new Date(order.created_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Last Modified:</label>
                  <span className="detail-value">{new Date(order.modified_date).toLocaleDateString()}</span>
                </div>
              </div>
              
              {order.notes && (
                <div className="notes-section">
                  <label>Notes:</label>
                  <div className="notes-content">
                    {order.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <button onClick={() => navigate('/admin/orders')} className="btn btn-secondary">
            Back to Orders List
          </button>
          {/* <button onClick={() => window.print()} className="btn btn-primary">
            Print Order
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
