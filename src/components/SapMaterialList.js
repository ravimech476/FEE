import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './SapMaterialList.css';

const SapMaterialList = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, material: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [pagination.currentPage, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchMaterials();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter
      };
      
      const response = await apiService.getSapMaterials(params);
      
      if (response.success) {
        setMaterials(response.data.sapMaterials || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 1
        }));
      }
    } catch (err) {
      console.error('Error fetching SAP materials:', err);
      setError('Failed to load SAP materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleAdd = () => {
    navigate('/admin/settings/sap-materials/add');
  };

  const handleEdit = (id) => {
    navigate(`/admin/settings/sap-materials/edit/${id}`);
  };

  const handleDeleteClick = (material) => {
    setDeleteModal({ show: true, material });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.material) return;
    
    try {
      setDeleting(true);
      const response = await apiService.deleteSapMaterial(deleteModal.material.id);
      
      if (response.success) {
        setDeleteModal({ show: false, material: null });
        fetchMaterials();
      } else {
        setError(response.message || 'Failed to delete SAP material');
      }
    } catch (err) {
      console.error('Error deleting SAP material:', err);
      setError(err.message || 'Failed to delete SAP material. It may be linked to products.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, material: null });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && materials.length === 0) {
    return (
      <div className="sap-material-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading SAP Materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sap-material-list">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/settings')} className="back-btn">
            ← Back to Settings
          </button>
          <h1>SAP Material Numbers</h1>
        </div>
        <button onClick={handleAdd} className="add-btn">
          + Add SAP Material
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search SAP Material Number..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select value={statusFilter} onChange={handleStatusFilter} className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>SAP Material Number</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Modified Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No SAP Materials found. Click "Add SAP Material" to create one.
                </td>
              </tr>
            ) : (
              materials.map((material) => (
                <tr key={material.id}>
                  <td>{material.id}</td>
                  <td className="material-number">{material.sap_material_number}</td>
                  <td>
                    <span className={`status-badge status-${material.status}`}>
                      {material.status}
                    </span>
                  </td>
                  <td>{formatDate(material.created_date)}</td>
                  <td>{formatDate(material.modified_date)}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEdit(material.id)}
                      className="action-btn edit-btn"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClick(material)}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.currentPage === 1}
            className="page-btn"
          >
            «
          </button>
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="page-btn"
          >
            ‹
          </button>
          <span className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} items)
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="page-btn"
          >
            ›
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="page-btn"
          >
            »
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete SAP Material Number{' '}
              <strong>{deleteModal.material?.sap_material_number}</strong>?
            </p>
            <p className="warning-text">
              ⚠️ This action cannot be undone. If this material is linked to products, deletion will fail.
            </p>
            <div className="modal-actions">
              <button onClick={handleDeleteCancel} className="btn-cancel" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn-delete" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SapMaterialList;
