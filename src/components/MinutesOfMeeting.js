import React, { useState } from 'react';
import './MinutesOfMeeting.css';
import CustomerMeetingMinutes from './customer/CustomerMeetingMinutes';

const MinutesOfMeeting = ({ userType, user }) => {
  // Always call hooks first
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Then handle conditional rendering
  if (userType === 'customer') {
    return <CustomerMeetingMinutes userType={userType} user={user} />;
  }

  // Original meeting minutes view for other cases

  const meetings = [
    {
      id: 1,
      title: 'Q1 Strategy Planning',
      date: '2025-01-20',
      time: '10:00 AM',
      attendees: ['John Smith', 'Sarah Johnson', 'Mike Brown'],
      status: 'Completed',
      agenda: ['Review Q4 performance', 'Set Q1 goals', 'Budget allocation'],
      minutes: 'Discussed quarterly targets and resource allocation. Agreed on 15% growth target for Q1.',
      actionItems: [
        { task: 'Prepare budget proposal', assignee: 'John Smith', dueDate: '2025-01-25' },
        { task: 'Update project timeline', assignee: 'Sarah Johnson', dueDate: '2025-01-22' }
      ]
    },
    {
      id: 2,
      title: 'Product Development Review',
      date: '2025-01-18',
      time: '2:00 PM',
      attendees: ['Alice Wilson', 'Bob Chen', 'David Lee'],
      status: 'Completed',
      agenda: ['Feature updates', 'User feedback review', 'Next sprint planning'],
      minutes: 'Reviewed user feedback and prioritized feature requests for next sprint.',
      actionItems: [
        { task: 'Update user interface', assignee: 'Alice Wilson', dueDate: '2025-01-30' }
      ]
    },
    {
      id: 3,
      title: 'Client Partnership Discussion',
      date: '2025-01-25',
      time: '3:00 PM',
      attendees: ['Emma Davis', 'Tom Wilson'],
      status: 'Scheduled',
      agenda: ['Partnership terms', 'Contract review', 'Timeline discussion'],
      minutes: '',
      actionItems: []
    }
  ];

  return (
    <div className="minutes-of-meeting">
      <div className="page-content">
        <div className="mom-header">
          <h1>Minutes of Meeting</h1>
          <p>Track meeting records and action items</p>
          <button className="btn btn-primary">Schedule New Meeting</button>
        </div>

        <div className="meetings-grid">
          {meetings.map(meeting => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-header">
                <h3>{meeting.title}</h3>
                <span className={`status-badge ${meeting.status.toLowerCase()}`}>
                  {meeting.status}
                </span>
              </div>
              
              <div className="meeting-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{meeting.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span>{meeting.time}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <span>{meeting.attendees.length} attendees</span>
                </div>
              </div>

              <div className="meeting-agenda">
                <h4>Agenda:</h4>
                <ul>
                  {meeting.agenda.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="meeting-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  View Details
                </button>
                {meeting.status === 'Completed' && (
                  <button className="btn btn-secondary">Export PDF</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedMeeting && (
          <div className="meeting-details-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedMeeting.title}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedMeeting(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="meeting-info">
                  <div className="info-section">
                    <h4>Meeting Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Date:</label>
                        <span>{selectedMeeting.date}</span>
                      </div>
                      <div className="info-item">
                        <label>Time:</label>
                        <span>{selectedMeeting.time}</span>
                      </div>
                      <div className="info-item">
                        <label>Status:</label>
                        <span className={`status-badge ${selectedMeeting.status.toLowerCase()}`}>
                          {selectedMeeting.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h4>Attendees</h4>
                    <div className="attendees-list">
                      {selectedMeeting.attendees.map((attendee, index) => (
                        <span key={index} className="attendee-tag">
                          👤 {attendee}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedMeeting.minutes && (
                    <div className="info-section">
                      <h4>Meeting Minutes</h4>
                      <div className="minutes-content">
                        {selectedMeeting.minutes}
                      </div>
                    </div>
                  )}

                  {selectedMeeting.actionItems.length > 0 && (
                    <div className="info-section">
                      <h4>Action Items</h4>
                      <div className="action-items">
                        {selectedMeeting.actionItems.map((item, index) => (
                          <div key={index} className="action-item">
                            <div className="action-task">{item.task}</div>
                            <div className="action-meta">
                              <span className="assignee">👤 {item.assignee}</span>
                              <span className="due-date">📅 Due: {item.dueDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinutesOfMeeting;