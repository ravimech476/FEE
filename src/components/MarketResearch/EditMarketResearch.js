import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/apiService';
import './MarketResearch.css';
import './EditMarketResearch.css';

const EditMarketResearch = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    research_title: ''
  });

  const [existingFiles, setExistingFiles] = useState({
    research_image1: null
  });

  const [files, setFiles] = useState({
    research_image1: null
  });

  const [previews, setPreviews] = useState({
    research_image1: null
  });

  useEffect(() => {
    fetchResearchDetails();
  }, [id]);

  const fetchResearchDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMarketReportById(id);
      
      // Handle different response structures
      const research = response.data || response;
      
      setFormData({
        research_title: research.research_title || ''
      });

      // Set existing file URL
      setExistingFiles({
        research_image1: research.research_image1 || null
      });
    } catch (error) {
      setError(error.message || 'Failed to fetch research details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, JPG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('File size should be less than 5MB');
        return;
      }

      // Update files state
      setFiles({
        research_image1: file
      });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews({
          research_image1: e.target.result
        });
      };
      reader.readAsDataURL(file);

      // Clear any existing error
      setError(null);
    }
  };

  const removeFile = () => {
    setFiles({
      research_image1: null
    });
    
    setPreviews({
      research_image1: null
    });

    // Clear the file input
    const input = document.getElementById('research_image1-input');
    if (input) {
      input.value = '';
    }
  };

  const removeExistingFile = () => {
    setExistingFiles({
      research_image1: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.research_title.trim()) {
      setError('Title is required');
      return;
    }

    // Check if image exists (either existing or new)
    if (!existingFiles.research_image1 && !files.research_image1) {
      setError('Image is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add only the required field
      formDataToSend.append('research_title', formData.research_title);
      
      // Add existing file reference if not removed and no new file
      if (existingFiles.research_image1 && !files.research_image1) {
        formDataToSend.append('existing_research_image1', existingFiles.research_image1);
      }
      
      // Add new file if selected
      if (files.research_image1) {
        formDataToSend.append('research_image1', files.research_image1);
      }

      // Send request with FormData
      const response = await apiService.request(`/market-research/${id}`, {
        method: 'PUT',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${apiService.token}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        }
      });

      navigate('/market-report');
    } catch (error) {
      setError(error.message || 'Failed to update market research');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="market-research-page">
        <div className="loading">Loading research details...</div>
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
            <h1>Edit Market Research</h1>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="add-market-research-form-container">
        <form onSubmit={handleSubmit} className="add-market-research-form">
          {/* Title Field */}
          <div className="add-market-research-form-section">
            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group full-width">
                <label htmlFor="research_title">Title *</label>
                <input
                  type="text"
                  id="research_title"
                  name="research_title"
                  value={formData.research_title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  className="add-market-research-form-control"
                  disabled={saving}
                  required
                />
              </div>
            </div>
          </div>

          {/* Upload Image */}
          <div className="add-market-research-form-section">
            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group full-width">
                <label>Upload Image *</label>
                <div className="add-market-research-file-upload-container">
                  {existingFiles.research_image1 && !files.research_image1 && (
                    <div className="existing-file-display">
                      <div className="add-market-research-image-preview">
                        <img 
                          src={existingFiles.research_image1.startsWith('http') 
                            ? existingFiles.research_image1 
                            : `http://localhost:5000${existingFiles.research_image1}`} 
                          alt="Current image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="image-error" style={{display: 'none'}}>
                          <span>🖼️</span>
                          <p>Current image</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={removeExistingFile}
                        className="add-market-research-remove-file-btn"
                        style={{marginTop: '10px'}}
                      >
                        Remove Current Image
                      </button>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="research_image1-input"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="add-market-research-file-input"
                  />
                  <label htmlFor="research_image1-input" className="add-market-research-file-label">
                    <span className="add-market-research-upload-icon">📷</span>
                    {existingFiles.research_image1 && !files.research_image1 ? 'Replace Image' : 'Choose Image'}
                  </label>
                  
                  {files.research_image1 && (
                    <div className="add-market-research-file-info-container">
                      <span className="add-market-research-file-name">{files.research_image1.name}</span>
                      <button 
                        type="button" 
                        onClick={removeFile}
                        className="add-market-research-remove-file-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {previews.research_image1 && (
                    <div className="add-market-research-image-preview">
                      <img src={previews.research_image1} alt="New preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="add-market-research-form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/market-report')} 
              className="search-btn"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="search-btn"
              disabled={saving}
              style={{background: '#007bff'}}
            >
              {saving ? 'Updating...' : 'Update Research'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMarketResearch;
