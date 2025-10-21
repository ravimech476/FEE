import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MarketReport.css';
import apiService from '../../services/apiService';

const CustomerMarketReport = ({ userType, user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, [searchTerm, sortBy, sortOrder, currentPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.customer_code) {
        setError('Customer code not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        order: sortOrder
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiService.getCustomerMarketReports(user.customer_code, params);

      if (response.success) {
        setReports(response.data.reports || response.data);
        setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to fetch market reports');
      }
    } catch (error) {
      console.error('Error fetching market reports:', error);
      setError('Failed to load market reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReports();
  };

  const handleViewReport = (id) => {
    navigate(`/market-report-details/${id}`);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return ' ↕️';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => setCurrentPage(1)} className="pagination-btn">
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-btn">
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="market-reports-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading market reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="market-reports-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Market Reports</h1>
          <p>View market research and analysis reports</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="reports-content">
        <div className="table-controls">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-group">
              <input
                type="text"
                placeholder="Search market reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </div>
          </form>

          <div className="table-info">
            <span>Total: {reports.length} reports</span>
          </div>
        </div>

        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('research_title')} className="sortable">
                  Report Title {getSortIcon('research_title')}
                </th>
                <th onClick={() => handleSort('research_category')} className="sortable">
                  Category {getSortIcon('research_category')}
                </th>
                <th onClick={() => handleSort('research_date')} className="sortable">
                  Research Date {getSortIcon('research_date')}
                </th>
                <th onClick={() => handleSort('created_date')} className="sortable">
                  Created Date {getSortIcon('created_date')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="report-info">
                      <div className="report-title">{report.research_title}</div>
                      {report.research_short_description && (
                        <div className="report-description">
                          {report.research_short_description.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{report.research_category || 'N/A'}</td>
                  <td>
                    {report.research_date 
                      ? new Date(report.research_date).toLocaleDateString('en-IN')
                      : 'N/A'
                    }
                  </td>
                  <td>
                    {report.created_date 
                      ? new Date(report.created_date).toLocaleDateString('en-IN')
                      : 'N/A'
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewReport(report.id)}
                        // className="btn btn-sm"
                        title="View Report"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {reports.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-state-content">
                <span className="empty-state-icon">📊</span>
                <h3>No market reports found</h3>
                <p>No market reports are available for your account.</p>
              </div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            {renderPagination()}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMarketReport;
