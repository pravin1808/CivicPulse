import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Save, 
  X, 
  FileText, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  KeyRound,
  ArrowRight
} from 'lucide-react';
import './CitizenProfile.css';

const CitizenProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Fetch profile
      const profileRes = await api.get('/api/citizen/profile');
      const data = profileRes.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || ''
      });

      // Also fetch citizen issues to show active civic stats
      try {
        const issuesRes = await api.get('/api/citizen/issues');
        const issueList = issuesRes.data || [];
        setStats({
          total: issueList.length,
          pending: issueList.filter(i => i.status === 'PENDING').length,
          inProgress: issueList.filter(i => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS').length,
          resolved: issueList.filter(i => i.status === 'RESOLVED').length
        });
      } catch (err) {
        console.warn('Could not fetch issue stats for citizen', err);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to load profile details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      errors.name = 'Name must be between 2 and 100 characters';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Phone number must be a valid 10-digit Indian mobile number';
    }

    if (!formData.address.trim()) {
      errors.address = 'Residential address is required';
    } else if (formData.address.trim().length > 255) {
      errors.address = 'Address must not exceed 255 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleStartEdit = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setFieldErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || ''
      });
    }
    setFieldErrors({});
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await api.put('/api/citizen/profile', {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim()
      });

      setProfile(res.data);
      setIsEditing(false);
      setSuccessMessage('Your profile details have been successfully updated!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else if (typeof err.response?.data === 'string') {
        setErrorMessage(err.response.data);
      } else {
        setErrorMessage('Failed to update profile. Please ensure all values are valid.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="My Profile" />

        <div className="profile-page-container">
          {loading ? (
            <div className="profile-loading-box">
              <LoadingSpinner message="Loading your profile..." />
            </div>
          ) : errorMessage && !profile ? (
            <div className="profile-error-banner glass-card">
              <AlertCircle size={24} className="banner-icon-error" />
              <div>
                <h4>Error Loading Profile</h4>
                <p>{errorMessage}</p>
                <button className="btn btn-secondary btn-sm" onClick={fetchProfileData}>Retry</button>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Top Hero Banner */}
              <div className="profile-hero-card glass-card">
                <div className="profile-hero-left">
                  <div className="profile-avatar-large">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="profile-identity">
                    <div className="identity-title-row">
                      <h2>{profile?.name}</h2>
                      <span className="verified-badge">
                        <ShieldCheck size={16} /> Verified Citizen
                      </span>
                    </div>
                    <p className="profile-email-sub">{profile?.email}</p>
                    <div className="profile-tags-row">
                      <span className="meta-tag">Citizen ID: #{profile?.id}</span>
                      <span className="meta-tag active-status">
                        <span className="dot-active"></span> Active Resident
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-hero-right">
                  {!isEditing ? (
                    <button className="btn btn-primary" onClick={handleStartEdit}>
                      <Edit3 size={16} /> Edit Profile
                    </button>
                  ) : (
                    <div className="edit-actions-top">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleCancelEdit} 
                        disabled={saving}
                      >
                        <X size={16} /> Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={handleSave} 
                        disabled={saving}
                      >
                        <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Alert Notifications */}
              {successMessage && (
                <div className="profile-alert success-alert animate-fade-in">
                  <CheckCircle2 size={18} />
                  <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="profile-alert error-alert animate-fade-in">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Two Column Grid */}
              <div className="profile-grid">
                {/* Left: Profile Form Card */}
                <div className="profile-form-card glass-card">
                  <div className="card-section-header">
                    <h3>Personal & Contact Information</h3>
                    <p>Your details are used by municipal authorities for grievance updates and verification.</p>
                  </div>

                  <form onSubmit={handleSave} className="profile-form">
                    {/* Full Name */}
                    <div className="form-group">
                      <label htmlFor="profile-name">
                        <User size={16} className="label-icon" /> Full Name
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            id="profile-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className={`form-input ${fieldErrors.name ? 'input-invalid' : ''}`}
                            disabled={saving}
                          />
                          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                        </>
                      ) : (
                        <div className="form-readonly-value">{profile?.name}</div>
                      )}
                    </div>

                    {/* Email (Read Only) */}
                    <div className="form-group">
                      <label htmlFor="profile-email">
                        <Mail size={16} className="label-icon" /> Email Address
                      </label>
                      <div className="form-readonly-value with-badge">
                        <span>{profile?.email}</span>
                        <span className="field-badge verified">
                          <CheckCircle size={13} /> Verified
                        </span>
                      </div>
                      <span className="field-hint">Email address is verified via OTP and cannot be modified.</span>
                    </div>

                    {/* Phone Number */}
                    <div className="form-group">
                      <label htmlFor="profile-phone">
                        <Phone size={16} className="label-icon" /> Mobile Number
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            id="profile-phone"
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="10-digit Indian mobile number"
                            maxLength={10}
                            className={`form-input ${fieldErrors.phoneNumber ? 'input-invalid' : ''}`}
                            disabled={saving}
                          />
                          {fieldErrors.phoneNumber && (
                            <span className="field-error">{fieldErrors.phoneNumber}</span>
                          )}
                        </>
                      ) : (
                        <div className="form-readonly-value">{profile?.phoneNumber || 'Not provided'}</div>
                      )}
                    </div>

                    {/* Residential Address */}
                    <div className="form-group">
                      <label htmlFor="profile-address">
                        <MapPin size={16} className="label-icon" /> Residential Address
                      </label>
                      {isEditing ? (
                        <>
                          <textarea
                            id="profile-address"
                            name="address"
                            rows={3}
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter your street address, building, or ward area"
                            className={`form-textarea ${fieldErrors.address ? 'input-invalid' : ''}`}
                            disabled={saving}
                          />
                          {fieldErrors.address && (
                            <span className="field-error">{fieldErrors.address}</span>
                          )}
                        </>
                      ) : (
                        <div className="form-readonly-value multiline">{profile?.address || 'Not provided'}</div>
                      )}
                    </div>

                    {/* Submit Actions at Bottom if editing */}
                    {isEditing && (
                      <div className="form-actions-bottom">
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={handleCancelEdit} 
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          disabled={saving}
                        >
                          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Right: Civic Stats & Security Card */}
                <div className="profile-side-column">
                  {/* Civic Activity Card */}
                  <div className="profile-stats-card glass-card">
                    <div className="card-section-header">
                      <h3>Civic Participation</h3>
                      <p>Track your neighborhood contributions</p>
                    </div>

                    <div className="stats-breakdown-list">
                      <div className="stat-breakdown-item">
                        <div className="stat-item-left">
                          <div className="stat-icon-wrap bg-blue">
                            <FileText size={18} />
                          </div>
                          <div>
                            <strong>Total Issues Reported</strong>
                            <span>Lifetime grievances submitted</span>
                          </div>
                        </div>
                        <span className="stat-count-pill">{stats.total}</span>
                      </div>

                      <div className="stat-breakdown-item">
                        <div className="stat-item-left">
                          <div className="stat-icon-wrap bg-purple">
                            <Clock size={18} />
                          </div>
                          <div>
                            <strong>Active / In Progress</strong>
                            <span>Under municipal review or repair</span>
                          </div>
                        </div>
                        <span className="stat-count-pill purple">{stats.pending + stats.inProgress}</span>
                      </div>

                      <div className="stat-breakdown-item">
                        <div className="stat-item-left">
                          <div className="stat-icon-wrap bg-green">
                            <CheckCircle size={18} />
                          </div>
                          <div>
                            <strong>Resolved Issues</strong>
                            <span>Photo-verified community fixes</span>
                          </div>
                        </div>
                        <span className="stat-count-pill green">{stats.resolved}</span>
                      </div>
                    </div>

                    <div className="stat-card-actions">
                      <Link to="/citizen/report-issue" className="btn btn-primary btn-block">
                        <PlusCircle size={16} /> Report New Issue
                      </Link>
                      <Link to="/citizen/dashboard" className="btn btn-secondary btn-block">
                        View Grievance History <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Account Security Card */}
                  <div className="profile-security-card glass-card">
                    <div className="security-header">
                      <KeyRound size={20} className="security-icon" />
                      <div>
                        <h4>Security & Verification</h4>
                        <p>Your account is protected by CivicPulse OTP verification.</p>
                      </div>
                    </div>
                    <div className="security-item">
                      <span>Role Designation:</span>
                      <strong>{profile?.role || 'CITIZEN'}</strong>
                    </div>
                    <div className="security-item">
                      <span>Authentication Method:</span>
                      <strong>OTP Verified Email</strong>
                    </div>
                    <div className="security-footer-link">
                      <Link to="/forgot-password">Need to reset your password?</Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenProfile;
