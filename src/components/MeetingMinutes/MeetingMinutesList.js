import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import './MeetingMinutes.css';

const MeetingMinutesList = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMeetings();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: filterStatus
      };
      const response = await apiService.getMeetings(params);
      setMeetings(response.meetings || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return '#ffc107';
      case 'finalized': return '#28a745';
      case 'archived': return '#6c757d';
      default: return '#007bff';
    }
  };

  const handleView = (meetingId) => {
    navigate(`/admin/meeting-minutes/view/${meetingId}`);
  };

  const handleEdit = (meetingId) => {
    navigate(`/admin/meeting-minutes/edit/${meetingId}`);
  };

  const handleDelete = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting minute?')) {
      try {
        await apiService.deleteMeeting(meetingId);
        fetchMeetings();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  if (loading && meetings.length === 0) {
    return (
      <div className="meeting-management">
        <div className="loading">Loading meetings...</div>
      </div>
    );
  }

  return (
    <div className="meeting-management">
      <div className="page-header">
        <h1>Meeting Minutes Management</h1>
        <button 
          onClick={() => navigate('/admin/meeting-minutes/add')} 
          className="search-btn"
        >
          Create New Meeting
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search meetings..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }} 
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="finalized">Finalized</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Meetings Table */}
      <div className="table-container">
        <table className="meetings-table">
          <thead>
            <tr>
              <th>MOM Number</th>
              <th>Title</th>
              <th>Meeting Date</th>
              <th>Attendees</th>
              <th>Status</th>
              <th>Action Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting.id}>
                <td>
                  <div className="mom-number">{meeting.mom_number || 'N/A'}</div>
                </td>
                <td>
                  <div className="meeting-title">{meeting.title}</div>
                </td>
                <td>{new Date(meeting.meeting_date).toLocaleDateString()}</td>
                <td>
                  <div className="attendees-list">
                    {meeting.attendees?.slice(0, 2).map((attendee, index) => (
                      <span key={index} className="attendee-tag">{attendee}</span>
                    ))}
                    {meeting.attendees?.length > 2 && (
                      <span className="more-attendees">+{meeting.attendees.length - 2} more</span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(meeting.status) }}
                    ></span>
                    <span className="status-text">{meeting.status}</span>
                  </div>
                </td>
                <td>
                  <div className="action-items-summary">
                    {meeting.action_items?.length || 0} items
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleView(meeting.id)}
                      className="btn-icon-only"
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => handleEdit(meeting.id)}
                      className="btn-icon-only"
                      title="Edit Meeting"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(meeting.id)}
                      className="btn-icon-only delete-btn"
                      title="Delete Meeting"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MeetingMinutesList;
