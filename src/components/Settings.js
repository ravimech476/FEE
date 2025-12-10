import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Settings.css';
import apiService from '../services/apiService';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expertSettings, setExpertSettings] = useState({
    email: '',
    socialMedia: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchExpertSettings();
    
    // Check for success message from navigation state
    if (location.state?.message) {
      if (location.state.type === 'success') {
        setSuccess(location.state.message);
      } else {
        setError(location.state.message);
      }
      
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide the message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  }, [location.state]);

  const fetchExpertSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch expert email settings
      const expertData = await apiService.getExpertSettings();
      
      // Fetch social media links
      const socialMediaData = await apiService.getSocialMediaLinks();
      
      setExpertSettings({
        email: expertData.email || '',
        socialMedia: socialMediaData.data || []
      });
    } catch (error) {
      console.error('Failed to fetch expert settings:', error);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!expertSettings.email) {
      setError('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await apiService.updateExpertEmail({ email: expertSettings.email });
      
      setSuccess('Expert email updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to update email:', error);
      setError(error.message || 'Failed to update email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSocialMedia = () => {
    navigate('/admin/settings/social-media/add');
  };

  const handleEditSocialMedia = (socialMedia) => {
    navigate(`/admin/settings/social-media/edit/${socialMedia.id}`);
  };

  const handleDeleteSocialMedia = async (id) => {
    if (window.confirm('Are you sure you want to delete this social media link?')) {
      try {
        setLoading(true);
        setError(null);
        
        await apiService.deleteSocialMediaLink(id);
        
        // Refresh the social media list
        await fetchExpertSettings();
        
        setSuccess('Social media link deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.error('Failed to delete social media:', error);
        setError(error.message || 'Failed to delete social media link. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const getSocialMediaColor = (iconClass) => {
    const colorMap = {
      'fab fa-facebook-f': '#1877f2',
      'fab fa-twitter': '#1da1f2',
      'fab fa-instagram': '#e4405f',
      'fab fa-linkedin-in': '#0077b5',
      'fab fa-youtube': '#ff0000',
      'fab fa-whatsapp': '#25d366',
      'fab fa-telegram-plane': '#0088cc',
      'fab fa-tiktok': '#000000',
      'fab fa-pinterest-p': '#bd081c',
      'fab fa-snapchat-ghost': '#fffc00',
      'fas fa-globe': '#6c757d',
      'fab fa-discord': '#7289da',
      'fab fa-reddit-alien': '#ff4500',
      'fab fa-twitch': '#9146ff',
      'fas fa-link': '#6c757d'
    };
    return colorMap[iconClass] || '#6c757d';
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            onClick={clearMessages} 
            style={{ float: 'right', background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
          <button 
            onClick={clearMessages} 
            style={{ float: 'right', background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}

      <div className="settings-container">
        <div className="settings-content">
          {/* SAP Materials Section */}
          <div className="sap-materials-section" style={{ marginBottom: '24px' }}>
            <div className="settings-card">
              <div className="card-header">
                <h3>SAP Material Numbers</h3>
                <button 
                  onClick={() => navigate('/admin/settings/sap-materials')}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Manage SAP Materials →
                </button>
              </div>
              <div className="card-content">
                <p style={{ color: '#666', margin: 0 }}>
                  Configure SAP Material Numbers that can be linked to multiple products.
                  These are used in the Product forms as a multi-select field.
                </p>
              </div>
            </div>
          </div>

          <div className="ask-expert-section">
            <div className="section-header">
              <h2>Ask Expert Configuration</h2>
              <p>Configure email and social media contacts for expert support</p>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <h3>Expert Email</h3>
              </div>
              <div className="card-content">
                <div className="email-form">
                  <input
                    type="email"
                    value={expertSettings.email}
                    onChange={(e) => setExpertSettings(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter expert email address"
                    className="email-input"
                    disabled={loading}
                  />
                  <button 
                    onClick={handleEmailUpdate}
                    className="btn btn-primary"
                    disabled={loading || !expertSettings.email}
                  >
                    {loading ? 'Updating...' : 'Update Email'}
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <h3>Social Media Links</h3>
                <button 
                  onClick={handleAddSocialMedia}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  + Add Social Media
                </button>
              </div>
              <div className="card-content">
                {expertSettings.socialMedia.length === 0 ? (
                  <div className="empty-state">
                    <p>No social media links configured</p>
                    <button 
                      onClick={handleAddSocialMedia}
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      Add Your First Social Media Link
                    </button>
                  </div>
                ) : (
                  <div className="social-media-list">
                    {expertSettings.socialMedia.map(sm => (
                      <div key={sm.id} className="social-media-item">
                        <div className="social-info">
                          <span className="social-icon">
                            <i className={sm.icon} style={{ 
                              color: getSocialMediaColor(sm.icon) 
                            }}></i>
                          </span>
                          <div className="social-details">
                            <h4>{sm.name}</h4>
                            <a href={sm.link} target="_blank" rel="noopener noreferrer" className="social-link">
                              {sm.link}
                            </a>
                          </div>
                        </div>
                        <div className="social-actions">
                          <button 
                            onClick={() => handleEditSocialMedia(sm)}
                            className="btn-icon-only"
                            title="Edit"
                            disabled={loading}
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteSocialMedia(sm.id)}
                            className="btn-icon-only delete-btn"
                            title="Delete"
                            disabled={loading}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;