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
    research_number: '',
    research_name: '',
    research_title: '',
    research_short_description: '',
    research_long_description: '',
    video_link: '',
    priority: 0,
    status: 'active'
  });

  const [existingFiles, setExistingFiles] = useState({
    research_image1: null,
    research_image2: null,
    document: null
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
        research_number: research.research_number || '',
        research_name: research.research_name || '',
        research_title: research.research_title || '',
        research_short_description: research.research_short_description || '',
        research_long_description: research.research_long_description || '',
        video_link: research.video_link || '',
        priority: research.priority || 0,
        status: research.status || 'active'
      });

      // Set existing file URLs
      setExistingFiles({
        research_image1: research.research_image1 || null,
        research_image2: research.research_image2 || null,
        document: research.document || null
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

  const removeExistingFile = (fileType) => {
    setExistingFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add existing file references (if not removed)
      if (existingFiles.research_image1 && !files.research_image1) {
        formDataToSend.append('existing_research_image1', existingFiles.research_image1);
      }
      if (existingFiles.research_image2 && !files.research_image2) {
        formDataToSend.append('existing_research_image2', existingFiles.research_image2);
      }
      if (existingFiles.document && !files.document) {
        formDataToSend.append('existing_document', existingFiles.document);
      }
      
      // Add new files
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
        <h1>Edit Market Research</h1>
        <button 
          onClick={() => navigate('/market-report')} 
          className="btn btn-secondary"
        >
          Back to List
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="market-research-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Research Number *</label>
                <input
                  type="text"
                  name="research_number"
                  value={formData.research_number}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., MR-2024-001"
                />
              </div>
              <div className="form-group">
                <label>Research Name *</label>
                <input
                  type="text"
                  name="research_name"
                  value={formData.research_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter research name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Research Title</label>
              <input
                type="text"
                name="research_title"
                value={formData.research_title}
                onChange={handleInputChange}
                placeholder="Enter research title"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Display priority (0 = lowest)"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Content</h2>
            
            <div className="form-group">
              <label>Short Description</label>
              <textarea
                name="research_short_description"
                value={formData.research_short_description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Brief description of the research"
              />
            </div>

            <div className="form-group">
              <label>Long Description</label>
              <textarea
                name="research_long_description"
                value={formData.research_long_description}
                onChange={handleInputChange}
                rows="8"
                placeholder="Detailed description of the research"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Media & Documents</h2>
            
            <div className="form-group">
              <label>Video Link</label>
              <input
                type="url"
                name="video_link"
                value={formData.video_link}
                onChange={handleInputChange}
                placeholder="https://example.com/video"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Research Image 1</label>
                <div className="file-upload-container">
                  {existingFiles.research_image1 && !files.research_image1 && (
                    <div className="existing-file-display">
                      <div className="existing-image-preview">
                        <img 
                          src={existingFiles.research_image1.startsWith('http') 
                            ? existingFiles.research_image1 
                            : `http://localhost:5000${existingFiles.research_image1}`} 
                          alt="Current image 1"
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
                        onClick={() => removeExistingFile('research_image1')}
                        className="btn btn-sm btn-danger"
                      >
                        Remove Current Image
                      </button>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="research_image1-input"
                    onChange={(e) => handleFileChange(e, 'research_image1')}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="file-input"
                  />
                  <label htmlFor="research_image1-input" className="file-label">
                    <span className="upload-icon">📷</span>
                    {existingFiles.research_image1 && !files.research_image1 ? 'Replace Image' : 'Choose Image'}
                  </label>
                  
                  {files.research_image1 && (
                    <div className="file-info-container">
                      <span className="file-name">{files.research_image1.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFile('research_image1')}
                        className="remove-file-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {previews.research_image1 && (
                    <div className="image-preview">
                      <img src={previews.research_image1} alt="New preview" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Research Image 2</label>
                <div className="file-upload-container">
                  {existingFiles.research_image2 && !files.research_image2 && (
                    <div className="existing-file-display">
                      <div className="existing-image-preview">
                        <img 
                          src={existingFiles.research_image2.startsWith('http') 
                            ? existingFiles.research_image2 
                            : `http://localhost:5000${existingFiles.research_image2}`} 
                          alt="Current image 2"
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
                        onClick={() => removeExistingFile('research_image2')}
                        className="btn btn-sm btn-danger"
                      >
                        Remove Current Image
                      </button>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="research_image2-input"
                    onChange={(e) => handleFileChange(e, 'research_image2')}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="file-input"
                  />
                  <label htmlFor="research_image2-input" className="file-label">
                    <span className="upload-icon">📷</span>
                    {existingFiles.research_image2 && !files.research_image2 ? 'Replace Image' : 'Choose Image'}
                  </label>
                  
                  {files.research_image2 && (
                    <div className="file-info-container">
                      <span className="file-name">{files.research_image2.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFile('research_image2')}
                        className="remove-file-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {previews.research_image2 && (
                    <div className="image-preview">
                      <img src={previews.research_image2} alt="New preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Document</label>
              <div className="file-upload-container">
                {existingFiles.document && !files.document && (
                  <div className="existing-file-display">
                    <div className="existing-document">
                      <span className="doc-icon">📄</span>
                      <span className="doc-name">Current document</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeExistingFile('document')}
                      className="btn btn-sm btn-danger"
                    >
                      Remove Current Document
                    </button>
                  </div>
                )}
                
                <input
                  type="file"
                  id="document-input"
                  onChange={(e) => handleFileChange(e, 'document')}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="file-input"
                />
                <label htmlFor="document-input" className="file-label">
                  <span className="upload-icon">📄</span>
                  {existingFiles.document && !files.document ? 'Replace Document' : 'Choose Document'}
                </label>
                
                {files.document && (
                  <div className="file-info-container">
                    <span className="file-name">{files.document.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeFile('document')}
                      className="remove-file-btn"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/market-report')} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
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
