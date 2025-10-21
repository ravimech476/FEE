import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import './MarketResearch.css';
import './AddMarketResearch.css';

const AddMarketResearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    research_number: '',
    research_name: '',
    research_title: '',
    research_short_description: '',
    research_long_description: '',
    video_link: '',
    priority: 0,
    status: 'active'
  });

  const [files, setFiles] = useState({
    research_image1: null,
    research_image2: null,
    document: null
  });

  const [previews, setPreviews] = useState({
    research_image1: null,
    research_image2: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file types
      if (fileType === 'research_image1' || fileType === 'research_image2') {
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
          setError(`Please select a valid image file (JPEG, JPG, PNG, GIF, WebP) for ${fileType}`);
          return;
        }
      } else if (fileType === 'document') {
        const validDocTypes = ['application/pdf', 'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validDocTypes.includes(file.type)) {
          setError('Please select a valid document file (PDF, DOC, DOCX, XLS, XLSX)');
          return;
        }
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError(`File size should be less than 5MB for ${fileType}`);
        return;
      }

      // Update files state
      setFiles(prev => ({
        ...prev,
        [fileType]: file
      }));

      // Create preview for images
      if (fileType === 'research_image1' || fileType === 'research_image2') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({
            ...prev,
            [fileType]: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }

      // Clear any existing error
      setError(null);
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
    
    if (fileType === 'research_image1' || fileType === 'research_image2') {
      setPreviews(prev => ({
        ...prev,
        [fileType]: null
      }));
    }

    // Clear the file input
    const input = document.getElementById(`${fileType}-input`);
    if (input) {
      input.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add files
      if (files.research_image1) {
        formDataToSend.append('research_image1', files.research_image1);
      }
      if (files.research_image2) {
        formDataToSend.append('research_image2', files.research_image2);
      }
      if (files.document) {
        formDataToSend.append('document', files.document);
      }

      // Send request with FormData
      const response = await apiService.request('/market-research', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${apiService.token}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        }
      });

      navigate('/market-report');
    } catch (error) {
      setError(error.message || 'Failed to create market research');
      setLoading(false);
    }
  };

  return (
    <div className="market-research-page">
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/market-report')} className="search-btn">
            ← Back to Market Reports
          </button>
          <div className="header-info" style={{textAlign: 'center', flex: 1}}>
            <h1>Add Market Research</h1>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="add-market-research-form-container">
        <form onSubmit={handleSubmit} className="add-market-research-form">
          {/* Basic Information */}
          <div className="add-market-research-form-section">
            <h3>Basic Information</h3>
            
            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group">
                <label htmlFor="research_number">Research Number *</label>
                <input
                  type="text"
                  id="research_number"
                  name="research_number"
                  value={formData.research_number}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., MR-2024-001"
                  className="add-market-research-form-control"
                  disabled={loading}
                />
              </div>
              <div className="add-market-research-form-group">
                <label htmlFor="research_name">Research Name *</label>
                <input
                  type="text"
                  id="research_name"
                  name="research_name"
                  value={formData.research_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter research name"
                  className="add-market-research-form-control"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group full-width">
                <label htmlFor="research_title">Research Title</label>
                <input
                  type="text"
                  id="research_title"
                  name="research_title"
                  value={formData.research_title}
                  onChange={handleInputChange}
                  placeholder="Enter research title"
                  className="add-market-research-form-control"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group">
                <label htmlFor="priority">Priority</label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Display priority (0 = lowest)"
                  className="add-market-research-form-control"
                  disabled={loading}
                />
              </div>
              <div className="add-market-research-form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="add-market-research-form-control"
                  disabled={loading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="add-market-research-form-section">
            <h3>Content</h3>
            
            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group full-width">
                <label htmlFor="research_short_description">Short Description</label>
                <textarea
                  id="research_short_description"
                  name="research_short_description"
                  value={formData.research_short_description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the research"
                  className="add-market-research-form-control"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group full-width">
                <label htmlFor="research_long_description">Long Description</label>
                <textarea
                  id="research_long_description"
                  name="research_long_description"
                  value={formData.research_long_description}
                  onChange={handleInputChange}
                  rows="8"
                  placeholder="Detailed description of the research"
                  className="add-market-research-form-control"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Media & Documents */}
          <div className="add-market-research-form-section">
            <h3>Media & Documents</h3>
            
            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group full-width">
                <label htmlFor="video_link">Video Link</label>
                <input
                  type="url"
                  id="video_link"
                  name="video_link"
                  value={formData.video_link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/video"
                  className="add-market-research-form-control"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group">
                <label>Research Image 1</label>
                <div className="add-market-research-file-upload-container">
                  <input
                    type="file"
                    id="research_image1-input"
                    onChange={(e) => handleFileChange(e, 'research_image1')}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="add-market-research-file-input"
                  />
                  <label htmlFor="research_image1-input" className="add-market-research-file-label">
                    <span className="add-market-research-upload-icon">📷</span>
                    Choose Image
                  </label>
                  {files.research_image1 && (
                    <div className="add-market-research-file-info-container">
                      <span className="add-market-research-file-name">{files.research_image1.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFile('research_image1')}
                        className="add-market-research-remove-file-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {previews.research_image1 && (
                    <div className="add-market-research-image-preview">
                      <img src={previews.research_image1} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="add-market-research-form-group">
                <label>Research Image 2</label>
                <div className="add-market-research-file-upload-container">
                  <input
                    type="file"
                    id="research_image2-input"
                    onChange={(e) => handleFileChange(e, 'research_image2')}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="add-market-research-file-input"
                  />
                  <label htmlFor="research_image2-input" className="add-market-research-file-label">
                    <span className="add-market-research-upload-icon">📷</span>
                    Choose Image
                  </label>
                  {files.research_image2 && (
                    <div className="add-market-research-file-info-container">
                      <span className="add-market-research-file-name">{files.research_image2.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFile('research_image2')}
                        className="add-market-research-remove-file-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {previews.research_image2 && (
                    <div className="add-market-research-image-preview">
                      <img src={previews.research_image2} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group full-width">
                <label>Document</label>
                <div className="add-market-research-file-upload-container">
                  <input
                    type="file"
                    id="document-input"
                    onChange={(e) => handleFileChange(e, 'document')}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="add-market-research-file-input"
                  />
                  <label htmlFor="document-input" className="add-market-research-file-label">
                    <span className="add-market-research-upload-icon">📄</span>
                    Choose Document
                  </label>
                  {files.document && (
                    <div className="add-market-research-file-info-container">
                      <span className="add-market-research-file-name">{files.document.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFile('document')}
                        className="add-market-research-remove-file-btn"
                      >
                        ✕
                      </button>
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
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="search-btn"
              disabled={loading}
              style={{background: '#007bff'}}
            >
              {loading ? 'Creating...' : 'Create Research'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarketResearch;
