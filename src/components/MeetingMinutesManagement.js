import React, { useState, useEffect } from 'react';
import './MeetingMinutesManagement.css';
import apiService from '../services/apiService';

const MeetingMinutesManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    meeting_date: '',
    attendees: [],
    agenda: '',
    minutes: '',
    action_items: [],
    next_meeting_date: '',
    status: 'draft'
  });

  const [attendeeInput, setAttendeeInput] = useState('');
  const [actionItemInput, setActionItemInput] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const meetingData = {
        ...formData,
        meeting_date: new Date(formData.meeting_date).toISOString(),
        next_meeting_date: formData.next_meeting_date 
          ? new Date(formData.next_meeting_date).toISOString() 
          : null
      };

      if (editingMeeting) {
        await apiService.updateMeeting(editingMeeting.id, meetingData);
      } else {
        await apiService.createMeeting(meetingData);
      }
      setShowModal(false);
      setEditingMeeting(null);
      resetForm();
      fetchMeetings();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title || '',
      meeting_date: meeting.meeting_date ? new Date(meeting.meeting_date).toISOString().split('T')[0] : '',
      attendees: meeting.attendees || [],
      agenda: meeting.agenda || '',
      minutes: meeting.minutes || '',
      action_items: meeting.action_items || [],
      next_meeting_date: meeting.next_meeting_date ? new Date(meeting.next_meeting_date).toISOString().split('T')[0] : '',
      status: meeting.status || 'draft'
    });
    setShowModal(true);
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

  const resetForm = () => {
    setFormData({
      title: '',
      meeting_date: '',
      attendees: [],
      agenda: '',
      minutes: '',
      action_items: [],
      next_meeting_date: '',
      status: 'draft'
    });
    setAttendeeInput('');
    setActionItemInput('');
  };

  const openCreateModal = () => {
    setEditingMeeting(null);
    resetForm();
    setShowModal(true);
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

  if (loading && meetings.length === 0) {
    return <div className="meeting-management"><div className="loading">Loading meetings...</div></div>;
  }

  return (
    <div className="meeting-management">
      <div className="page-header">
        <h1>Meeting Minutes Management</h1>
        <button onClick={openCreateModal} className="btn btn-primary">
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
              <th>Title</th>
              <th>Meeting Date</th>
              <th>Attendees</th>
              <th>Status</th>
              <th>Action Items</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting.id}>
                <td>
                  <div className="meeting-title">{meeting.title}</div>
                </td>
                <td>{new Date(meeting.meeting_date).toLocaleDateString()}</td>
                <td>
                  <div className="attendees-list">
                    {meeting.attendees?.slice(0, 3).map((attendee, index) => (
                      <span key={index} className="attendee-tag">{attendee}</span>
                    ))}
                    {meeting.attendees?.length > 3 && (
                      <span className="more-attendees">+{meeting.attendees.length - 3} more</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${meeting.status}`}>
                    {meeting.status}
                  </span>
                </td>
                <td>
                  <div className="action-items-summary">
                    {meeting.action_items?.length || 0} items
                  </div>
                </td>
                <td>{new Date(meeting.created_date).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(meeting)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(meeting.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
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

      {/* Meeting Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>{editingMeeting ? 'Edit Meeting' : 'Create New Meeting'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Meeting Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter meeting title"
                  />
                </div>
                <div className="form-group">
                  <label>Meeting Date *</label>
                  <input
                    type="date"
                    name="meeting_date"
                    value={formData.meeting_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Attendees</label>
                <div className="attendees-input">
                  <input
                    type="text"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    placeholder="Enter attendee name"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                  />
                  <button type="button" onClick={addAttendee} className="btn btn-sm btn-secondary">
                    Add
                  </button>
                </div>
                <div className="attendees-list">
                  {formData.attendees.map((attendee, index) => (
                    <span key={index} className="attendee-tag">
                      {attendee}
                      <button type="button" onClick={() => removeAttendee(index)} className="remove-btn">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Agenda</label>
                <textarea
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter meeting agenda"
                />
              </div>

              <div className="form-group">
                <label>Meeting Minutes *</label>
                <textarea
                  name="minutes"
                  value={formData.minutes}
                  onChange={handleInputChange}
                  rows="6"
                  required
                  placeholder="Enter meeting minutes"
                />
              </div>

              <div className="form-group">
                <label>Action Items</label>
                <div className="action-items-input">
                  <input
                    type="text"
                    value={actionItemInput}
                    onChange={(e) => setActionItemInput(e.target.value)}
                    placeholder="Enter action item"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActionItem())}
                  />
                  <button type="button" onClick={addActionItem} className="btn btn-sm btn-secondary">
                    Add
                  </button>
                </div>
                <div className="action-items-list">
                  {formData.action_items.map((item, index) => (
                    <div key={index} className="action-item">
                      <div className="action-item-content">
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => updateActionItem(index, 'item', e.target.value)}
                          placeholder="Action item"
                        />
                        <input
                          type="text"
                          value={item.assignee}
                          onChange={(e) => updateActionItem(index, 'assignee', e.target.value)}
                          placeholder="Assignee"
                        />
                        <input
                          type="date"
                          value={item.due_date}
                          onChange={(e) => updateActionItem(index, 'due_date', e.target.value)}
                        />
                        <select
                          value={item.status}
                          onChange={(e) => updateActionItem(index, 'status', e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <button type="button" onClick={() => removeActionItem(index)} className="remove-btn">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Next Meeting Date</label>
                  <input
                    type="date"
                    name="next_meeting_date"
                    value={formData.next_meeting_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="finalized">Finalized</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMeeting ? 'Update Meeting' : 'Create Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingMinutesManagement;