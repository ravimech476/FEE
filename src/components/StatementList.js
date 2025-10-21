import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentInfoManagement.css';
import apiService from '../services/apiService';

const StatementList = () => {
  const navigate = useNavigate();
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStatements();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchStatements = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      };
      const response = await apiService.getStatements(params);
      setStatements(response.statements || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (statementId) => {
    navigate(`/admin/payments/statement/${statementId}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#28a745';
      case 'partial': return '#ffc107';
      case 'pending': return '#007bff';
      case 'overdue': return '#dc3545';
      default: return '#6c757d';
    }
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

  if (loading && statements.length === 0) {
    return <div className="payment-management"><div className="loading">Loading statements...</div></div>;
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1>Payment Info</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by customer name, code or invoice..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Statements Table */}
      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Customer Code</th>
              <th>Customer Name</th>
              <th>Customer Group</th>
              <th>Invoice Number</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Outstanding Value</th>
              <th>Total Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {statements.map(statement => (
              <tr key={statement.sl_no}>
                <td>
                  <div className="customer-code">{statement.customer_code}</div>
                </td>
                <td>
                  <div className="customer-name">{statement.customer_name}</div>
                </td>
                <td>{statement.customer_group || '-'}</td>
                <td>
                  <div className="invoice-number">{statement.invoice_number}</div>
                </td>
                <td>{formatDate(statement.invoice_date)}</td>
                <td>{formatDate(statement.due_date)}</td>
                <td>
                  <div className="amount">{formatCurrency(statement.outstanding_value)}</div>
                </td>
                <td>
                  <div className="amount">{formatCurrency(statement.total_paid_amount)}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(statement.status) }}
                    ></span>
                    <span className="status-text">{statement.status}</span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleViewDetails(statement.sl_no)}
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

export default StatementList;
