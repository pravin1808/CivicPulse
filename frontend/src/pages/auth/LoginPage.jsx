import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { extractErrorMessage } from '../../utils/errorHelper';
import FieldErrors from '../../components/FieldErrors';
import { clearFieldError, emailPattern, getBackendFieldErrors } from '../../utils/formValidation';
import { ShieldAlert, User, ShieldCheck, HardHat, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [role, setRole] = useState('citizen'); // citizen, worker, admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = {};
    if (!email.trim()) validationErrors.email = ['Email is required.'];
    else if (!emailPattern.test(email.trim())) validationErrors.email = ['Email must be a valid email address.'];
    if (!password) validationErrors.password = ['Password is required.'];
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    let loginEndpoint = '';
    if (role === 'citizen') loginEndpoint = '/api/auth/citizen/login';
    else if (role === 'admin') loginEndpoint = '/api/auth/admin/login';
    else if (role === 'worker') loginEndpoint = '/api/auth/worker/login';

    try {
      const response = await api.post(loginEndpoint, { email: email.trim(), password });
      const { token } = response.data;
      
      const loggedRole = login(token);
      
      if (loggedRole) {
        navigate(`/${loggedRole}/dashboard`);
      } else {
        setError('Authentication succeeded but role extraction failed.');
      }
    } catch (err) {
      console.error(err);
      const backendFieldErrors = getBackendFieldErrors(err);
      if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors(backendFieldErrors);
      } else if (err?.response?.status === 401) {
        setFieldErrors({ password: [extractErrorMessage(err, 'Invalid email or password.')] });
      } else {
        setError(extractErrorMessage(err, 'Failed to connect to the server. Please verify your backend is running.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Link to="/" className="back-btn">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <div className="login-card-wrapper animate-fade-in">
        <div className="login-logo-section">
          <div className="login-logo">
            <ShieldAlert size={28} color="#fff" />
          </div>
          <h2>CivicPulse</h2>
          <p>Login to report issues, manage workers, or resolve tickets.</p>
        </div>

        <div className="login-card glass-card">
          {/* Role selection tabs */}
          <div className="role-tabs">
            <button 
              type="button" 
              className={`role-tab ${role === 'citizen' ? 'active' : ''}`}
              onClick={() => { setRole('citizen'); setError(''); setFieldErrors({}); }}
            >
              <User size={16} />
              Citizen
            </button>
            <button 
              type="button" 
              className={`role-tab ${role === 'worker' ? 'active' : ''}`}
              onClick={() => { setRole('worker'); setError(''); setFieldErrors({}); }}
            >
              <HardHat size={16} />
              Worker
            </button>
            <button 
              type="button" 
              className={`role-tab ${role === 'admin' ? 'active' : ''}`}
              onClick={() => { setRole('admin'); setError(''); setFieldErrors({}); }}
            >
              <ShieldCheck size={16} />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group-title">
              <h3>{role.toUpperCase()} Portal</h3>
              <p>Please log in using your authorized email address</p>
            </div>

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
                  placeholder="name@civicpulse.org"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError(setFieldErrors, 'email'); }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                  required
                />
              </div>
              <FieldErrors errors={fieldErrors.email} id="login-email-error" />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot?</Link>
              </div>
              <div className="input-field-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError(setFieldErrors, 'password'); }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                  required
                />
              </div>
              <FieldErrors errors={fieldErrors.password} id="login-password-error" />
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Access Portal'}
            </button>

            {role === 'citizen' && (
              <div className="register-redirect">
                <span>New to CivicPulse?</span>
                <Link to="/register">Create an account</Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
