import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { extractErrorMessage } from '../../utils/errorHelper';
import { KeyRound, AlertCircle, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import FieldErrors from '../../components/FieldErrors';
import { clearFieldError, getBackendFieldErrors } from '../../utils/formValidation';
import './OtpVerifyPage.css';

const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,20}$/;

const OtpVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [type, setType] = useState('register');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isPasswordReset = type === 'reset' || type === 'login';

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type') || 'register';
    if (emailParam) {
      setEmail(emailParam);
    }
    setType(typeParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationErrors = {};
    if (!/^\d{6}$/.test(otp)) validationErrors.otp = ['OTP must be exactly 6 digits.'];
    if (isPasswordReset) {
      if (!newPassword) validationErrors.newPassword = ['New password is required.'];
      else if (!passwordPattern.test(newPassword)) validationErrors.newPassword = ['Password must be 8-20 characters and include uppercase, lowercase, a digit, and a special character.'];
      if (!confirmPassword) validationErrors.confirmPassword = ['Please confirm your new password.'];
      else if (newPassword !== confirmPassword) validationErrors.confirmPassword = ['Passwords do not match.'];
    }
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      if (type === 'register') {
        const response = await api.post('/api/auth/citizen/verify_otp', { email, otp });
        setSuccess(response.data || 'Account successfully verified! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const response = await api.post('/api/auth/forgot_password/reset', { email, otp, newPassword });
        setSuccess(response.data || 'Password reset successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      const backendFieldErrors = getBackendFieldErrors(err);
      if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors(backendFieldErrors);
      } else if (err?.response?.status === 400 || err?.response?.status === 410) {
        setFieldErrors({ otp: [extractErrorMessage(err, 'Verification failed. Please try again.')] });
      } else {
        setError(extractErrorMessage(err, 'Verification failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <Link to="/login" className="back-btn">
        <ArrowLeft size={16} /> Back to Login
      </Link>

      <div className="otp-card-wrapper animate-fade-in">
        <div className="otp-logo-section">
          <div className="otp-logo">
            <KeyRound size={28} color="#fff" />
          </div>
          <h2>{isPasswordReset ? 'Set a New Password' : 'Verify Your Email'}</h2>
          <p>
            We've sent a 6-digit OTP code to <strong>{email || 'your email'}</strong>.
            {isPasswordReset && ' Enter it below, then choose a new password.'}
          </p>
        </div>

        <div className="otp-card glass-card">
          <form onSubmit={handleSubmit} className="otp-form" noValidate>
            {error && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="success-alert">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="otp">Enter Verification Code</label>
              <div className="input-field-wrapper">
                <KeyRound size={18} className="input-icon" />
                <input
                  type="text"
                  id="otp"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); clearFieldError(setFieldErrors, 'otp'); }}
                  className="otp-input-field"
                  aria-invalid={Boolean(fieldErrors.otp)}
                  aria-describedby={fieldErrors.otp ? 'otp-error' : undefined}
                  required
                  disabled={loading || !!success}
                />
              </div>
              <FieldErrors errors={fieldErrors.otp} id="otp-error" />
            </div>

            {isPasswordReset && (
              <>
                <div className="input-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="input-field-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); clearFieldError(setFieldErrors, 'newPassword'); }}
                      aria-invalid={Boolean(fieldErrors.newPassword)}
                      aria-describedby={fieldErrors.newPassword ? 'new-password-error' : undefined}
                      required
                      disabled={loading || !!success}
                    />
                  </div>
                  <FieldErrors errors={fieldErrors.newPassword} id="new-password-error" />
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="input-field-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError(setFieldErrors, 'confirmPassword'); }}
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                      required
                      disabled={loading || !!success}
                    />
                  </div>
                  <FieldErrors errors={fieldErrors.confirmPassword} id="confirm-password-error" />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary otp-btn" disabled={loading || !!success || otp.length < 6}>
              {loading ? 'Verifying...' : isPasswordReset ? 'Reset Password' : 'Verify Code'}
            </button>

            <div className="otp-footer">
              <span>Didn't receive the email?</span>
              <p>Check your spam folder or return to signup/login to request a new OTP.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
