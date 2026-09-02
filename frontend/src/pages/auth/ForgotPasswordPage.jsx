import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { extractErrorMessage } from '../../utils/errorHelper';
import FieldErrors from '../../components/FieldErrors';
import { clearFieldError, emailPattern, getBackendFieldErrors } from '../../utils/formValidation';
import { Mail, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = {};
    if (!email.trim()) validationErrors.email = ['Email is required.'];
    else if (!emailPattern.test(email.trim())) validationErrors.email = ['Email must be a valid email address.'];
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      await api.post('/api/auth/forgot_password', { email: email.trim() });

      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}&type=reset`);
    } catch (err) {
      console.error(err);
      const backendFieldErrors = getBackendFieldErrors(err);
      if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors(backendFieldErrors);
      } else if (err?.response?.status === 404 || err?.response?.status === 429) {
        setFieldErrors({ email: [extractErrorMessage(err)] });
      } else {
        setError(extractErrorMessage(err, 'Failed to request a password-reset OTP. Please try again.'));
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
          <p>Enter your email and we'll send you a verification code to reset your password.</p>
        </div>

        <div className="forgot-card glass-card">
          <form onSubmit={handleSubmit} className="forgot-form" noValidate>
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
                  onChange={(e) => { setEmail(e.target.value); clearFieldError(setFieldErrors, 'email'); }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'forgot-email-error' : undefined}
                  required
                  disabled={loading}
                />
              </div>
              <FieldErrors errors={fieldErrors.email} id="forgot-email-error" />
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
