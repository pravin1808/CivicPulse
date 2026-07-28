import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { getCategoryName, getDepartmentName } from '../../api/categories';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ClipboardList, PlusCircle, AlertCircle, Trash2, Eye, Calendar, MapPin } from 'lucide-react';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/citizen/issues');
      // The API returns the list of issues
      setIssues(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reported issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleDelete = async (issueId, e) => {
    e.stopPropagation(); // prevent row click
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    try {
      await api.delete(`/api/citizen/issue/${issueId}`);
      // Refresh the list after deleting
      setIssues(issues.filter(issue => issue.issueId !== issueId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete issue. Ensure you are authorized.');
    }
  };

  // Stats calculation
  const totalIssues = issues.length;
  const pendingIssues = issues.filter(i => i.status === 'PENDING').length;
  const activeIssues = issues.filter(i => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS').length;
  const resolvedIssues = issues.filter(i => i.status === 'RESOLVED').length;

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <TopBar title="Citizen Dashboard" />

        <div className="dashboard-body animate-fade-in">
          {/* Header Stats */}
          <section className="stats-grid">
            <StatCard 
              title="Total Issues Reported" 
              value={totalIssues} 
              icon={<ClipboardList size={22} color="#0f172a" />} 
              badgeText="All Time" 
              badgeType="default"
            />
            <StatCard 
              title="Pending Validation" 
              value={pendingIssues} 
              icon={<Calendar size={22} color="#f59e0b" />} 
              badgeText="New" 
              badgeType="warning"
            />
            <StatCard 
              title="In Progress" 
              value={activeIssues} 
              icon={<MapPin size={22} color="#8b5cf6" />} 
              badgeText="Active" 
              badgeType="info"
            />
            <StatCard 
              title="Resolved Issues" 
              value={resolvedIssues} 
              icon={<CheckCircle size={22} color="#10b981" />} 
              badgeText="Completed" 
              badgeType="success"
            />
          </section>

          {/* Quick Actions / New Issue Banner */}
          <div className="banner-card glass-card">
            <div className="banner-text">
              <h3>Have you noticed a local problem?</h3>
              <p>Report issues with detailed descriptions, location coordinate details, and photo proof to help workers resolve them.</p>
            </div>
            <Link to="/citizen/report-issue" className="btn btn-primary">
              <PlusCircle size={18} /> Report New Issue
            </Link>
          </div>

          {/* Issues List Table */}
          <div className="table-card glass-card">
            <div className="table-header">
              <h3>Your Reported Issues</h3>
              <button className="btn btn-secondary btn-sm" onClick={fetchIssues}>Refresh</button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="error-message">
                <AlertCircle size={24} />
                <p>{error}</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={48} className="empty-icon" />
                <h4>No issues reported yet</h4>
                <p>All the issues you submit will show up here. Press the button above to report your first issue.</p>
                <Link to="/citizen/report-issue" className="btn btn-primary">Report an Issue</Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Issue ID</th>
                      <th>Title</th>
                      <th>Department &amp; Category</th>
                      <th>Date Reported</th>
                      <th>Status</th>
                      <th className="actions-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue.issueId} onClick={() => navigate(`/citizen/issue/${issue.issueId}`)} className="clickable-row">
                        <td className="issue-id-col">{issue.issueId}</td>
                        <td className="title-col">
                          <span className="issue-title" title={issue.title}>{issue.title}</span>
                        </td>
                        <td>
                          <div className="category-details">
                            <span className="cat-name">{getCategoryName(issue.category)}</span>
                            <span className="dept-name">{getDepartmentName(issue.department)}</span>
                          </div>
                        </td>
                        <td>
                          {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td>
                          <StatusBadge status={issue.status} />
                        </td>
                        <td className="actions-col">
                          <div className="actions-buttons">
                            <button 
                              className="action-icon-btn view" 
                              onClick={() => navigate(`/citizen/issue/${issue.issueId}`)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {issue.status === 'PENDING' && (
                              <button 
                                className="action-icon-btn delete" 
                                onClick={(e) => handleDelete(issue.issueId, e)}
                                title="Delete Issue"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Simple helper component to avoid circular dependency
const CheckCircle = ({ size, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default CitizenDashboard;
