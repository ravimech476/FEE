import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditSocialMedia.css';
import apiService from '../services/apiService';

const EditSocialMedia = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    link: ''
  });

  const socialMediaIcons = [
    { value: 'fab fa-facebook-f', label: 'Facebook', color: '#1877f2' },
    { value: 'fab fa-twitter', label: 'Twitter', color: '#1da1f2' },
    { value: 'fab fa-instagram', label: 'Instagram', color: '#e4405f' },
    { value: 'fab fa-linkedin-in', label: 'LinkedIn', color: '#0077b5' },
    { value: 'fab fa-youtube', label: 'YouTube', color: '#ff0000' },
    { value: 'fab fa-whatsapp', label: 'WhatsApp', color: '#25d366' },
    { value: 'fab fa-telegram-plane', label: 'Telegram', color: '#0088cc' },
    { value: 'fab fa-tiktok', label: 'TikTok', color: '#000000' },
    { value: 'fab fa-pinterest-p', label: 'Pinterest', color: '#bd081c' },
    { value: 'fab fa-snapchat-ghost', label: 'Snapchat', color: '#fffc00' },
    { value: 'fas fa-globe', label: 'Website', color: '#6c757d' },
    { value: 'fab fa-discord', label: 'Discord', color: '#7289da' },
    { value: 'fab fa-reddit-alien', label: 'Reddit', color: '#ff4500' },
    { value: 'fab fa-twitch', label: 'Twitch', color: '#9146ff' },
    { value: 'fas fa-link', label: 'Other', color: '#6c757d' }
  ];

  useEffect(() => {
    fetchSocialMediaData();
  }, [id]);

  const fetchSocialMediaData = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      // Fetch all social media links and find the one we need
      const response = await apiService.getSocialMediaLinks();
      const socialMediaLink = response.data.find(item => item.id.toString() === id);
      
      if (socialMediaLink) {
        setFormData({
          name: socialMediaLink.name,
          icon: socialMediaLink.icon,
          link: socialMediaLink.link
        });
      } else {
        setError('Social media link not found');
      }
    } catch (error) {
      console.error('Failed to fetch social media data:', error);
      setError('Failed to load social media data. Please try again.');
    } finally {
      setInitialLoading(false);
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
    
    if (!formData.name || !formData.icon || !formData.link) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await apiService.updateSocialMediaLink(id, formData);
      
      // Navigate back to settings with success message
      navigate('/admin/settings', { 
        state: { message: 'Social media link updated successfully!', type: 'success' } 
      });
    } catch (error) {
      console.error('Failed to update social media:', error);
      setError(error.message || 'Failed to update social media link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/settings');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this social media link? This action cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);
        
        await apiService.deleteSocialMediaLink(id);
        
        // Navigate back to settings with success message
        navigate('/admin/settings', { 
          state: { message: 'Social media link deleted successfully!', type: 'success' } 
        });
      } catch (error) {
        console.error('Failed to delete social media:', error);
        setError(error.message || 'Failed to delete social media link. Please try again.');
        setLoading(false);
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="edit-social-media-page">
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-social-media-page">
      <div className="page-header">
        <div className="header-content">
          <button 
            onClick={handleCancel}
            className="back-button"
            disabled={loading}
          >
            ← Back to Settings
          </button>
          <h1>Edit Social Media Link</h1>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="dismiss-btn"
          >
            ×
          </button>
        </div>
      )}

      <div className="form-container">
        <div className="form-card">
          <div className="card-header">
            <h2>Update Social Media Information</h2>
            <p>Edit the social media link details</p>
          </div>
          
          <form onSubmit={handleSubmit} className="social-media-form">
            <div className="form-group">
              <label htmlFor="name">Platform Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Facebook, Twitter, Instagram"
                className="form-input"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="icon">Icon *</label>
              <select
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className="form-input"
                disabled={loading}
                required
              >
                <option value="">Select an icon</option>
                {socialMediaIcons.map(icon => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
              {formData.icon && (
                <div className="icon-preview">
                  <span className="preview-label">Preview:</span>
                  <span className="preview-icon">
                    <i className={formData.icon} style={{ 
                      color: socialMediaIcons.find(icon => icon.value === formData.icon)?.color || '#6c757d' 
                    }}></i>
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="link">Link URL *</label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://..."
                className="form-input"
                disabled={loading}
                required
              />
              <div className="help-text">
                Please enter the full URL including https://
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Link'}
              </button>
              <div className="action-group">
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !formData.name || !formData.icon || !formData.link}
                >
                  {loading ? 'Updating...' : 'Update Social Media Link'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSocialMedia;