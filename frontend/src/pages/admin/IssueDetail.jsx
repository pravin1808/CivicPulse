import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { getCategoryName, getDepartmentName } from '../../api/categories';
import { getIssueImage, IMAGE_UNAVAILABLE } from '../../utils/imageHelper';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Calendar, MapPin, User, CheckCircle2, ClipboardCheck, Phone, Mail, Home, Clock, Users, ShieldAlert } from 'lucide-react';
import '../citizen/IssueDetail.css'; // Reuse citizen details layout styling
import './IssueDetail.css';

const AdminIssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null); // SingleIssueResponseDto
  const [dashboardIssue, setDashboardIssue] = useState(null); // contains category, department, citizen info
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assignment states
  const [assigning, setAssigning] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ASSIGNED');
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [issueRes, allIssuesRes, workersRes] = await Promise.all([
        api.get(`/api/admin/issue/${id}`),
        api.get('/api/admin/issues'),
        api.get('/api/admin/workers')
      ]);

      setIssue(issueRes.data);
      setWorkers(workersRes.data || []);

      // Find matched issue in full dashboard list to get Category and Department numbers
      const matched = (allIssuesRes.data || []).find(i => i.issueId === id);
      if (matched) {
        setDashboardIssue(matched);
        // The dashboard DTO does not include workerId. Do not discard a
        // worker selection made during this session after the refresh below.
        setSelectedWorkerId((currentWorkerId) => matched.workerId ?? currentWorkerId);
        setSelectedStatus(matched.status);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch detailed issue information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setActionMessage('');

    if (!selectedWorkerId) {
      setActionMessage('Select a department worker before assigning this issue.');
      return;
    }

    setSaveLoading(true);

    try {
      const payload = {
        workerId: selectedWorkerId ? parseInt(selectedWorkerId) : null,
        status: selectedStatus
      };

      await api.patch(`/api/admin/issue/assign/${id}`, payload);
      setActionMessage('Assignment and status updated successfully!');
      setAssigning(false);
      fetchDetails(); // Refresh
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setActionMessage(typeof err.response.data === 'string' ? err.response.data : 'Failed to save changes.');
      } else {
        setActionMessage('Server error while saving assignment.');
      }
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
              <ShieldAlert size={36} />
              <p>{error || 'Issue not found'}</p>
              <Link to="/admin/dashboard" className="btn btn-secondary mt-4">Back to Dashboard</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const getWorkerDepartmentId = (worker) => Number(
    worker.dept_Id ?? worker.dept_id ?? worker.deptId ?? worker.departmentId
  );

  // Workers belonging to this department
  const eligibleWorkers = dashboardIssue
    ? workers.filter((worker) => getWorkerDepartmentId(worker) === Number(dashboardIssue.department))
    : [];

  // Get current worker name if assigned
  const currentWorker = workers.find(
    (worker) => Number(worker.id) === Number(dashboardIssue?.workerId ?? selectedWorkerId)
  );

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <TopBar title={`Inspect Issue — ${id}`} />

        <div className="dashboard-body animate-fade-in">
          <div className="back-link-row flex-row-between">
            <Link to="/admin/issues" className="btn btn-secondary btn-sm">
              <ArrowLeft size={16} /> Back to List
            </Link>
            
            <button className="btn btn-primary btn-sm" onClick={() => setAssigning(!assigning)}>
              <ClipboardCheck size={16} /> {assigning ? 'Cancel Operations' : 'Assign Worker / Update Status'}
            </button>
          </div>

          {actionMessage && (
            <div className={`error-alert ${actionMessage.includes('successfully') ? 'alert-success-custom' : ''}`}>
              <span>{actionMessage}</span>
            </div>
          )}

          {assigning && (
            <div className="report-card glass-card assign-panel animate-fade-in">
              <div className="card-header-bar assign-header">
                <ClipboardCheck size={20} className="header-icon" />
                <h3>Assign Dispatch &amp; Update Status</h3>
              </div>
              <form onSubmit={handleAssignSubmit} className="report-form">
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="worker-select">Select Dispatch Worker</label>
                    <select
                      id="worker-select"
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      disabled={saveLoading}
                    >
                      <option value="">Select a worker</option>
                      {workers.map((worker) => {
                        const canBeAssigned = getWorkerDepartmentId(worker) === Number(dashboardIssue?.department);
                        return (
                          <option key={worker.id} value={worker.id} disabled={!canBeAssigned}>
                            {worker.name} ({worker.email}){canBeAssigned ? '' : ' — different department'}
                          </option>
                        );
                      })}
                    </select>
                    {eligibleWorkers.length === 0 && (
                      <span className="field-hint warning-hint">
                        No registered worker belongs to this issue's department.
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="status-select">Set Status</label>
                    <select
                      id="status-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
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
                </div>

                <div className="edit-actions-row">
                  <button type="button" className="btn btn-secondary" onClick={() => setAssigning(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saveLoading}>
                    {saveLoading ? 'Saving...' : 'Apply Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="detail-grid">
            {/* Left Column */}
            <div className="detail-left-column">
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
                      <span className="meta-value">{dashboardIssue ? getDepartmentName(dashboardIssue.department) : 'N/A'}</span>
                    </div>
                    <div className="meta-block">
                      <span className="meta-label">Category</span>
                      <span className="meta-value">{dashboardIssue ? getCategoryName(dashboardIssue.category) : 'N/A'}</span>
                    </div>
                    <div className="meta-block">
                      <span className="meta-label">Latitude</span>
                      <span className="meta-value">{dashboardIssue?.latitude}</span>
                    </div>
                    <div className="meta-block">
                      <span className="meta-label">Longitude</span>
                      <span className="meta-value">{dashboardIssue?.longitude}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen Information Profile Card */}
              <div className="citizen-profile-card glass-card">
                <div className="card-sub-header">
                  <User size={18} className="text-accent" />
                  <h3>Reporter Information</h3>
                </div>
                <div className="profile-details-grid">
                  <div className="profile-detail-item">
                    <User size={16} className="text-muted" />
                    <div>
                      <span>Full Name</span>
                      <h4>{dashboardIssue?.citizen?.name || 'Unknown Citizen'}</h4>
                    </div>
                  </div>
                  <div className="profile-detail-item">
                    <Mail size={16} className="text-muted" />
                    <div>
                      <span>Email Address</span>
                      <h4>{dashboardIssue?.citizen?.email || 'N/A'}</h4>
                    </div>
                  </div>
                  <div className="profile-detail-item">
                    <Phone size={16} className="text-muted" />
                    <div>
                      <span>Phone Number</span>
                      <h4>{dashboardIssue?.citizen?.phoneNumber || 'N/A'}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="detail-right-column">
              {/* Workers Assignment Info Card */}
              <div className="worker-assignment-card glass-card">
                <div className="card-sub-header">
                  <Users size={18} className="text-accent" />
                  <h3>Assigned Field Worker</h3>
                </div>
                {currentWorker ? (
                  <div className="assigned-worker-profile">
                    <div className="worker-avatar">W</div>
                    <div className="worker-info-details">
                      <h4>{currentWorker.name}</h4>
                      <span>ID #{currentWorker.id}</span>
                      <div className="worker-contact-rows">
                        <span className="contact-row"><Phone size={12} /> {currentWorker.phoneNumber}</span>
                        <span className="contact-row"><Mail size={12} /> {currentWorker.email}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="unassigned-worker-box">
                    <Clock size={28} className="text-muted" />
                    <h4>No Worker Assigned</h4>
                    <p>Dispatch this issue to a field worker to begin active resolution.</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => setAssigning(true)}>
                      Assign Now
                    </button>
                  </div>
                )}
              </div>

              {/* Photos Card */}
              <div className="photo-card glass-card">
                <h3>Grievance Evidence</h3>
                <div className="photos-container">
                  <div className="evidence-photo-box">
                    <span className="photo-tag before">Before / Reported</span>
                    <img 
                      src={getIssueImage(issue.imageUrl, dashboardIssue?.category, false)} 
                      alt="Before evidence" 
                      className="evidence-img"
                      onError={(e) => { e.currentTarget.src = IMAGE_UNAVAILABLE; }}
                    />
                  </div>

                  {issue.status === 'RESOLVED' && (
                    <div className="evidence-photo-box resolved-box">
                      <span className="photo-tag after">After / Resolved</span>
                      <img 
                        src={getIssueImage(issue.afterImageUrl, dashboardIssue?.category, true)} 
                        alt="After resolution" 
                        className="evidence-img"
                        onError={(e) => { e.currentTarget.src = IMAGE_UNAVAILABLE; }}
                      />
                      <div className="resolution-ribbon">
                        <CheckCircle2 size={16} /> Resolved Successfully
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

export default AdminIssueDetail;
