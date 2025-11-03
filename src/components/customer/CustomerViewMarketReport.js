import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/apiService';
import '../MarketResearch/MarketResearch.css';

const CustomerViewMarketReport = ({ userType, user }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResearchDetails();
  }, [id]);

  const fetchResearchDetails = async () => {
    try {
      setLoading(true);
      // Use general API (same as admin - no customer_code parameter)
      const response = await apiService.getMarketReportById(id);
      
      // Handle different response structures
      const data = response.data || response;
      setResearch(data);
    } catch (error) {
      setError(error.message || 'Failed to fetch research details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="market-research-page">
        <div className="loading">Loading research details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="market-research-page">
        <div className="page-header">
          <div className="header-content">
            <button onClick={() => navigate('/market-report')} className="search-btn">
              ← Back to Market Reports
            </button>
            <div className="header-info" style={{textAlign: 'center', flex: 1}}>
              <h1>Market Report Details</h1>
              <p>Unable to load report details</p>
            </div>
          </div>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="market-research-page">
        <div className="page-header">
          <div className="header-content">
            <button onClick={() => navigate('/market-report')} className="search-btn">
              ← Back to Market Reports
            </button>
            <div className="header-info" style={{textAlign: 'center', flex: 1}}>
              <h1>Market Report Details</h1>
              <p>Report not found</p>
            </div>
          </div>
        </div>
        <div className="error-message">Research not found</div>
      </div>
    );
  }

  return (
    <div className="market-research-page">
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/market-report')} className="search-btn">
            ← Back to Market Reports
          </button>
          <div className="header-info" style={{textAlign: 'center', flex: 1}}>
            <h1>View Market Research</h1>
            <div className="research-meta">
              {research.research_number && (
                <span className="research-number">{research.research_number}</span>
              )}
              <span className={`status-badge status-${research.status || 'published'}`}>
                {research.status || 'published'}
              </span>
            </div>
          </div>
          {/* Customer view - no edit actions */}
        </div>
      </div>

      <div className="report-details">
        {research.research_title && (
          <div className="detail-section">
            <h2>Research Title</h2>
            <p>{research.research_title}</p>
          </div>
        )}

        {research.research_short_description && (
          <div className="detail-section">
            <h2>Short Description</h2>
            <div className="content-box">
              <p>{research.research_short_description}</p>
            </div>
          </div>
        )}

        {research.research_long_description && (
          <div className="detail-section">
            <h2>Detailed Description</h2>
            <div className="content-box">
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {research.research_long_description}
              </p>
            </div>
          </div>
        )}

        <div className="detail-section">
          <h2>Media & Documents</h2>
          <div className="media-grid">
            {research.research_image1 && (() => {
              const getFileType = (filePath) => {
                if (!filePath) return 'none';
                const ext = filePath.split('.').pop().toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
                if (ext === 'pdf') return 'pdf';
                if (['doc', 'docx'].includes(ext)) return 'word';
                if (['xls', 'xlsx'].includes(ext)) return 'excel';
                return 'unknown';
              };
              
              const fileType = getFileType(research.research_image1);
              const fileUrl = research.research_image1.startsWith('http') 
                ? research.research_image1 
                : `http://localhost:5000${research.research_image1}`;
              
              const handleDownload = () => {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = research.research_title || 'document';
                link.target = '_blank';
                link.click();
              };
              
              return (
                <div className="media-item">
                  <h3>Attached Document</h3>
                  {fileType === 'image' ? (
                    <div className="image-container">
                      <img 
                        src={fileUrl}
                        alt="Research Document" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="image-error" style={{display: 'none'}}>
                        <span>🖼️</span>
                        <p>Image not available</p>
                      </div>
                    </div>
                  ) : fileType === 'pdf' ? (
                    <div className="document-preview" style={{textAlign: 'center', padding: '20px'}}>
                      <div style={{fontSize: '48px', marginBottom: '15px'}}>📄</div>
                      <p style={{marginBottom: '15px', color: '#666'}}>PDF Document</p>
                      <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                        <a 
                          href={fileUrl}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-info"
                          style={{background: '#dc3545', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none'}}
                        >
                          👁️ View PDF
                        </a>
                        <button 
                          onClick={handleDownload}
                          className="btn btn-info"
                          style={{background: '#28a745', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer'}}
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    </div>
                  ) : fileType === 'word' ? (
                    <div className="document-preview" style={{textAlign: 'center', padding: '20px'}}>
                      <div style={{fontSize: '48px', marginBottom: '15px'}}>📝</div>
                      <p style={{marginBottom: '15px', color: '#666'}}>Word Document</p>
                      <button 
                        onClick={handleDownload}
                        className="btn btn-info"
                        style={{background: '#2b579a', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer'}}
                      >
                        ⬇️ Download Document
                      </button>
                    </div>
                  ) : fileType === 'excel' ? (
                    <div className="document-preview" style={{textAlign: 'center', padding: '20px'}}>
                      <div style={{fontSize: '48px', marginBottom: '15px'}}>📊</div>
                      <p style={{marginBottom: '15px', color: '#666'}}>Excel Spreadsheet</p>
                      <button 
                        onClick={handleDownload}
                        className="btn btn-info"
                        style={{background: '#217346', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer'}}
                      >
                        ⬇️ Download Spreadsheet
                      </button>
                    </div>
                  ) : (
                    <div className="document-preview" style={{textAlign: 'center', padding: '20px'}}>
                      <div style={{fontSize: '48px', marginBottom: '15px'}}>📁</div>
                      <p style={{marginBottom: '15px', color: '#666'}}>File</p>
                      <button 
                        onClick={handleDownload}
                        className="btn btn-info"
                        style={{background: '#6c757d', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer'}}
                      >
                        ⬇️ Download File
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {research.research_image2 && (
              <div className="media-item">
                <h3>Research Image 2</h3>
                <div className="image-container">
                  <img 
                    src={research.research_image2.startsWith('http') 
                      ? research.research_image2 
                      : `http://localhost:5000${research.research_image2}`} 
                    alt="Research Image 2" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="image-error" style={{display: 'none'}}>
                    <span>🖼️</span>
                    <p>Image not available</p>
                  </div>
                </div>
              </div>
            )}

            {research.video_link && (
              <div className="media-item">
                <h3>Video</h3>
                <a 
                  href={research.video_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-info"
                >
                  <span>🎥</span> Watch Video
                </a>
              </div>
            )}

            {research.document && (
              <div className="media-item">
                <h3>Document</h3>
                <a 
                  href={research.document.startsWith('http') 
                    ? research.document 
                    : `http://localhost:5000${research.document}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-info"
                >
                  <span>📄</span> View Document
                </a>
              </div>
            )}

            {/* Show message if no media available */}
            {!research.research_image1 && !research.research_image2 && !research.video_link && !research.document && (
              <div className="no-media">
                <p className="no-data">No media or documents available for this report</p>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h2>Research Information</h2>
          <div className="info-grid">
            {research.research_category && (
              <div className="info-item">
                <label>Category</label>
                <p>{research.research_category}</p>
              </div>
            )}
            {research.research_date && (
              <div className="info-item">
                <label>Research Date</label>
                <p>{formatDate(research.research_date)}</p>
              </div>
            )}
            <div className="info-item">
              <label>Created Date</label>
              <p>{formatDate(research.created_date)}</p>
            </div>
            <div className="info-item">
              <label>Last Modified</label>
              <p>{formatDate(research.modified_date)}</p>
            </div>
            {research.created_by && (
              <div className="info-item">
                <label>Created By</label>
                <p>{research.created_by}</p>
              </div>
            )}
            {research.modified_by && (
              <div className="info-item">
                <label>Modified By</label>
                <p>{research.modified_by}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerViewMarketReport;
