import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/api';
import { extractErrorMessage } from '../../utils/errorHelper';
import { DEPARTMENTS, getDepartmentName } from '../../api/categories';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, Plus, Edit2, Trash2, ShieldAlert, X, UserCog, Mail, Phone, MapPin, Key, Briefcase } from 'lucide-react';
import './WorkerManagement.css';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search params to handle redirect actions from dashboard
  const [searchParams, setSearchParams] = useSearchParams();

  // Add / Edit Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [deptId, setDeptId] = useState('');

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/workers');
      setWorkers(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch municipal workers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    
    // Check if redirect has request to add worker
    if (searchParams.get('action') === 'new') {
      openAddModal();
      // clean search params
      setSearchParams({});
    }
  }, [searchParams]);

  const openAddModal = () => {
    setModalType('add');
    setSelectedWorkerId(null);
    setName('');
    setEmail('');
    setPhoneNumber('');
    setAddress('');
    setPassword('');
    setDeptId('');
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (worker) => {
    setModalType('edit');
    setSelectedWorkerId(worker.id);
    setName(worker.name || '');
    setEmail(worker.email || '');
    setPhoneNumber(worker.phoneNumber || '');
    setAddress(worker.address || '');
    setPassword(''); // don't populate password
    setDeptId(worker.dept_Id || '');
    setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleDelete = async (workerId) => {
    if (!window.confirm('Are you sure you want to delete this field worker permanently?')) return;

    try {
      await api.delete(`/api/admin/worker/${workerId}`);
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete worker.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      if (modalType === 'add') {
        const payload = {
          name,
          email,
          phoneNumber,
          address,
          password,
          dept_id: parseInt(deptId)
        };
        await api.post('/api/admin/worker_register', payload);
      } else {
        const payload = {
          name,
          phoneNumber,
          address,
          dept_id: parseInt(deptId)
        };
        await api.put(`/api/admin/worker/${selectedWorkerId}`, payload);
      }
      closeModal();
      fetchWorkers();
    } catch (err) {
      console.error(err);
      setModalError(extractErrorMessage(err, 'Operation failed. Verify password complexity requirements.'));
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <TopBar title="Worker Operations" />

        <div className="dashboard-body animate-fade-in">
          {error && (
            <div className="error-alert">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="table-card glass-card">
            <div className="table-header">
              <h3>Municipal Field Workers</h3>
              <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                <Plus size={16} /> Register New Worker
              </button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : workers.length === 0 ? (
              <div className="empty-state">
                <Users size={48} className="empty-icon" />
                <h4>No workers registered yet</h4>
                <p>Register workers under departments to assign them municipal grievances.</p>
                <button className="btn btn-primary" onClick={openAddModal}>Register First Worker</button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Worker ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact Number</th>
                      <th>Department Assignment</th>
                      <th className="actions-header">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => (
                      <tr key={worker.id}>
                        <td className="issue-id-col">Worker #{worker.id}</td>
                        <td className="font-semibold">{worker.name}</td>
                        <td>{worker.email}</td>
                        <td>{worker.phoneNumber}</td>
                        <td>
                          <span className="worker-dept-badge">
                            {getDepartmentName(worker.dept_Id)}
                          </span>
                        </td>
                        <td className="actions-col">
                          <div className="actions-buttons">
                            <button 
                              className="action-icon-btn edit" 
                              onClick={() => openEditModal(worker)}
                              title="Modify Worker Details"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="action-icon-btn delete" 
                              onClick={() => handleDelete(worker.id)}
                              title="Delete Worker"
                            >
                              <Trash2 size={16} />
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

      {/* Add / Edit Worker Modal Form */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <UserCog size={20} className="header-icon" />
                <h3>{modalType === 'add' ? 'Register New worker' : 'Modify Worker Details'}</h3>
              </div>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              {modalError && (
                <div className="error-alert">
                  <ShieldAlert size={18} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="worker-name">Full Name</label>
                <div className="input-field-wrapper">
                  <Users size={18} className="input-icon" />
                  <input
                    type="text"
                    id="worker-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Robert Smith"
                    required
                    disabled={modalLoading}
                  />
                </div>
              </div>

              {modalType === 'add' && (
                <div className="input-group">
                  <label htmlFor="worker-email">Email Address</label>
                  <div className="input-field-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      id="worker-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="robert@civicpulse.gov"
                      required
                      disabled={modalLoading}
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="worker-phone">Phone Number</label>
                <div className="input-field-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    id="worker-phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 9898989898"
                    required
                    disabled={modalLoading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="worker-dept">Department Assignment</label>
                <div className="input-field-wrapper">
                  <Briefcase size={18} className="input-icon" />
                  <select
                    id="worker-dept"
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    required
                    disabled={modalLoading}
                  >
                    <option value="">Select Assignment Department</option>
                    {Object.entries(DEPARTMENTS).map(([id, deptName]) => (
                      <option key={id} value={id}>{deptName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="worker-address">Postal Address</label>
                <div className="input-field-wrapper">
                  <MapPin size={18} className="input-icon" />
                  <textarea
                    id="worker-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Residential address"
                    rows={2}
                    required
                    disabled={modalLoading}
                  />
                </div>
              </div>

              {modalType === 'add' && (
                <div className="input-group">
                  <label htmlFor="worker-password">Account Password</label>
                  <div className="input-field-wrapper">
                    <Key size={18} className="input-icon" />
                    <input
                      type="password"
                      id="worker-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set strong password (e.g. Admin@123)"
                      required
                      disabled={modalLoading}
                    />
                  </div>
                  <span className="field-hint">
                    Requires 8-20 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character (@#$%^&amp;+=!).
                  </span>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : modalType === 'add' ? 'Register Worker' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;
