import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { ShieldAlert, Mail, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use form-url-encoded format as required by the backend controller (no @RequestBody)
      const params = new URLSearchParams();
      params.append('email', email);

      await api.post('/api/auth/forgot_password', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Redirect to OTP verification for login
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=login`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setError('This email address is not registered in our system.');
      } else {
        setError('Failed to request password reset OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <Link to="/login" className="back-btn">
        <ArrowLeft size={16} /> Back to Login
      </Link>

      <div className="forgot-card-wrapper animate-fade-in">
        <div className="forgot-logo-section">
          <div className="forgot-logo">
            <Mail size={28} color="#fff" />
          </div>
          <h2>Reset Password</h2>
          <p>Enter your email and we'll send you a verification code to bypass credentials.</p>
        </div>

        <div className="forgot-card glass-card">
          <form onSubmit={handleSubmit} className="forgot-form">
            {error && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-field-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary forgot-btn" disabled={loading || !email}>
              <Send size={16} />
              {loading ? 'Requesting OTP...' : 'Send OTP Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
