import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/apiService';
import './MarketResearch.css';

const ViewMarketResearch = () => {
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

  const handleEdit = () => {
    navigate(`/market-report/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this market research?')) {
      try {
        await apiService.deleteMarketReport(id);
        navigate('/market-report');
      } catch (error) {
        setError(error.message || 'Failed to delete research');
      }
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
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/market-report')} className="search-btn">
          Back to Market Reports
        </button>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="market-research-page">
        <div className="error-message">Research not found</div>
        <button onClick={() => navigate('/market-report')} className="search-btn">
          Back to Market Reports
        </button>
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
              <span className="research-number">{research.research_number}</span>
              <span className={`status-badge status-${research.status}`}>
                {research.status}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleEdit} className="search-btn" style={{background: '#007bff'}}>
              Edit
            </button>
          </div>
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
              <p>{research.research_long_description}</p>
            </div>
          </div>
        )}

        <div className="detail-section">
          <h2>Media & Documents</h2>
          <div className="media-grid">
            {research.research_image1 && (
              <div className="media-item">
                <h3>Research Image 1</h3>
                <div className="image-container">
                  <img 
                    src={research.research_image1.startsWith('http') 
                      ? research.research_image1 
                      : `http://localhost:5000${research.research_image1}`} 
                    alt="Research Image 1" 
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
          </div>
        </div>

        <div className="detail-section">
          <h2>Research Information</h2>
          <div className="info-grid">
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

export default ViewMarketResearch;
