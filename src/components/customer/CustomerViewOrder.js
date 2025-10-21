import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CustomerViewOrder.css';
import apiService from '../../services/apiService';

const CustomerViewOrder = ({ userType, user }) => {
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
      
      if (!user?.customer_code) {
        setError('Customer code not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      // Use customer-specific order API
      const response = await apiService.getCustomerOrderById(user.customer_code, id);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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

  const getTimelineStatus = (orderStatus) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(orderStatus?.toLowerCase());
    
    return statuses.map((status, index) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      completed: index <= currentIndex,
      active: index === currentIndex,
      icon: ['⏳', '🔄', '🚚', '✅'][index]
    }));
  };

  if (loading) {
    return (
      <div className="customer-view-order">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-view-order">
        <div className="error-message">{error}</div>
        <div className="action-section">
          <button onClick={() => navigate('/order-to-cash')} className="btn btn-secondary">
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="customer-view-order">
        <div className="error-message">Order not found</div>
        <div className="action-section">
          <button onClick={() => navigate('/order-to-cash')} className="btn btn-secondary">
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-view-order">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/order-to-cash')} className="back-btn">
            ← Back to Orders
          </button>
          <h1>Order Details - {order.invoice_number}</h1>
        </div>
        <div className="header-right">
          <span 
            className="status-badge large"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {order.status || 'Pending'}
          </span>
        </div>
      </div>

      <div className="order-details-container">
        <div className="details-grid">
          {/* Order Information Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Order Information</h3>
              <span className="section-icon">📋</span>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Invoice Number:</label>
                  <span className="detail-value invoice-highlight">{order.invoice_number}</span>
                </div>
                <div className="detail-item">
                  <label>Order Date:</label>
                  <span className="detail-value">
                    {order.invoice_date 
                      ? new Date(order.invoice_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="detail-item">
                  <label>Order Status:</label>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Customer Code:</label>
                  <span className="detail-value">{user.customer_code}</span>
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
                  <span className="detail-value product-name">{order.product_name}</span>
                </div>
                <div className="detail-item">
                  <label>Quantity:</label>
                  <span className="detail-value">{order.quantity || 1}</span>
                </div>
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

          {/* Order Timeline Section */}
          <div className="detail-section timeline-section">
            <div className="section-header">
              <h3>Order Timeline</h3>
              <span className="section-icon">🕒</span>
            </div>
            <div className="section-content">
              <div className="timeline">
                {getTimelineStatus(order.status).map((step, index) => (
                  <div key={index} className={`timeline-item ${
                    step.completed ? 'completed' : ''
                  } ${step.active ? 'active' : ''}`}>
                    <div className="timeline-marker">
                      <span className="timeline-icon">{step.icon}</span>
                    </div>
                    <div className="timeline-content">
                      <h4>{step.status}</h4>
                      {step.active && <p>Current status</p>}
                      {step.completed && !step.active && <p>Completed</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Additional Information</h3>
              <span className="section-icon">ℹ️</span>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                {order.delivery_date && (
                  <div className="detail-item">
                    <label>Expected Delivery:</label>
                    <span className="detail-value">
                      {new Date(order.delivery_date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <label>Created Date:</label>
                  <span className="detail-value">
                    {order.created_date 
                      ? new Date(order.created_date).toLocaleDateString('en-IN')
                      : 'N/A'
                    }
                  </span>
                </div>
                {order.modified_date && (
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span className="detail-value">
                      {new Date(order.modified_date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
              
              {order.notes && (
                <div className="notes-section">
                  <label>Order Notes:</label>
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
          <button onClick={() => navigate('/order-to-cash')} className="btn btn-secondary">
            ← Back to Orders List
          </button>
          <button onClick={() => window.print()} className="btn btn-primary">
            🖨️ Print Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerViewOrder;