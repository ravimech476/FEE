import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './NewsDetail.css';
import apiService, { API_IMAGE_URL } from '../services/apiService';

const NewsDetail = ({ user, userType }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call API to get news by ID
      const response = await apiService.getNewsById(id);
      
      if (response.success) {
        setNewsItem(response.data);
      } else {
        setError('News article not found');
      }
    } catch (error) {
      console.error('Error fetching news detail:', error);
      setError('Failed to load news article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="news-detail-container">
        <div className="loading-wrapper">
          <div className="spinner"></div>
          <span>Loading news article...</span>
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="news-detail-container">
        <div className="error-wrapper">
          <h2>⚠️ {error || 'News article not found'}</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-container">
      <div className="news-detail-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
      </div>

      <div className="news-detail-content">
        <article className="news-article">
          {/* Title */}
          <h1 className="news-title">{newsItem.title}</h1>

          {/* Meta Information */}
          <div className="news-meta">
            <span className="news-date">
              📅 {formatDate(newsItem.published_date || newsItem.created_date)}
            </span>
            {newsItem.author && (
              <span className="news-author">
                ✍️ {newsItem.author}
              </span>
            )}
            {newsItem.category && (
              <span className="news-category">
                🏷️ {newsItem.category}
              </span>
            )}
          </div>

          {/* Featured Image */}
          {newsItem.image_url && (
            <div className="news-image-wrapper">
              <img 
                src={newsItem.image_url.startsWith('http') ? newsItem.image_url : `${API_IMAGE_URL}${newsItem.image_url}`}
                alt={newsItem.title}
                className="news-featured-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Excerpt/Summary */}
          {newsItem.excerpt && (
            <div className="news-excerpt">
              <p>{newsItem.excerpt}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="news-body">
            {newsItem.content ? (
              <div 
                dangerouslySetInnerHTML={{ __html: newsItem.content }}
                className="news-content-html"
              />
            ) : (
              <p>No content available</p>
            )}
          </div>

          {/* Tags */}
          {newsItem.tags && newsItem.tags.length > 0 && (
            <div className="news-tags">
              <h3>Tags:</h3>
              <div className="tags-list">
                {newsItem.tags.map((tag, index) => (
                  <span key={index} className="tag-badge">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="news-footer">
            <div className="news-footer-info">
              {newsItem.status && (
                <span className="news-status">
                  Status: <strong>{newsItem.status}</strong>
                </span>
              )}
              {newsItem.views !== undefined && (
                <span className="news-views">
                  👁️ {newsItem.views} views
                </span>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;
