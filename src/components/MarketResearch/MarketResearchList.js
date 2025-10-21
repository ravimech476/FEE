import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import './MarketResearch.css';

const MarketResearchList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReports();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: filterStatus
      };
      const response = await apiService.getMarketReports(params);
      
      // Handle the response structure from the API
      if (response.success && response.data) {
        setReports(response.data.research || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (response.research) {
        setReports(response.research || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setReports([]);
        setTotalPages(1);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (reportId) => {
    navigate(`/market-report/view/${reportId}`);
  };

  const handleEdit = (reportId) => {
    navigate(`/market-report/edit/${reportId}`);
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this market research?')) {
      try {
        await apiService.deleteMarketReport(reportId);
        fetchReports();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'draft': return '#ffc107';
      case 'published': return '#007bff';
      default: return '#6c757d';
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="market-research-page">
        <div className="loading">Loading market research...</div>
      </div>
    );
  }

  return (
    <div className="market-research-page">
      <div className="page-header">
        <h1>Market Research Management</h1>
        <button 
          onClick={() => navigate('/market-report/add')} 
          className="search-btn"
        >
          Create New Research
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search research..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }} 
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Research Number</th>
              <th>Research Name</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>{report.research_number}</td>
                <td>
                  <div className="report-title">{report.research_name}</div>
                  {report.research_short_description && (
                    <div className="report-description">{report.research_short_description}</div>
                  )}
                </td>
                <td>{report.research_title || 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(report.status) }}
                    ></span>
                    <span className="status-text">{report.status}</span>
                  </div>
                </td>
                <td>{report.priority || 0}</td>
                <td>{formatDate(report.created_date)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleView(report.id)}
                      className="btn-icon-only"
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => handleEdit(report.id)}
                      className="btn-icon-only"
                      title="Edit Research"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(report.id)}
                      className="btn-icon-only delete-btn"
                      title="Delete Research"
                    >
                      🗑️
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

export default MarketResearchList;
