import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerMeetingMinutes.css';
import apiService from '../../services/apiService';

const CustomerMeetingMinutes = ({ userType, user }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('meeting_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, [searchTerm, sortBy, sortOrder, currentPage]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.customer_code) {
        setError('Customer code not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        order: sortOrder
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiService.getCustomerMeetings(user.customer_code, params);

      if (response.success) {
        setMeetings(response.data.meetings || response.data);
        setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to fetch meeting minutes');
      }
    } catch (error) {
      console.error('Error fetching meeting minutes:', error);
      setError('Failed to load meeting minutes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMeetings();
  };

  const handleViewMeeting = (id) => {
    navigate(`/meeting-details/${id}`);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return ' ↕️';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => setCurrentPage(1)} className="pagination-btn">
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-btn">
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="customer-meeting-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading meeting minutes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-meeting-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Meeting Minutes</h1>
          <p>View your meeting minutes and details</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

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
        <div className="table-info">
          <span>Total: {meetings.length} meetings</span>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="table-container">
        <table className="meetings-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('meeting_title')} className="sortable">
                Meeting Title {getSortIcon('meeting_title')}
              </th>
              <th onClick={() => handleSort('meeting_date')} className="sortable">
                Meeting Date {getSortIcon('meeting_date')}
              </th>
              <th onClick={() => handleSort('duration')} className="sortable">
                Duration {getSortIcon('duration')}
              </th>
              <th onClick={() => handleSort('attendees_count')} className="sortable">
                Attendees {getSortIcon('attendees_count')}
              </th>
              <th onClick={() => handleSort('created_date')} className="sortable">
                Created Date {getSortIcon('created_date')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id}>
                <td>
                  <div className="meeting-info">
                    <div className="meeting-title">{meeting.meeting_title}</div>
                    {meeting.meeting_description && (
                      <div className="meeting-description">
                        {meeting.meeting_description.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  {meeting.meeting_date 
                    ? new Date(meeting.meeting_date).toLocaleDateString('en-IN')
                    : 'N/A'
                  }
                </td>
                <td>{meeting.duration || 'N/A'}</td>
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
                  {meeting.created_date 
                    ? new Date(meeting.created_date).toLocaleDateString('en-IN')
                    : 'N/A'
                  }
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleViewMeeting(meeting.id)}
                      // className="btn btn-sm btn-outline"
                      title="View Meeting"
                    >
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meetings.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-content">
              <span className="empty-state-icon">📝</span>
              <h3>No meeting minutes found</h3>
              <p>No meeting minutes are available for your account.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          {renderPagination()}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerMeetingMinutes;
