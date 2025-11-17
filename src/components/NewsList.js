import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './NewsList.css';

const NewsList = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  useEffect(() => {
    fetchNews();
  }, [pagination.currentPage, statusFilter]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const response = await apiService.getAllNews(params);
      
      if (response.success) {
        setNews(response.data.news || []);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch news');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchNews();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    try {
      await apiService.deleteNews(id);
      fetchNews();
    } catch (err) {
      alert('Failed to delete news');
    }
  };

  const formatDate = (dateString) => {
   if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="news-list-container">
        <div className="loading">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="news-list-container">
      <div className="page-header">
        <h1>Company News Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/news/create')}
        >
          + Add News
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-search">Search</button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination(prev => ({ ...prev, currentPage: 1 }));
          }}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* News Table */}
      <div className="table-container">
        <table className="news-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              {/* <th>Category</th>
              <th>Status</th> */}
              <th>Published Date</th>
              {/* <th>Created Date</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.length > 0 ? (
              news.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="news-title">{item.title}</td>
                  {/* <td>{item.category || 'Uncategorized'}</td> */}
                  {/* <td>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status}
                    </span>
                  </td> */}
                  <td>{formatDate(item.published_date)}</td>
                  {/* <td>{formatDate(item.created_date)}</td> */}
                  <td className="actions">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => navigate(`/admin/news/${item.id}/view`)}
                      title="View"
                    >
                      👁️
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => navigate(`/admin/news/${item.id}/edit`)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No news articles found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="btn btn-pagination"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="btn btn-pagination"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsList;
