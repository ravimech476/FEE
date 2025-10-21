import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddSocialMedia.css';
import apiService from '../services/apiService';

const AddSocialMedia = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      
      await apiService.addSocialMediaLink(formData);
      
      // Navigate back to settings with success message
      navigate('/admin/settings', { 
        state: { message: 'Social media link added successfully!', type: 'success' } 
      });
    } catch (error) {
      console.error('Failed to add social media:', error);
      setError(error.message || 'Failed to add social media link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/settings');
  };

  return (
    <div className="add-social-media-page">
      <div className="page-header">
        <div className="header-content">
          <button 
            onClick={handleCancel}
            className="back-button"
            disabled={loading}
          >
            ← Back to Settings
          </button>
          <h1>Add Social Media Link</h1>
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
            <h2>Social Media Information</h2>
            <p>Add a new social media link for expert contact</p>
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
                {loading ? 'Adding...' : 'Add Social Media Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSocialMedia;