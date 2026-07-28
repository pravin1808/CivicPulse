import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { getCategoryName, getDepartmentName } from '../../api/categories';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ClipboardList, Users, ShieldAlert, CheckCircle, ArrowRight, UserPlus, FileText, Settings, Hammer } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [issuesRes, workersRes] = await Promise.all([
          api.get('/api/admin/issues'),
          api.get('/api/admin/workers')
        ]);
        setIssues(issuesRes.data || []);
        setWorkers(workersRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard metrics. Verify you are logged in as Admin.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats
  const totalIssues = issues.length;
  const pendingIssues = issues.filter(i => i.status === 'PENDING').length;
  const activeIssues = issues.filter(i => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS').length;
  const resolvedIssues = issues.filter(i => i.status === 'RESOLVED').length;
  
  // Resolution rate percentage
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;

  // Get recent 5 issues for dashboard table
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <TopBar title="System Dashboard" />

        <div className="dashboard-body animate-fade-in">
          {error && (
            <div className="error-alert">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* StatCards Aligned to Mockup */}
              <section className="stats-grid">
                <StatCard 
                  title="Total Citizen Issues" 
                  value={totalIssues} 
                  icon={<ClipboardList size={22} color="#0f172a" />} 
                  badgeText="All Time" 
                  badgeType="default"
                />
                <StatCard 
                  title="Pending Assignment" 
                  value={pendingIssues} 
                  icon={<Hammer size={22} color="#f59e0b" />} 
                  badgeText="Action Needed" 
                  badgeType="warning"
                />
                <StatCard 
                  title="Active Field Workers" 
                  value={workers.length} 
                  icon={<Users size={22} color="#3b82f6" />} 
                  badgeText="Verified" 
                  badgeType="info"
                />
                <StatCard 
                  title="Resolved Cases" 
                  value={resolvedIssues} 
                  icon={<CheckCircle size={22} color="#10b981" />} 
                  badgeText={`${resolutionRate}% Rate`} 
                  badgeType="success"
                />
              </section>

              {/* Grid inspired directly by the mockup screenshot */}
              <div className="dashboard-split-grid">
                {/* Left Card: Recent Issues table */}
                <div className="table-card glass-card">
                  <div className="table-header">
                    <h3>Recent Reported Issues</h3>
                    <Link to="/admin/issues" className="view-all-link">
                      View All <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="table-responsive">
                    <table className="issues-table">
                      <thead>
                        <tr>
                          <th>Issue ID</th>
                          <th>Citizen</th>
                          <th>Category</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentIssues.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-4">No recent issues found.</td>
                          </tr>
                        ) : (
                          recentIssues.map((issue) => (
                            <tr key={issue.issueId} onClick={() => navigate(`/admin/issue/${issue.issueId}`)} className="clickable-row">
                              <td className="issue-id-col">{issue.issueId}</td>
                              <td>{issue.citizen?.name || 'Citizen'}</td>
                              <td>{getCategoryName(issue.category)}</td>
                              <td>
                                <StatusBadge status={issue.status} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: Statistics Card + Quick Links */}
                <div className="dashboard-right-sidebar">
                  {/* Resolution statistics box with progress bar (matching mockup style) */}
                  <div className="order-stats-dark-card">
                    <h3>Resolution Statistics</h3>
                    <p>Municipal performance index in resolving citizen reported issues.</p>
                    
                    <div className="progress-container">
                      <div className="progress-labels">
                        <span>Completion Rate</span>
                        <span className="progress-percentage">{resolutionRate}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${resolutionRate}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links Card */}
                  <div className="quick-links-card glass-card">
                    <h3>Quick Operations</h3>
                    <div className="quick-links-list">
                      <Link to="/admin/issues" className="quick-link-item">
                        <div className="quick-link-icon-bg">
                          <FileText size={18} />
                        </div>
                        <span>Manage &amp; Assign Issues</span>
                        <ArrowRight size={14} className="arrow-icon" />
                      </Link>
                      
                      <Link to="/admin/workers" className="quick-link-item">
                        <div className="quick-link-icon-bg">
                          <Users size={18} />
                        </div>
                        <span>Manage Field Workers</span>
                        <ArrowRight size={14} className="arrow-icon" />
                      </Link>

                      <Link to="/admin/workers?action=new" className="quick-link-item">
                        <div className="quick-link-icon-bg">
                          <UserPlus size={18} />
                        </div>
                        <span>Register Field Worker</span>
                        <ArrowRight size={14} className="arrow-icon" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
