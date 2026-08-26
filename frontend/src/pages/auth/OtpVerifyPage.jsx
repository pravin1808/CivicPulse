import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { extractErrorMessage } from '../../utils/errorHelper';
import { ShieldAlert, KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './OtpVerifyPage.css';

const OtpVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [type, setType] = useState('register'); // 'register' or 'login'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
    setLoading(true);

    try {
      if (type === 'register') {
        const response = await api.post('/api/auth/citizen/verify_otp', { email, otp });
        setSuccess(response.data || 'Account successfully verified! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Verification for login (Forgot Password OTP flow)
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('otp', otp);
        
        const response = await api.post('/api/auth/verify_otp/login', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        const { token } = response.data;
        const loggedRole = login(token);
        setSuccess('OTP validated! Access granted. Entering dashboard...');
        setTimeout(() => {
          if (loggedRole) {
            navigate(`/${loggedRole}/dashboard`);
          } else {
            navigate('/login');
          }
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err, 'Verification failed. Please try again.'));
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
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit OTP code to <strong>{email || 'your email'}</strong>.</p>
        </div>

        <div className="otp-card glass-card">
          <form onSubmit={handleSubmit} className="otp-form">
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
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // allow only numbers
                  className="otp-input-field"
                  required
                  disabled={loading || !!success}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary otp-btn" disabled={loading || !!success || otp.length < 6}>
              {loading ? 'Verifying...' : 'Verify Code'}
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
