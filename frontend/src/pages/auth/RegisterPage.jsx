import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { ShieldAlert, User, Mail, Phone, MapPin, Lock, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import './RegisterPage.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Client-side password pattern checks
  const hasMinLen = password.length >= 8 && password.length <= 20;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[@#$%^&+=!]/.test(password);
  
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasDigit && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please satisfy all password security requirements.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/citizen/register', {
        name,
        email,
        phoneNumber,
        address,
        password
      });
      // The API returns the email in the body on success
      const registeredEmail = response.data;
      navigate(`/verify-otp?email=${encodeURIComponent(registeredEmail || email)}`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : 'Registration failed. E-mail may already be in use.');
      } else {
        setError('Failed to connect to the server. Please verify your backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Link to="/login" className="back-btn">
        <ArrowLeft size={16} /> Back to Login
      </Link>

      <div className="register-card-wrapper animate-fade-in">
        <div className="register-logo-section">
          <div className="register-logo">
            <ShieldAlert size={28} color="#fff" />
          </div>
          <h2>Join CivicPulse</h2>
          <p>Create a citizen account to start reporting municipal issues.</p>
        </div>

        <div className="register-card glass-card">
          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-field-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <div className="input-field-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    id="phoneNumber"
                    placeholder="+91 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-field-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="address">Residential Address</label>
              <div className="input-field-wrapper">
                <MapPin size={18} className="input-icon" />
                <textarea
                  id="address"
                  placeholder="Flat No, Street, Landmark, Area, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-field-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-field-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password security checks */}
            <div className="password-checklist">
              <span className="checklist-title">Password must contain:</span>
              <div className="checklist-grid">
                <div className={`checklist-item ${hasMinLen ? 'checked' : ''}`}>
                  <span className="bullet"><Check size={10} /></span> 8-20 characters
                </div>
                <div className={`checklist-item ${hasUpper ? 'checked' : ''}`}>
                  <span className="bullet"><Check size={10} /></span> 1 uppercase letter
                </div>
                <div className={`checklist-item ${hasLower ? 'checked' : ''}`}>
                  <span className="bullet"><Check size={10} /></span> 1 lowercase letter
                </div>
                <div className={`checklist-item ${hasDigit ? 'checked' : ''}`}>
                  <span className="bullet"><Check size={10} /></span> 1 digit
                </div>
                <div className={`checklist-item ${hasSpecial ? 'checked' : ''}`}>
                  <span className="bullet"><Check size={10} /></span> 1 special character (@#$%^&amp;+=!)
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary register-btn" 
              disabled={loading || !isPasswordValid || password !== confirmPassword}
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>

            <div className="login-redirect">
              <span>Already have an account?</span>
              <Link to="/login">Sign in here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
