import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { getCategoryName, getDepartmentName, DEPARTMENTS } from '../../api/categories';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ShieldAlert, Users, Search, Filter, ClipboardCheck, X, Eye } from 'lucide-react';
import './IssueManagement.css';

const IssueManagement = () => {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Assignment Modal State
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ASSIGNED');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const navigate = useNavigate();

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
      setError('Failed to fetch issues and workers data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAssignModal = (issue, e) => {
    e.stopPropagation(); // prevent row click navigation
    setSelectedIssue(issue);
    setSelectedWorkerId('');
    setSelectedStatus(issue.status === 'PENDING' ? 'ASSIGNED' : issue.status);
    setModalError('');
    setModalOpen(true);
  };

  const closeAssignModal = () => {
    setModalOpen(false);
    setSelectedIssue(null);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const payload = {
        workerId: selectedWorkerId ? parseInt(selectedWorkerId) : null,
        status: selectedStatus
      };

      await api.patch(`/api/admin/issue/assign/${selectedIssue.issueId}`, payload);
      closeAssignModal();
      fetchData(); // refresh data
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setModalError(typeof err.response.data === 'string' ? err.response.data : 'Failed to update issue.');
      } else {
        setModalError('Server error while assigning issue.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Filtered issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.issueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === '' || issue.status === statusFilter;
    const matchesDept = deptFilter === '' || issue.department === parseInt(deptFilter);
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Filter workers that belong to the department of the selected issue
  const eligibleWorkers = selectedIssue 
    ? workers.filter(w => w.dept_Id === selectedIssue.department)
    : [];

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <TopBar title="Issue Operations" />

        <div className="dashboard-body animate-fade-in">
          {error && (
            <div className="error-alert">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="table-card glass-card">
            {/* Filter and search controls bar */}
            <div className="search-filter-bar">
              <div className="search-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by ID, Title, Description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filters-wrapper">
                <div className="filter-select-wrapper">
                  <Filter size={16} className="filter-icon" />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="filter-select-wrapper">
                  <Filter size={16} className="filter-icon" />
                  <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    {Object.entries(DEPARTMENTS).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : filteredIssues.length === 0 ? (
              <div className="empty-state">
                <Search size={48} className="empty-icon" />
                <h4>No matching issues found</h4>
                <p>Try modifying your search queries or resetting status filters.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Issue ID</th>
                      <th>Title</th>
                      <th>Reporter</th>
                      <th>Department &amp; Category</th>
                      <th>Status</th>
                      <th className="actions-header">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue) => (
                      <tr key={issue.issueId} onClick={() => navigate(`/admin/issue/${issue.issueId}`)} className="clickable-row">
                        <td className="issue-id-col">{issue.issueId}</td>
                        <td className="title-col">
                          <span className="issue-title" title={issue.title}>{issue.title}</span>
                        </td>
                        <td>
                          <div className="citizen-info">
                            <span className="cit-name">{issue.citizen?.name}</span>
                            <span className="cit-phone">{issue.citizen?.phoneNumber}</span>
                          </div>
                        </td>
                        <td>
                          <div className="category-details">
                            <span className="cat-name">{getCategoryName(issue.category)}</span>
                            <span className="dept-name">{getDepartmentName(issue.department)}</span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={issue.status} />
                        </td>
                        <td className="actions-col">
                          <div className="actions-buttons">
                            <button 
                              className="action-icon-btn view" 
                              onClick={() => navigate(`/admin/issue/${issue.issueId}`)}
                              title="Inspect Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={(e) => openAssignModal(issue, e)}
                              title="Assign Worker / Update Status"
                            >
                              <ClipboardCheck size={16} /> Assign
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

      {/* Assignment Modal Drawer */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeAssignModal}>
          <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Issue — {selectedIssue?.issueId}</h3>
              <button className="close-btn" onClick={closeAssignModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="modal-form">
              {modalError && (
                <div className="error-alert">
                  <ShieldAlert size={18} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="modal-issue-summary">
                <h4>{selectedIssue?.title}</h4>
                <p>{selectedIssue?.description}</p>
                <div className="issue-meta-pills">
                  <span><strong>Department:</strong> {getDepartmentName(selectedIssue?.department)}</span>
                  <span><strong>Category:</strong> {getCategoryName(selectedIssue?.category)}</span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="worker-select">Select Department Worker</label>
                <div className="input-field-wrapper select-field-wrapper">
                  <Users size={18} className="input-icon" />
                  <select
                    id="worker-select"
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                  >
                    <option value="">Unassigned / Keep Blank</option>
                    {eligibleWorkers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} ({worker.email})
                      </option>
                    ))}
                  </select>
                </div>
                {eligibleWorkers.length === 0 && (
                  <span className="field-hint warning-hint">
                    No field workers are currently registered under this department. Register workers first to assign.
                  </span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="status-select">Update Status</label>
                <select
                  id="status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAssignModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Apply Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueManagement;
