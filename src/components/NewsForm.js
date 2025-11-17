import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService, { API_IMAGE_URL } from "../services/apiService";
import "./NewsForm.css";

const NewsForm = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    published_date: "",
    display_order: 0,
    status: "active",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      fetchNews();
    }
  }, [id, mode]);

  const extractDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // → "2025-11-19"
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNewsById(id);
      if (response.success) {
        const news = response.data;
        setFormData({
          title: news.title || "",
          content: news.content || "",
          excerpt: news.excerpt || "",
          display_order: news.display_order || 0,
          status: news.status || "active",
          published_date:
            extractDate(news.published_date) || news.published_date,
        });

        // Set existing image preview
        if (news.image) {
          const imageUrl = `${API_IMAGE_URL}api/uploads/${news.image}`;
          console.log("Loading image from:", imageUrl);
          setImagePreview(imageUrl);
        }
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch news data");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    console.log("Name:", name);
    console.log("Value:", value);
    console.log("Type:", type);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append image file if selected
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      console.log("formDataToSend:", formDataToSend);

      if (mode === "create") {
        await apiService.createNewsWithImage(formDataToSend);
      } else {
        await apiService.updateNewsWithImage(id, formDataToSend);
      }
      navigate("/admin/news");
    } catch (err) {
      setError(err.message || "Failed to save news");
      setLoading(false);
    }
  };

  if (loading && mode === "edit") {
    return (
      <div className="news-form-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="news-form-container">
      <div className="page-header">
        <h1>{mode === "create" ? "Create News" : "Edit News"}</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/news")}
        >
          ← Back to List
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form
        onSubmit={handleSubmit}
        className="news-form"
        encType="multipart/form-data"
      >
        <div className="form-grid">
          {/* Title */}
          <div className="form-group full-width">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={500}
              placeholder="Enter news title"
            />
          </div>
          <div className="form-group full-width">
            <label htmlFor="content">
              Company Url <span className="required">*</span>
            </label>
            <input
              type="url"
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              maxLength={500}
              placeholder="https://www.example.com"
              
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="published_date">
              Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="published_date"
              name="published_date"
              value={formData.published_date}
              onChange={handleChange}
            />
          </div>

          {/* Content */}
          {/* <div className="form-group full-width">
            <label htmlFor="content">Content <span className="required">*</span></label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              placeholder="Enter full news content"
            />
          </div> */}

          {/* Excerpt */}
          {/* <div className="form-group full-width">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              placeholder="Short summary (optional)"
            />
          </div> */}

          {/* Image Upload */}
          <div className="form-group full-width">
            <label htmlFor="image">Featured Image </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small className="form-text">
              Max size: 5MB. Formats: JPEG, PNG, GIF, WebP
            </small>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          {/* Display Order */}
          {/* <div className="form-group">
            <label htmlFor="display_order">Display Order</label>
            <input
              type="number"
              id="display_order"
              name="display_order"
              value={formData.display_order}
              onChange={handleChange}
              min="0"
            />
          </div> */}

          {/* Status */}
          {/* <div className="form-group">
            <label htmlFor="status">Status <span className="required">*</span></label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div> */}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => navigate("/admin/news")}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? "Saving..."
              : mode === "create"
              ? "Create News"
              : "Update News"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsForm;
