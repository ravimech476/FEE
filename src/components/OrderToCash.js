import React, { useState } from 'react';
import './OrderToCash.css';
import CustomerOrderToCash from './customer/CustomerOrderToCash';

const OrderToCash = ({ userType, user }) => {
  // Always call hooks first
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Then handle conditional rendering
  if (userType === 'customer') {
    return <CustomerOrderToCash userType={userType} user={user} />;
  }

  // Original order to cash view for other cases

  const orders = [
    {
      id: 'ORD-2025-001',
      date: '2025-01-15',
      customer: 'John Smith',
      items: 3,
      total: '$145.99',
      status: 'Processing',
      paymentStatus: 'Paid',
      shippingStatus: 'Preparing'
    },
    {
      id: 'ORD-2025-002',
      date: '2025-01-14',
      customer: 'Sarah Johnson',
      items: 2,
      total: '$89.50',
      status: 'Shipped',
      paymentStatus: 'Paid',
      shippingStatus: 'In Transit'
    },
    {
      id: 'ORD-2025-003',
      date: '2025-01-13',
      customer: 'Mike Brown',
      items: 5,
      total: '$234.75',
      status: 'Delivered',
      paymentStatus: 'Paid',
      shippingStatus: 'Delivered'
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'warning';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'preparing': return 'secondary';
      case 'in transit': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div className="order-to-cash">
      <div className="page-content">
        <div className="otc-header">
          <h1>Order to Cash Management</h1>
          <p>Track and manage your orders from placement to payment</p>
        </div>

        <div className="otc-stats">
          <div className="stat-card primary">
            <div className="stat-content">
              <div className="stat-value">24</div>
              <div className="stat-title">Active Orders</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-content">
              <div className="stat-value">$12,450</div>
              <div className="stat-title">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-content">
              <div className="stat-value">8</div>
              <div className="stat-title">Pending Payments</div>
            </div>
          </div>
        </div>

        <div className="orders-table">
          <h3>Recent Orders</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Shipping</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="order-id">{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.customer}</td>
                    <td>{order.items}</td>
                    <td className="total">{order.total}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(order.shippingStatus)}`}>
                        {order.shippingStatus}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedOrder && (
          <div className="order-details-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Order Details - {selectedOrder.id}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="order-info-grid">
                  <div className="info-item">
                    <label>Customer:</label>
                    <span>{selectedOrder.customer}</span>
                  </div>
                  <div className="info-item">
                    <label>Order Date:</label>
                    <span>{selectedOrder.date}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Items:</label>
                    <span>{selectedOrder.items}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Amount:</label>
                    <span>{selectedOrder.total}</span>
                  </div>
                </div>
                <div className="order-timeline">
                  <h4>Order Timeline</h4>
                  <div className="timeline">
                    <div className="timeline-item completed">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h5>Order Placed</h5>
                        <p>{selectedOrder.date}</p>
                      </div>
                    </div>
                    <div className="timeline-item completed">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h5>Payment Confirmed</h5>
                        <p>{selectedOrder.date}</p>
                      </div>
                    </div>
                    <div className="timeline-item active">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h5>{selectedOrder.shippingStatus}</h5>
                        <p>Current status</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderToCash;