import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerMarketReport.css';
import apiService, { API_IMAGE_URL } from '../../services/apiService';

const CustomerMarketReport = ({ userType, user }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports(1);
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      return `${API_IMAGE_URL}${imagePath}`;
    }
    
    if (imagePath.startsWith('uploads/')) {
      return `${API_IMAGE_URL}/${imagePath}`;
    }
    
    return `${API_IMAGE_URL}/uploads/${imagePath}`;
  };

  const getFileType = (filePath) => {
    if (!filePath) return 'none';
    const ext = filePath.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    return 'unknown';
  };

  const handleDownload = (filePath, fileName, e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = getImageUrl(filePath);
    link.download = fileName || 'document';
    link.target = '_blank';
    link.click();
  };

  const handleImageError = (reportId) => {
    console.error('Image failed to load for report:', reportId);
    setImageErrors(prev => ({ ...prev, [reportId]: true }));
  };

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      setImageErrors({});

      const params = {
        page: page,
        limit: itemsPerPage,
        sort: 'created_date',
        order: 'desc'
      };

      if (searchText.trim()) {
        params.search = searchText.trim();
      }

      // Fetch ALL market reports (not filtered by customer_code)
      const response = await apiService.getMarketReports(params);

      if (response.success) {
        const reportsData = response.data.research || response.data.reports || response.data || [];
        const totalCountData = response.data.total || response.data.pagination?.total || reportsData.length;
        const totalPagesData = response.data.totalPages || response.data.pagination?.totalPages || Math.ceil(totalCountData / itemsPerPage);
        
        setReports(reportsData);
        setTotalPages(totalPagesData);
        setTotalCount(totalCountData);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to fetch market reports');
        setReports([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching market reports:', error);
      setError('Failed to load market reports. Please try again.');
      setReports([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    fetchReports(1);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setCurrentPage(1);
    setIsSearching(true);
    fetchReports(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchReports(page);
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/market-report-details/${reportId}`);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        pages.push('...');
      }
    }

    return pages;
  };

  if (loading && !isSearching) {
    return (
      <div className="market-report-list-container">
        <div className="loading">Loading market reports...</div>
      </div>
    );
  }

  const safeReports = Array.isArray(reports) ? reports : [];

  return (
    <div className="market-report-list-container customer-view">
      {/* CUSTOMER HEADER - Single Row with Inline Search */}
      <div className="page-header-with-search">
        <div className="header-left">
          <h1>Market Reports</h1>
        </div>

        <div className="header-right">
          <div className="search-filters-inline">
            <div className="filter-group-inline">
              <label>Search Reports</label>
              <input
                type="text"
                placeholder="Search by title or description"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
            </div>

            <div className="filter-group-inline">
              <button
                className="search-btn"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="filter-group-inline">
              <button className="clear-btn" onClick={handleClearSearch}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* CUSTOMER VIEW - Card Layout */}
        <div className="reports-card-list">
          {loading && isSearching ? (
            <div className="loading-row">
              <div className="loading-spinner"></div>
              <span>Searching reports...</span>
            </div>
          ) : !Array.isArray(reports) || reports.length === 0 ? (
            <div className="no-data">
              {error ? 'Failed to load market reports' : 'No market reports found'}
              {searchText && (
                <div className="no-data-suggestion">
                  Try adjusting your search criteria or <button onClick={handleClearSearch} className="link-btn">clear all filters</button>
                </div>
              )}
            </div>
          ) : (
            safeReports.map((report) => {
              const imageUrl = getImageUrl(report.research_image1);
              const fileType = getFileType(report.research_image1);
              const description = report.research_short_description || report.research_long_description || 'No description available';
              const reportTitle = report.research_title || report.research_name || 'N/A';
              const hasImageError = imageErrors[report.id];

              return (
                <div 
                  key={report.id} 
                  className="report-card"
                  onClick={() => handleViewReport(report.id)}
                >
                  <div className="report-image-section">
                    <div className="report-image-wrapper">
                      {fileType === 'image' && imageUrl && !hasImageError ? (
                        <div className="image-with-actions">
                          <img 
                            src={imageUrl} 
                            alt={reportTitle}
                            className="report-image"
                            onError={() => handleImageError(report.id)}
                          />
                          <div className="image-overlay">
                            <button 
                              className="image-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(imageUrl, '_blank');
                              }}
                              title="View Full Image"
                            >
                              👁️ View
                            </button>
                            {/* <button 
                              className="image-action-btn"
                              onClick={(e) => handleDownload(report.research_image1, reportTitle, e)}
                              title="Download Image"
                            >
                              ⬇️ Download
                            </button> */}
                          </div>
                        </div>
                      ) : fileType === 'pdf' ? (
                        <div className="report-document-preview">
                          <div className="document-icon-large">📄</div>
                          <div className="document-type-label">PDF Document</div>
                          <button 
                            className="download-doc-btn"
                            onClick={(e) => handleDownload(report.research_image1, reportTitle, e)}
                            title="Download PDF"
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      ) : fileType === 'word' ? (
                        <div className="report-document-preview">
                          <div className="document-icon-large">📝</div>
                          <div className="document-type-label">Word Document</div>
                          <button 
                            className="download-doc-btn"
                            onClick={(e) => handleDownload(report.research_image1, reportTitle, e)}
                            title="Download Document"
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      ) : fileType === 'excel' ? (
                        <div className="report-document-preview">
                          <div className="document-icon-large">📊</div>
                          <div className="document-type-label">Excel Spreadsheet</div>
                          <button 
                            className="download-doc-btn"
                            onClick={(e) => handleDownload(report.research_image1, reportTitle, e)}
                            title="Download Spreadsheet"
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      ) : (
                        <div className="report-chart-placeholder">
                          <div className="chart-visual-box">
                            <div className="bars-container">
                              <div className="bar-item" style={{ height: '40%' }}></div>
                              <div className="bar-item" style={{ height: '60%' }}></div>
                              <div className="bar-item" style={{ height: '85%' }}></div>
                              <div className="bar-item" style={{ height: '100%' }}></div>
                              <div className="bar-item" style={{ height: '70%' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="report-content-section">
                    {/* <div className="report-description-new">
                      <p className="report-description">
                        {description.length > 150 ? description.substring(0, 150) + '...' : description}
                      </p>
                    </div> */}
                    <div className="report-name">
                      {reportTitle}
                    </div>
                    <div className="report-date">
                      📅 {report.research_date 
                        ? new Date(report.research_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(report.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      }
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Page {currentPage} of {totalPages} ({totalCount} total reports)
            </div>

            <div className="pagination-controls">
              <button
                className="page-btn prev-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {generatePageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''} ${typeof pageNum !== 'number' ? 'dots' : ''}`}
                  disabled={typeof pageNum !== 'number'}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="page-btn next-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMarketReport;
