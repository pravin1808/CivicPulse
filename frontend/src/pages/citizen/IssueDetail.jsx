import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { getCategoryName, getDepartmentName, DEPARTMENTS, getCategoriesByDept } from '../../api/categories';
import { getIssueImage } from '../../utils/imageHelper';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Edit3, Trash2, Calendar, MapPin, CheckCircle, Save, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import './IssueDetail.css';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deptId, setDeptId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/citizen/issue/${id}`);
      setIssue(response.data);
      
      // Initialize edit fields
      if (response.data) {
        setTitle(response.data.title || '');
        setDescription(response.data.description || '');
        setLatitude(response.data.latitude || '');
        setLongitude(response.data.longitude || '');
        // We'll set category and department names or IDs if we need. Since response DTO has no category ID directly in SingleIssueResponseDto (it has issueId, title, description, status, createdAt, updatedAt, imageUrl, afterImageUrl), wait!
        // Let's check SingleIssueResponseDto fields:
        // SingleIssueResponseDto(String issueId, String title, String description, IssueStatus status, LocalDateTime createdAt, LocalDateTime updatedAt, String imageUrl, String afterImageUrl)
        // Wait, SingleIssueResponseDto does NOT return the category ID or department ID!
        // But Citizen Service `updateIssueById` takes `categoryId` in `IssueRequestDto`.
        // What category ID should we send if they edit it?
        // Ah! On the UI, if we don't have the original category ID, we can let them select a new one, or we can fetch all issues first (which DOES have category and department IDs!) and find this issue there.
        // That is an extremely smart and elegant solution! In `CitizenDashboard`, we had the complete list of issues which contains category and department IDs. We can fetch that list, locate this issue ID, and prefill the category and department IDs from it!
        // Let's write that logic to prefill categoryId and deptId perfectly.
        try {
          const listResponse = await api.get('/api/citizen/issues');
          const matched = (listResponse.data || []).find(i => i.issueId === id);
          if (matched) {
            setDeptId(matched.department || '');
            setCategoryId(matched.category || '');
          }
        } catch (listErr) {
          console.error("Couldn't prefetch category list details", listErr);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load issue details. You may not be authorized to view this issue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

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
        setGeoLoading(false);
      },
      (err) => {
        console.error(err);
        alert('Unable to retrieve location.');
        setGeoLoading(false);
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSaveLoading(true);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const issueDetails = {
        issue_id: id,
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        categoryId: parseInt(categoryId)
      };

      const issueBlob = new Blob([JSON.stringify(issueDetails)], {
        type: 'application/json'
      });
      formData.append('issue', issueBlob);

      await api.put('/api/citizen/issue', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
      fetchIssueDetails();
    } catch (err) {
      console.error(err);
      setError('Failed to update issue. Please check all fields.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue permanently?')) return;

    try {
      await api.delete(`/api/citizen/issue/${id}`);
      navigate('/citizen/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to delete issue.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <TopBar title="Issue Details" />
          <LoadingSpinner fullPage={false} />
        </main>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <TopBar title="Error" />
          <div className="dashboard-body">
            <div className="error-message">
              <AlertCircle size={36} />
              <p>{error}</p>
              <Link to="/citizen/dashboard" className="btn btn-secondary mt-4">Back to Dashboard</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Generate timeline milestones
  const getTimelineClass = (step) => {
    const status = issue?.status;
    const stepsOrder = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
    const currentIdx = stepsOrder.indexOf(status);
    const stepIdx = stepsOrder.indexOf(step);

    if (status === 'REJECTED') {
      return step === 'PENDING' ? 'completed' : step === 'RESOLVED' ? 'rejected-end' : 'skipped';
    }

    if (stepIdx <= currentIdx) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <TopBar title={`Issue - ${id}`} />

        <div className="dashboard-body animate-fade-in">
          <div className="back-link-row flex-row-between">
            <Link to="/citizen/dashboard" className="btn btn-secondary btn-sm">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            
            {!isEditing && issue?.status === 'PENDING' && (
              <div className="detail-action-buttons">
                <button className="btn btn-secondary btn-sm text-accent" onClick={() => setIsEditing(true)}>
                  <Edit3 size={16} /> Edit Issue
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  <Trash2 size={16} /> Delete Issue
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {isEditing ? (
            <div className="report-card glass-card">
              <div className="card-header-bar edit-header">
                <Edit3 size={20} className="header-icon" />
                <h3>Modify Issue Details</h3>
              </div>

              <form onSubmit={handleUpdate} className="report-form">
                <div className="input-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="department">Department</label>
                    <select
                      id="department"
                      value={deptId}
                      onChange={(e) => { setDeptId(e.target.value); setCategoryId(''); }}
                      required
                    >
                      <option value="">Select Department</option>
                      {Object.entries(DEPARTMENTS).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      disabled={!deptId}
                    >
                      <option value="">Select Category</option>
                      {deptId && getCategoriesByDept(deptId).map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="form-row geo-row">
                  <div className="input-group">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      id="latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      id="longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                    />
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

                <div className="input-group">
                  <label>Update Photo Proof (Optional)</label>
                  <div className="upload-box-wrapper">
                    <input
                      type="file"
                      id="image-update"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden-file-input"
                    />
                    <label htmlFor="image-update" className="upload-label">
                      {imagePreview ? (
                        <div className="preview-container">
                          <img src={imagePreview} alt="Grievance preview" className="image-preview-thumbnail" />
                          <span className="change-img-text">Tap to Change Image</span>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <ImageIcon size={32} className="upload-icon" />
                          <h4>Upload New Image</h4>
                          <p>Leave empty to keep the original reported photo</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="edit-actions-row">
                  <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} disabled={saveLoading}>
                    <X size={16} /> Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saveLoading}>
                    <Save size={16} /> {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="detail-grid">
              {/* Left Column: Ticket Details */}
              <div className="detail-left-column">
                {/* Issue card */}
                <div className="info-card glass-card">
                  <div className="info-card-header">
                    <div className="title-and-badge">
                      <h3>{issue.title}</h3>
                      <StatusBadge status={issue.status} />
                    </div>
                    <span className="info-meta">
                      <Calendar size={14} /> Reported on {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  <div className="info-card-body">
                    <div className="info-block">
                      <h4>Description</h4>
                      <p className="description-text">{issue.description}</p>
                    </div>

                    <div className="info-meta-grid">
                      <div className="meta-block">
                        <span className="meta-label">Department</span>
                        <span className="meta-value">{deptId ? getDepartmentName(deptId) : 'Fetching...'}</span>
                      </div>
                      <div className="meta-block">
                        <span className="meta-label">Category</span>
                        <span className="meta-value">{categoryId ? getCategoryName(categoryId) : 'Fetching...'}</span>
                      </div>
                      <div className="meta-block">
                        <span className="meta-label">Latitude</span>
                        <span className="meta-value">{latitude}</span>
                      </div>
                      <div className="meta-block">
                        <span className="meta-label">Longitude</span>
                        <span className="meta-value">{longitude}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="timeline-card glass-card">
                  <h3>Issue Resolution Timeline</h3>
                  <div className="timeline">
                    <div className={`timeline-step ${getTimelineClass('PENDING')}`}>
                      <div className="timeline-bullet">1</div>
                      <div className="timeline-details">
                        <h4>Grievance Submitted</h4>
                        <p>Issue recorded and pending validation by local administrator.</p>
                      </div>
                    </div>

                    <div className={`timeline-step ${getTimelineClass('ASSIGNED')}`}>
                      <div className="timeline-bullet">2</div>
                      <div className="timeline-details">
                        <h4>Assigned to Department</h4>
                        <p>Admin assigned issue to a verified field worker.</p>
                      </div>
                    </div>

                    <div className={`timeline-step ${getTimelineClass('IN_PROGRESS')}`}>
                      <div className="timeline-bullet">3</div>
                      <div className="timeline-details">
                        <h4>Work In Progress</h4>
                        <p>Field worker is currently inspecting or repairing the issue.</p>
                      </div>
                    </div>

                    <div className={`timeline-step ${getTimelineClass('RESOLVED')}`}>
                      <div className="timeline-bullet">4</div>
                      <div className="timeline-details">
                        {issue.status === 'REJECTED' ? (
                          <>
                            <h4 className="text-danger">Issue Rejected</h4>
                            <p>This report has been audited and rejected by municipal administration.</p>
                          </>
                        ) : (
                          <>
                            <h4>Issue Resolved</h4>
                            <p>Grievance addressed successfully. Resolution photo uploaded by worker.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Photos and proofs */}
              <div className="detail-right-column">
                <div className="photo-card glass-card">
                  <h3>Grievance Evidence</h3>
                  <div className="photos-container">
                    <div className="evidence-photo-box">
                      <span className="photo-tag before">Before / Reported</span>
                      <img 
                        src={getIssueImage(issue.imageUrl, categoryId, false)} 
                        alt="Before evidence" 
                        className="evidence-img"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1590483736622-39da8af7ff8f?auto=format&fit=crop&w=600&q=80' }}
                      />
                    </div>

                    {issue.status === 'RESOLVED' && (
                      <div className="evidence-photo-box resolved-box">
                        <span className="photo-tag after">After / Resolved</span>
                        <img 
                          src={getIssueImage(issue.afterImageUrl, categoryId, true)} 
                          alt="After resolution" 
                          className="evidence-img"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&q=80' }}
                        />
                        <div className="resolution-ribbon">
                          <CheckCircle size={16} /> Resolved Successfully
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default IssueDetail;
