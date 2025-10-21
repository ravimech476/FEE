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
      setError(null);

      if (!user?.customer_code) {
        setError('Customer code not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      // For customers, fetch via customer-specific API
      const response = await apiService.getCustomerMarketReportById(user.customer_code, id);
      
      if (response.success) {
        setResearch(response.data);
      } else {
        setError(response.message || 'Failed to fetch market report details');
      }
    } catch (error) {
      console.error('Error fetching market report details:', error);
      setError(`Failed to load market report details. Please try again. ${JSON.stringify(error.response || error.message, null, 2)}`);
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
