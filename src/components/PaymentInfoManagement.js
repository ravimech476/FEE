import React, { useState, useEffect } from 'react';
import './PaymentInfoManagement.css';
import apiService from '../services/apiService';

const PaymentInfoManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    customer_name: '',
    invoice_number: '',
    amount: '',
    date: '',
    payment_method: '',
    reference_number: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };
      const response = await apiService.getPayments(params);
      setPayments(response.payments || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      if (editingPayment) {
        await apiService.updatePayment(editingPayment.id, paymentData);
      } else {
        await apiService.createPayment(paymentData);
      }
      setShowModal(false);
      setEditingPayment(null);
      resetForm();
      fetchPayments();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      customer_name: payment.customer_name || '',
      invoice_number: payment.invoice_number || '',
      amount: payment.amount || '',
      date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : '',
      payment_method: payment.payment_method || '',
      reference_number: payment.reference_number || '',
      status: payment.status || 'pending',
      notes: payment.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await apiService.deletePayment(paymentId);
        fetchPayments();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      invoice_number: '',
      amount: '',
      date: '',
      payment_method: '',
      reference_number: '',
      status: 'pending',
      notes: ''
    });
  };

  const openCreateModal = () => {
    setEditingPayment(null);
    resetForm();
    setShowModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading && payments.length === 0) {
    return <div className="payment-management"><div className="loading">Loading payments...</div></div>;
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1>Payment Information Management</h1>
        <button onClick={openCreateModal} className="btn btn-primary">
          Add New Payment
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Invoice Number</th>
              <th>Amount</th>
              <th>Date</th>
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
                  <div className="customer-name">{payment.customer_name}</div>
                </td>
                <td>{payment.invoice_number}</td>
                <td>
                  <div className="amount">{formatCurrency(payment.amount)}</div>
                </td>
                <td>{new Date(payment.date).toLocaleDateString()}</td>
                <td>
                  <span className="payment-method">
                    {payment.payment_method || '-'}
                  </span>
                </td>
                <td>{payment.reference_number || '-'}</td>
                <td>
                  <span className={`status-badge status-${payment.status}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(payment)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(payment.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
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

      {/* Payment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingPayment ? 'Edit Payment' : 'Add New Payment'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="form-group">
                  <label>Invoice Number *</label>
                  <input
                    type="text"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter invoice number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="wire_transfer">Wire Transfer</option>
                    <option value="online_payment">Online Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleInputChange}
                    placeholder="Enter reference number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter any additional notes"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPayment ? 'Update Payment' : 'Create Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInfoManagement;