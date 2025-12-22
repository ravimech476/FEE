import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService, { API_IMAGE_URL } from '../../services/apiService';
import './MeetingMinutes.css';
import './EditMeetingMinutes.css';

const EditMeetingMinutes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [customerCodes, setCustomerCodes] = useState([]);
  
  const [formData, setFormData] = useState({
    mom_number: '',
    title: '',
    meeting_date: '',
    customer_code: '',
    attendees: [],
    agenda: '',
    minutes: '',
    action_items: [],
    next_meeting_date: '',
    status: 'draft',
    attachments: []
  });

  const [attendeeInput, setAttendeeInput] = useState('');
  const [actionItemInput, setActionItemInput] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  useEffect(() => {
    fetchCustomerCodes();
    fetchMeetingDetails();
  }, [id]);

  const fetchCustomerCodes = async () => {
    try {
      const response = await apiService.getCustomerCodes();
      if (response.success) {
        setCustomerCodes(response.data);
      }
    } catch (error) {
      console.error('Error fetching customer codes:', error);
    }
  };

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const meeting = await apiService.getMeetingById(id);
      
      setFormData({
        mom_number: meeting.mom_number || '',
        title: meeting.title || '',
        meeting_date: meeting.meeting_date ? new Date(meeting.meeting_date).toISOString().split('T')[0] : '',
        customer_code: meeting.customer_code || '',
        attendees: meeting.attendees || [],
        agenda: meeting.agenda || '',
        minutes: meeting.minutes || '',
        action_items: meeting.action_items || [],
        next_meeting_date: meeting.next_meeting_date ? new Date(meeting.next_meeting_date).toISOString().split('T')[0] : '',
        status: meeting.status || 'draft',
        attachments: meeting.attachments || []
      });
      setExistingAttachments(meeting.attachments || []);
    } catch (error) {
      setError(error.message || 'Failed to fetch meeting details');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Always use FormData to ensure attachments are handled properly
      const formDataToSend = new FormData();
      
      // Add individual fields to FormData
      formDataToSend.append('mom_number', formData.mom_number);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('meeting_date', new Date(formData.meeting_date).toISOString());
      formDataToSend.append('customer_code', formData.customer_code || '');
      formDataToSend.append('attendees', JSON.stringify(formData.attendees));
      formDataToSend.append('agenda', formData.agenda);
      formDataToSend.append('minutes', formData.minutes);
      formDataToSend.append('action_items', JSON.stringify(formData.action_items));
      formDataToSend.append('next_meeting_date', formData.next_meeting_date 
        ? new Date(formData.next_meeting_date).toISOString() 
        : '');
      formDataToSend.append('status', formData.status);
      
      // Always send existing_attachments to preserve them
      formDataToSend.append('existing_attachments', JSON.stringify(existingAttachments));
      
      // Add new attachment files if any
      attachmentFiles.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      await apiService.updateMeetingWithAttachments(id, formDataToSend);
      
      navigate('/admin/meeting-minutes');
    } catch (error) {
      setError(error.message || 'Failed to update meeting minutes');
      setSaving(false);
    }
  };

  const addAttendee = () => {
    if (attendeeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, attendeeInput.trim()]
      }));
      setAttendeeInput('');
    }
  };

  const removeAttendee = (index) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const addActionItem = () => {
    if (actionItemInput.trim()) {
      setFormData(prev => ({
        ...prev,
        action_items: [...prev.action_items, {
          item: actionItemInput.trim(),
          assignee: '',
          due_date: '',
          status: 'pending'
        }]
      }));
      setActionItemInput('');
    }
  };

  const removeActionItem = (index) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.filter((_, i) => i !== index)
    }));
  };

  const updateActionItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachmentFiles(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Helper function to get proper image URL (handles double slash issue)
  const getAttachmentUrl = (url) => {
    if (!url) return '';
    // Remove leading slash if present to avoid double slash with API_IMAGE_URL
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${API_IMAGE_URL}${cleanUrl}`;
  };

  if (loading) {
    return (
      <div className="meeting-minutes-page">
        <div className="loading">Loading meeting details...</div>
      </div>
    );
  }

  return (
    <div className="meeting-minutes-page">
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/admin/meeting-minutes')} className="search-btn">
            ← Back to Meeting Minutes
          </button>
          <div className="header-info" style={{textAlign: 'center', flex: 1}}>
            <h1>Edit Meeting Minutes</h1>
            <div className="meeting-meta">
              <span className="mom-number">{formData.mom_number}</span>
              <span className={`status-badge status-${formData.status}`}>
                {formData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="edit-meeting-form-container">
        <form onSubmit={handleSubmit} className="edit-meeting-form">
          {/* Basic Information */}
          <div className="edit-meeting-form-section">
            <h3>Basic Information</h3>
            
            <div className="edit-meeting-form-row">
              <div className="edit-meeting-form-group">
                <label htmlFor="mom_number">MOM Number *</label>
                <input
                  type="text"
                  id="mom_number"
                  name="mom_number"
                  value={formData.mom_number}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter MOM number (e.g., MOM-2024-001)"
                  className="edit-meeting-form-control"
                  disabled={saving}
                />
              </div>
              <div className="edit-meeting-form-group">
                <label htmlFor="title">Meeting Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter meeting title"
                  className="edit-meeting-form-control"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="edit-meeting-form-row">
              <div className="edit-meeting-form-group">
                <label htmlFor="meeting_date">Meeting Date *</label>
                <input
                  type="date"
                  id="meeting_date"
                  name="meeting_date"
                  value={formData.meeting_date}
                  onChange={handleInputChange}
                  required
                  className="edit-meeting-form-control"
                  disabled={saving}
                />
              </div>
              <div className="edit-meeting-form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="edit-meeting-form-control"
                  disabled={saving}
                >
                  <option value="draft">Draft</option>
                  <option value="finalized">Finalized</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="edit-meeting-form-row">
              <div className="edit-meeting-form-group">
                <label htmlFor="customer_code">Customer Code</label>
                <select
                  id="customer_code"
                  name="customer_code"
                  value={formData.customer_code}
                  onChange={handleInputChange}
                  className="edit-meeting-form-control"
                  disabled={saving}
                >
                  <option value="">Select Customer Code</option>
                  {customerCodes.map((customer, index) => (
                    <option key={index} value={customer.customer_code}>
                      {customer.customer_code} - {customer.customer_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="edit-meeting-form-group">
                <label htmlFor="next_meeting_date">Next Meeting Date</label>
                <input
                  type="date"
                  id="next_meeting_date"
                  name="next_meeting_date"
                  value={formData.next_meeting_date}
                  onChange={handleInputChange}
                  className="edit-meeting-form-control"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="edit-meeting-form-section">
            <h3>Attachments</h3>
            
            {existingAttachments.length > 0 && (
              <div className="edit-meeting-existing-attachments">
                <h4>Current Attachments</h4>
                <div className="edit-meeting-attachments-grid">
                  {existingAttachments.map((attachment, index) => (
                    <div key={index} className="edit-meeting-attachment-card existing">
                      <div className="edit-meeting-attachment-icon-container">
                        {attachment.name && attachment.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <>
                            <img 
                              src={getAttachmentUrl(attachment.url)} 
                              alt={attachment.name}
                              className="edit-meeting-attachment-thumbnail"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="edit-meeting-attachment-file-icon" style={{display: 'none'}}>
                              {getFileIcon(attachment.name)}
                            </div>
                          </>
                        ) : (
                          <div className="edit-meeting-attachment-file-icon">
                            {getFileIcon(attachment.name)}
                          </div>
                        )}
                      </div>
                      <div className="edit-meeting-attachment-details">
                        <span className="edit-meeting-attachment-name" title={attachment.name}>
                          {attachment.name}
                        </span>
                        {attachment.size && (
                          <span className="edit-meeting-attachment-size">
                            {formatFileSize(attachment.size)}
                          </span>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeExistingAttachment(index)} 
                        className="edit-meeting-btn-remove-attachment"
                        title="Remove attachment"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="edit-meeting-new-attachments">
              <h4>Add New Attachments</h4>
              <div className="edit-meeting-attachment-upload">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  id="edit-meeting-file-upload"
                  className="edit-meeting-file-input"
                />
                <label htmlFor="edit-meeting-file-upload" className="edit-meeting-file-label">
                  <span className="edit-meeting-upload-icon">📁</span>
                  Choose Files
                </label>
                <span className="edit-meeting-file-info">
                  {attachmentFiles.length > 0 
                    ? `${attachmentFiles.length} file(s) selected` 
                    : 'No files chosen'}
                </span>
              </div>
              
              {attachmentFiles.length > 0 && (
                <div className="edit-meeting-attachments-grid new-files">
                  {attachmentFiles.map((file, index) => (
                    <div key={index} className="edit-meeting-attachment-card new">
                      <div className="edit-meeting-attachment-icon-container">
                        {file.type.startsWith('image/') ? (
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name}
                            className="edit-meeting-attachment-thumbnail"
                          />
                        ) : (
                          <div className="edit-meeting-attachment-file-icon">
                            {getFileIcon(file.name)}
                          </div>
                        )}
                      </div>
                      <div className="edit-meeting-attachment-details">
                        <span className="edit-meeting-attachment-name" title={file.name}>
                          {file.name}
                        </span>
                        <span className="edit-meeting-attachment-size">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(index)} 
                        className="edit-meeting-btn-remove-attachment"
                        title="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attendees */}
          <div className="edit-meeting-form-section">
            <h3>Attendees</h3>
            
            <div className="edit-meeting-form-row">
              <div className="edit-meeting-form-group full-width">
                <label>Add Attendee</label>
                <div className="edit-meeting-attendees-input">
                  <input
                    type="text"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    placeholder="Enter attendee name"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                    className="edit-meeting-form-control"
                    disabled={saving}
                  />
                  <button type="button" onClick={addAttendee} className="search-btn" style={{background: '#28a745', fontSize: '12px', padding: '8px 16px'}}>
                    Add Attendee
                  </button>
                </div>
                <div className="edit-meeting-attendees-list">
                  {formData.attendees.map((attendee, index) => (
                    <span key={index} className="edit-meeting-attendee-tag">
                      {attendee}
                      <button type="button" onClick={() => removeAttendee(index)} className="edit-meeting-remove-btn">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="edit-meeting-form-section">
            <h3>Meeting Details</h3>
            
            <div className="edit-meeting-form-row">
              <div className="edit-meeting-form-group full-width">
                <label htmlFor="agenda">Agenda</label>
                <textarea
                  id="agenda"
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter meeting agenda"
                  className="edit-meeting-form-control"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="edit-meeting-form-row">
              <div className="edit-meeting-form-group full-width">
                <label htmlFor="minutes">Meeting Minutes *</label>
                <textarea
                  id="minutes"
                  name="minutes"
                  value={formData.minutes}
                  onChange={handleInputChange}
                  rows="8"
                  required
                  placeholder="Enter detailed meeting minutes"
                  className="edit-meeting-form-control"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="edit-meeting-form-section">
            <h3>Action Items</h3>
            
            <div className="edit-meeting-form-row">
              <div className="edit-meeting-form-group full-width">
                <label>Add Action Item</label>
                <div className="edit-meeting-action-items-input">
                  <input
                    type="text"
                    value={actionItemInput}
                    onChange={(e) => setActionItemInput(e.target.value)}
                    placeholder="Enter action item"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActionItem())}
                    className="edit-meeting-form-control"
                    disabled={saving}
                  />
                  <button type="button" onClick={addActionItem} className="search-btn" style={{background: '#28a745', fontSize: '12px', padding: '8px 16px'}}>
                    Add Action Item
                  </button>
                </div>
                
                {formData.action_items.length > 0 && (
                  <div className="edit-meeting-action-items-list">
                    {formData.action_items.map((item, index) => (
                      <div key={index} className="edit-meeting-action-item">
                        <div className="edit-meeting-action-item-row">
                          <div className="edit-meeting-form-group">
                            <label>Action Item</label>
                            <input
                              type="text"
                              value={item.item}
                              onChange={(e) => updateActionItem(index, 'item', e.target.value)}
                              placeholder="Action item"
                              className="edit-meeting-form-control"
                              disabled={saving}
                            />
                          </div>
                          <div className="edit-meeting-form-group">
                            <label>Assignee</label>
                            <input
                              type="text"
                              value={item.assignee}
                              onChange={(e) => updateActionItem(index, 'assignee', e.target.value)}
                              placeholder="Assignee"
                              className="edit-meeting-form-control"
                              disabled={saving}
                            />
                          </div>
                        </div>
                        <div className="edit-meeting-action-item-row">
                          <div className="edit-meeting-form-group">
                            <label>Due Date</label>
                            <input
                              type="date"
                              value={item.due_date}
                              onChange={(e) => updateActionItem(index, 'due_date', e.target.value)}
                              className="edit-meeting-form-control"
                              disabled={saving}
                            />
                          </div>
                          <div className="edit-meeting-form-group">
                            <label>Status</label>
                            <select
                              value={item.status}
                              onChange={(e) => updateActionItem(index, 'status', e.target.value)}
                              className="edit-meeting-form-control"
                              disabled={saving}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeActionItem(index)} className="edit-meeting-remove-action-btn">
                          × Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="edit-meeting-form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/admin/meeting-minutes')} 
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
              {saving ? 'Updating...' : 'Update Meeting Minutes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  switch(ext) {
    case 'pdf': return '📄';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return '🖼️';
    default: return '📎';
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default EditMeetingMinutes;
