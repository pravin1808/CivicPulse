import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { getCategoryName } from '../../api/categories';
import { getIssueImage, IMAGE_UNAVAILABLE } from '../../utils/imageHelper';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Save, Upload, AlertTriangle, ShieldCheck, MapPin, ClipboardList, Info } from 'lucide-react';
import './WorkerIssueDetail.css';

const WorkerIssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Update status states
  const [status, setStatus] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchDetailsFromDashboardList = async () => {
    try {
      setLoading(true);
      setError('');
      // Workaround for backend GET /api/worker/issue/{id} bug:
      // Fetch all available issues for this worker, and locate this issue by ID.
      const response = await api.get('/api/worker/issues');
      const list = response.data || [];
      const matched = list.find(i => i.issue_id === id);
      
      if (matched) {
        setIssue(matched);
        setStatus(matched.status);
      } else {
        setError('Grievance not found or not in your department.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch grievance details from dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailsFromDashboardList();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitStatus = async (e) => {
    e.preventDefault();
    setActionMessage('');
    setSaveLoading(true);

    if (status === 'RESOLVED' && !imageFile) {
      setActionMessage('An after resolution image is required to mark the issue as resolved.');
      setSaveLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const statusDetails = { status };
      const statusBlob = new Blob([JSON.stringify(statusDetails)], {
        type: 'application/json'
      });
      formData.append('issue_status', statusBlob);

      await api.patch(`/api/worker/issue/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setActionMessage('Status updated successfully!');
      fetchDetailsFromDashboardList();
    } catch (err) {
      console.error(err);
      // Give a helpful descriptive message due to the backend bug
      setActionMessage('Failed to update status. Note: The backend contains a validation constraint matching citizen IDs with worker IDs, causing a permission mismatch.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <TopBar title="Inspect Issue" />
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <TopBar title="Error" />
          <div className="dashboard-body">
            <div className="error-message">
              <AlertTriangle size={36} />
              <p>{error || 'Grievance detail search failed.'}</p>
              <Link to="/worker/dashboard" className="btn btn-secondary mt-4">Back to Dashboard</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <TopBar title={`Inspect Issue — ${id}`} />

        <div className="dashboard-body animate-fade-in">
          <div className="back-link-row">
            <Link to="/worker/dashboard" className="btn btn-secondary btn-sm">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>

          {actionMessage && (
            <div className={`error-alert ${actionMessage.includes('successfully') ? 'alert-success-custom' : ''}`}>
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Backend validation notice widget */}
          <div className="warning-callout-card">
            <Info size={20} className="info-icon" />
            <div className="callout-content">
              <h4>Municipal Worker Notice</h4>
              <p>Under current server policy constraints, status updates must be audited. If updates encounter permissions limitations, please notify the city administrator.</p>
            </div>
          </div>

          <div className="detail-grid">
            {/* Left side: update status panel */}
            <div className="detail-left-column">
              <div className="info-card glass-card">
                <div className="info-card-header">
                  <div className="title-and-badge">
                    <h3>{issue.title}</h3>
                    <StatusBadge status={issue.status} />
                  </div>
                </div>

                <div className="info-card-body">
                  <div className="info-block">
                    <h4>Description</h4>
                    <p className="description-text">{issue.description}</p>
                  </div>

                  <div className="info-meta-grid">
                    <div className="meta-block">
                      <span className="meta-label">Category Group</span>
                      <span className="meta-value">{getCategoryName(issue.categoryId)}</span>
                    </div>
                    <div className="meta-block">
                      <span className="meta-label">Coordinates</span>
                      <span className="meta-value">{issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Panel */}
              <div className="update-status-card glass-card">
                <h3>Update Grievance Status</h3>
                <form onSubmit={handleSubmitStatus} className="status-update-form">
                  <div className="input-group">
                    <label htmlFor="status-select">Select New Status</label>
                    <select
                      id="status-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                      disabled={saveLoading}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  {status === 'RESOLVED' && (
                    <div className="input-group animate-fade-in">
                      <label>Upload Resolution Image Proof (Required)</label>
                      <div className="upload-box-wrapper">
                        <input
                          type="file"
                          id="resolution-upload"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden-file-input"
                          required
                        />
                        <label htmlFor="resolution-upload" className="upload-label">
                          {imagePreview ? (
                            <div className="preview-container">
                              <img src={imagePreview} alt="Resolution preview" className="image-preview-thumbnail" />
                              <span className="change-img-text">Tap to Change Image</span>
                            </div>
                          ) : (
                            <div className="upload-placeholder">
                              <Upload size={32} className="upload-icon" />
                              <h4>Upload Resolution Photo</h4>
                              <p>Show the resolved state of the grievance</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary submit-status-btn" disabled={saveLoading}>
                    <Save size={16} /> Apply Status Update
                  </button>
                </form>
              </div>
            </div>

            {/* Right side: photos evidence */}
            <div className="detail-right-column">
              <div className="photo-card glass-card">
                <h3>Grievance Evidence</h3>
                <div className="photos-container">
                  <div className="evidence-photo-box">
                    <span className="photo-tag before">Before / Reported</span>
                    <img 
                      src={getIssueImage(issue.imageUrl, issue.categoryId, false)} 
                      alt="Before evidence" 
                      className="evidence-img"
                      onError={(e) => { e.currentTarget.src = IMAGE_UNAVAILABLE; }}
                    />
                  </div>

                  {(issue.status === 'RESOLVED' || issue.afterImageUrl) && (
                    <div className="evidence-photo-box resolved-box">
                      <span className="photo-tag after">After / Resolved</span>
                      <img 
                        src={getIssueImage(issue.afterImageUrl, issue.categoryId, true)} 
                        alt="After resolution" 
                        className="evidence-img"
                        onError={(e) => { e.currentTarget.src = IMAGE_UNAVAILABLE; }}
                      />
                      <div className="resolution-ribbon">
                        <ShieldCheck size={16} /> Resolved Successfully
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerIssueDetail;
