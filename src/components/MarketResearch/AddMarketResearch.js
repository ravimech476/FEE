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
    research_title: ''
  });

  const [files, setFiles] = useState({
    research_image1: null
  });

  const [previews, setPreviews] = useState({
    research_image1: null
  });

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
      // Validate file type - Accept images, PDFs, and documents
      const validTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif', 
        'image/webp',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
      ];
      
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid file (Image, PDF, Word, or Excel document)');
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

      // Create preview ONLY for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews({
            research_image1: e.target.result
          });
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, clear preview
        setPreviews({
          research_image1: null
        });
      }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.research_title.trim()) {
      setError('Title is required');
      return;
    }

    if (!files.research_image1) {
      setError('Document is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add only the required fields
      formDataToSend.append('research_title', formData.research_title);
      
      // Add auto-generated fields with default values
      formDataToSend.append('research_number', `MR-${Date.now()}`);
      formDataToSend.append('research_name', formData.research_title);
      formDataToSend.append('status', 'active');
      formDataToSend.append('priority', '0');
      
      // Add image file
      if (files.research_image1) {
        formDataToSend.append('research_image1', files.research_image1);
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
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          {/* Upload Document */}
          <div className="add-market-research-form-section">
            <div className="add-market-research-form-row">
              <div className="add-market-research-form-group full-width">
                <label>Upload Document (Image/PDF/Word/Excel) *</label>
                <div className="add-market-research-file-upload-container">
                  <input
                    type="file"
                    id="research_image1-input"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
                    className="add-market-research-file-input"
                    required
                  />
                  <label htmlFor="research_image1-input" className="add-market-research-file-label">
                    <span className="add-market-research-upload-icon">📎</span>
                    Choose Document
                  </label>
                  {files.research_image1 && (
                    <div className="add-market-research-file-info-container">
                      <span className="add-market-research-file-name">{files.research_image1.name}</span>
                      <span className="file-type-badge">
                        {files.research_image1.type.includes('pdf') ? '📄 PDF' : 
                         files.research_image1.type.includes('word') ? '📝 DOC' :
                         files.research_image1.type.includes('excel') || files.research_image1.type.includes('spreadsheet') ? '📊 EXCEL' :
                         '🖼️ IMAGE'}
                      </span>
                      <button 
                        type="button" 
                        onClick={removeFile}
                        className="add-market-research-remove-file-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {/* Show preview only for images */}
                  {previews.research_image1 && files.research_image1?.type.startsWith('image/') && (
                    <div className="add-market-research-image-preview">
                      <img src={previews.research_image1} alt="Preview" />
                    </div>
                  )}
                  {/* Show file icon for non-image files */}
                  {files.research_image1 && !files.research_image1.type.startsWith('image/') && (
                    <div className="file-icon-preview">
                      {files.research_image1.type.includes('pdf') && <div className="file-icon">📄 PDF Document</div>}
                      {files.research_image1.type.includes('word') && <div className="file-icon">📝 Word Document</div>}
                      {(files.research_image1.type.includes('excel') || files.research_image1.type.includes('spreadsheet')) && <div className="file-icon">📊 Excel Spreadsheet</div>}
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
