import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/apiService';
import './MeetingMinutes.css';

const ViewMeetingMinutes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMeetingDetails();
  }, [id]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMeetingById(id);
      setMeeting(data);
    } catch (error) {
      setError(error.message || 'Failed to fetch meeting details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/meeting-minutes/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this meeting minute?')) {
      try {
        await apiService.deleteMeeting(id);
        navigate('/admin/meeting-minutes');
      } catch (error) {
        setError(error.message || 'Failed to delete meeting');
      }
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

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      draft: 'status-draft',
      finalized: 'status-finalized',
      archived: 'status-archived'
    };
    return statusClasses[status] || 'status-draft';
  };

  if (loading) {
    return (
      <div className="meeting-minutes-page">
        <div className="loading">Loading meeting details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="meeting-minutes-page">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/admin/meeting-minutes')} className="search-btn">
          Back to Meeting Minutes
        </button>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="meeting-minutes-page">
        <div className="error-message">Meeting not found</div>
        <button onClick={() => navigate('/admin/meeting-minutes')} className="search-btn">
          Back to Meeting Minutes
        </button>
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
            <h1>View Meeting Minutes</h1>
            <div className="meeting-meta">
              <span className="mom-number">{meeting.mom_number}</span>
              <span className={`status-badge status-${meeting.status}`}>
                {meeting.status}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleEdit} className="search-btn" style={{background: '#007bff'}}>
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="meeting-details">
        <div className="detail-section">
          <h2>Basic Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>MOM Number</label>
              <p>{meeting.mom_number || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Meeting Title</label>
              <p>{meeting.title || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Meeting Date</label>
              <p>{formatDate(meeting.meeting_date)}</p>
            </div>
            <div className="detail-item">
              <label>Next Meeting Date</label>
              <p>{formatDate(meeting.next_meeting_date)}</p>
            </div>
            <div className="detail-item">
              <label>Created Date</label>
              <p>{formatDate(meeting.created_date)}</p>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <p>
                <span className={`status-badge ${getStatusBadgeClass(meeting.status)}`}>
                  {meeting.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Attendees</h2>
          {meeting.attendees && meeting.attendees.length > 0 ? (
            <div className="attendees-display">
              {meeting.attendees.map((attendee, index) => (
                <span key={index} className="attendee-badge">
                  {attendee}
                </span>
              ))}
            </div>
          ) : (
            <p className="no-data">No attendees recorded</p>
          )}
        </div>

        <div className="detail-section">
          <h2>Meeting Agenda</h2>
          {meeting.agenda ? (
            <div className="content-box">
              <p>{meeting.agenda}</p>
            </div>
          ) : (
            <p className="no-data">No agenda recorded</p>
          )}
        </div>

        <div className="detail-section">
          <h2>Meeting Minutes</h2>
          {meeting.minutes ? (
            <div className="content-box">
              <p>{meeting.minutes}</p>
            </div>
          ) : (
            <p className="no-data">No minutes recorded</p>
          )}
        </div>

        <div className="detail-section">
          <h2>Action Items</h2>
          {meeting.action_items && meeting.action_items.length > 0 ? (
            <div className="action-items-display">
              <table className="action-items-table">
                <thead>
                  <tr>
                    <th>Action Item</th>
                    <th>Assignee</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {meeting.action_items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item}</td>
                      <td>{item.assignee || 'Unassigned'}</td>
                      <td>{item.due_date ? formatDate(item.due_date) : 'No due date'}</td>
                      <td>
                        <span className={`action-status action-status-${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No action items recorded</p>
          )}
        </div>

        <div className="detail-section">
          <h2>Attachments</h2>
          {meeting.attachments && meeting.attachments.length > 0 ? (
            <div className="attachments-grid">
              {meeting.attachments.map((attachment, index) => (
                <div key={index} className="attachment-card">
                  <div className="attachment-icon-container">
                    {attachment.name && attachment.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <>
                        <img 
                          src={`http://localhost:5000${attachment.url}`} 
                          alt={attachment.name}
                          className="attachment-thumbnail"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="attachment-file-icon" style={{display: 'none'}}>
                          {getFileIcon(attachment.name)}
                        </div>
                      </>
                    ) : (
                      <div className="attachment-file-icon">
                        {getFileIcon(attachment.name)}
                      </div>
                    )}
                  </div>
                  <div className="attachment-details">
                    <a 
                      href={`http://localhost:5000${attachment.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="attachment-name"
                      title={attachment.name}
                    >
                      {attachment.name}
                    </a>
                    {attachment.size && (
                      <span className="attachment-size">
                        {formatFileSize(attachment.size)}
                      </span>
                    )}
                  </div>
                  <div className="attachment-actions">
                    <a 
                      href={`http://localhost:5000${attachment.url}`} 
                      download={attachment.name}
                      className="btn-download"
                      title="Download"
                    >
                      ⬇️
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No attachments</p>
          )}
        </div>
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

export default ViewMeetingMinutes;
