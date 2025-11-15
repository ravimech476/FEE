import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { API_IMAGE_URL } from '../../services/apiService';
import './MarketResearch.css';

const MarketResearchList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReports();
  }, [currentPage, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
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

      {/* Search Filter */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      {/* Reports Table */}
      <div className="table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Document</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => {
              const getFileType = (filePath) => {
                if (!filePath) return 'none';
                const ext = filePath.split('.').pop().toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
                if (ext === 'pdf') return 'pdf';
                if (['doc', 'docx'].includes(ext)) return 'word';
                if (['xls', 'xlsx'].includes(ext)) return 'excel';
                return 'unknown';
              };
              
              const fileType = getFileType(report.research_image1);
              const fileUrl = report.research_image1?.startsWith('http') 
                ? report.research_image1 
                : `${API_IMAGE_URL}${report.research_image1}`;
              
              const handleDownload = () => {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = report.research_title || 'document';
                link.target = '_blank';
                link.click();
              };
              
              return (
                <tr key={report.id}>
                  <td>
                    <div className="report-title">{report.research_title || 'Untitled'}</div>
                  </td>
                  <td>
                    {fileType === 'image' ? (
                      <img 
                        src={fileUrl}
                        alt={report.research_title}
                        style={{
                          width: '80px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : fileType === 'pdf' ? (
                      <button 
                        onClick={handleDownload}
                        style={{
                          padding: '8px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Download PDF"
                      >
                        📄 PDF
                      </button>
                    ) : fileType === 'word' ? (
                      <button 
                        onClick={handleDownload}
                        style={{
                          padding: '8px 12px',
                          background: '#2b579a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Download Word"
                      >
                        📝 DOC
                      </button>
                    ) : fileType === 'excel' ? (
                      <button 
                        onClick={handleDownload}
                        style={{
                          padding: '8px 12px',
                          background: '#217346',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Download Excel"
                      >
                        📊 EXCEL
                      </button>
                    ) : (
                      <div style={{
                        width: '80px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        color: '#999',
                        fontSize: '12px'
                      }}>
                        No File
                      </div>
                    )}
                    <div style={{
                      display: 'none',
                      width: '80px',
                      height: '60px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f0f0f0',
                      borderRadius: '4px',
                      color: '#999'
                    }}>
                      No Image
                    </div>
                  </td>
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
              );
            })}
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
