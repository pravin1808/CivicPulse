import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { getCategoryName, getDepartmentName } from '../../api/categories';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ClipboardList, Hammer, Clock, ShieldCheck, Eye, Sparkles } from 'lucide-react';

const WorkerDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/worker/issues');
      setIssues(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch worker issues dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Stats calculation
  const totalAvailable = issues.length;
  const pendingClaims = issues.filter(i => i.status === 'PENDING').length;
  const activeCases = issues.filter(i => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS').length;
  const resolvedCases = issues.filter(i => i.status === 'RESOLVED').length;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <TopBar title="Worker Dashboard" />

        <div className="dashboard-body animate-fade-in">
          {error && (
            <div className="error-alert">
              <span>{error}</span>
            </div>
          )}

          {/* Stats Bar */}
          <section className="stats-grid">
            <StatCard 
              title="Department Issues Available" 
              value={totalAvailable} 
              icon={<ClipboardList size={22} color="#0f172a" />} 
              badgeText="Active" 
              badgeType="default"
            />
            <StatCard 
              title="Unassigned Claims" 
              value={pendingClaims} 
              icon={<Clock size={22} color="#f59e0b" />} 
              badgeText="New" 
              badgeType="warning"
            />
            <StatCard 
              title="Assigned / Active Work" 
              value={activeCases} 
              icon={<Hammer size={22} color="#8b5cf6" />} 
              badgeText="Ongoing" 
              badgeType="info"
            />
            <StatCard 
              title="Resolved Cases" 
              value={resolvedCases} 
              icon={<ShieldCheck size={22} color="#10b981" />} 
              badgeText="Finished" 
              badgeType="success"
            />
          </section>

          {/* Table list of assigned department issues */}
          <div className="table-card glass-card">
            <div className="table-header">
              <h3>Issues In Your Department</h3>
              <button className="btn btn-secondary btn-sm" onClick={fetchIssues}>Refresh</button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : issues.length === 0 ? (
              <div className="empty-state">
                <ShieldCheck size={48} className="empty-icon" />
                <h4>No issues listed</h4>
                <p>There are no issues registered in your department or assigned to your profile.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Issue ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Latitude / Longitude</th>
                      <th>Status</th>
                      <th className="actions-header">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr 
                        key={issue.issue_id} 
                        onClick={() => navigate(`/worker/issue/${issue.issue_id}`)} 
                        className="clickable-row"
                      >
                        <td className="issue-id-col">{issue.issue_id}</td>
                        <td className="title-col">
                          <span className="issue-title" title={issue.title}>{issue.title}</span>
                        </td>
                        <td>{getCategoryName(issue.categoryId)}</td>
                        <td>
                          <span className="font-semibold">{issue.latitude.toFixed(4)}</span>, {issue.longitude.toFixed(4)}
                        </td>
                        <td>
                          <StatusBadge status={issue.status} />
                        </td>
                        <td className="actions-col">
                          <div className="actions-buttons">
                            <button 
                              className="action-icon-btn view" 
                              onClick={() => navigate(`/worker/issue/${issue.issue_id}`)}
                              title="Inspect Grievance"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => navigate(`/worker/issue/${issue.issue_id}`)}
                            >
                              Inspect
                            </button>
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

export default WorkerDashboard;
