import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { extractErrorMessage } from '../../utils/errorHelper';
import { clearFieldError, getBackendFieldErrors, validateIssue } from '../../utils/formValidation';
import { DEPARTMENTS, getCategoriesByDept } from '../../api/categories';
import FieldErrors from '../../components/FieldErrors';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { ArrowLeft, MapPin, Upload, AlertCircle, Sparkles } from 'lucide-react';
import './ReportIssue.css';

const ReportIssue = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deptId, setDeptId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [geoLoading, setGeoLoading] = useState(false);

  const navigate = useNavigate();

  const handleDeptChange = (e) => {
    setDeptId(e.target.value);
    setCategoryId(''); // Reset category when department changes
    clearFieldError(setFieldErrors, 'deptId');
    clearFieldError(setFieldErrors, 'categoryId');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      clearFieldError(setFieldErrors, 'image');
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        clearFieldError(setFieldErrors, 'latitude');
        clearFieldError(setFieldErrors, 'longitude');
        setGeoLoading(false);
      },
      (err) => {
        console.error(geoLoading, err);
        alert('Unable to retrieve location. Please type manually.');
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validateIssue({ title, description, deptId, categoryId, latitude, longitude, imageFile });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const issueDetails = {
        title: title.trim(),
        description: description.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        categoryId: parseInt(categoryId)
      };

      // Create blob for issue register details to specify application/json content type
      const issueBlob = new Blob([JSON.stringify(issueDetails)], {
        type: 'application/json'
      });
      
      formData.append('issue', issueBlob);

      await api.post('/api/citizen/issue', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/citizen/dashboard');
    } catch (err) {
      console.error(err);
      const backendFieldErrors = getBackendFieldErrors(err);
      if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors(backendFieldErrors);
      } else {
        setError(extractErrorMessage(err, 'Failed to submit issue. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <TopBar title="Report New Issue" />

        <div className="dashboard-body animate-fade-in">
          <div className="back-link-row">
            <Link to="/citizen/dashboard" className="btn btn-secondary btn-sm">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>

          <div className="modern-report-card">
            <div className="card-header-bar">
              <Sparkles size={20} className="header-icon" />
              <h3>Report Municipal Grievance</h3>
            </div>

            <form onSubmit={handleSubmit} className="report-form" noValidate>
              {error && (
                <div className="error-alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="title">Brief Title of the Issue</label>
                <input
                  type="text"
                  id="title"
                  placeholder="e.g. Broken streetlamp or large pothole in middle of lane"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); clearFieldError(setFieldErrors, 'title'); }}
                  maxLength={100}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={fieldErrors.title ? 'issue-title-error' : undefined}
                  required
                />
                <FieldErrors errors={fieldErrors.title} id="issue-title-error" />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    value={deptId}
                    onChange={handleDeptChange}
                    aria-invalid={Boolean(fieldErrors.deptId)}
                    aria-describedby={fieldErrors.deptId ? 'issue-department-error' : undefined}
                    required
                  >
                    <option value="">Select Department</option>
                    {Object.entries(DEPARTMENTS).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                  <FieldErrors errors={fieldErrors.deptId} id="issue-department-error" />
                </div>

                <div className="input-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => { setCategoryId(e.target.value); clearFieldError(setFieldErrors, 'categoryId'); }}
                    required
                    disabled={!deptId}
                    aria-invalid={Boolean(fieldErrors.categoryId)}
                    aria-describedby={fieldErrors.categoryId ? 'issue-category-error' : undefined}
                  >
                    <option value="">Select Category</option>
                    {deptId && getCategoriesByDept(deptId).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <FieldErrors errors={fieldErrors.categoryId} id="issue-category-error" />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="description">Detailed Description</label>
                <textarea
                  id="description"
                  placeholder="Please provide specifics such as landmark nearby, description of the problem, duration, or any other critical details that can help workers identify and fix the issue."
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); clearFieldError(setFieldErrors, 'description'); }}
                  rows={4}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={fieldErrors.description ? 'issue-description-error' : undefined}
                  required
                />
                <FieldErrors errors={fieldErrors.description} id="issue-description-error" />
              </div>

              <div className="form-row geo-row">
                <div className="input-group">
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    id="latitude"
                    placeholder="e.g. 19.0760"
                    value={latitude}
                    onChange={(e) => { setLatitude(e.target.value); clearFieldError(setFieldErrors, 'latitude'); }}
                    aria-invalid={Boolean(fieldErrors.latitude)}
                    aria-describedby={fieldErrors.latitude ? 'issue-latitude-error' : undefined}
                    required
                  />
                  <FieldErrors errors={fieldErrors.latitude} id="issue-latitude-error" />
                </div>

                <div className="input-group">
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    id="longitude"
                    placeholder="e.g. 72.8777"
                    value={longitude}
                    onChange={(e) => { setLongitude(e.target.value); clearFieldError(setFieldErrors, 'longitude'); }}
                    aria-invalid={Boolean(fieldErrors.longitude)}
                    aria-describedby={fieldErrors.longitude ? 'issue-longitude-error' : undefined}
                    required
                  />
                  <FieldErrors errors={fieldErrors.longitude} id="issue-longitude-error" />
                </div>

                <div className="location-btn-wrapper">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="btn btn-secondary location-btn"
                    disabled={geoLoading}
                  >
                    <MapPin size={18} />
                    {geoLoading ? 'Fetching...' : 'Get Current GPS'}
                  </button>
                </div>
              </div>

              {/* Image Upload Drag and Drop box */}
              <div className="input-group">
                <label>Issue Image Proof (Required)</label>
                <div className="upload-box-wrapper">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                    aria-invalid={Boolean(fieldErrors.image)}
                    aria-describedby={fieldErrors.image ? 'issue-image-error' : undefined}
                    required
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    {imagePreview ? (
                      <div className="preview-container">
                        <img src={imagePreview} alt="Grievance preview" className="image-preview-thumbnail" />
                        <span className="change-img-text">Tap to Change Image</span>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <Upload size={32} className="upload-icon" />
                        <h4>Click or Drag Photo Here</h4>
                        <p>Upload a clear JPEG or PNG picture showing the exact issue</p>
                      </div>
                    )}
                  </label>
                </div>
                <FieldErrors errors={fieldErrors.image} id="issue-image-error" />
              </div>

              <button type="submit" className="btn btn-primary submit-issue-btn" disabled={loading}>
                {loading ? 'Submitting Grievance...' : 'Submit Grievance'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportIssue;
