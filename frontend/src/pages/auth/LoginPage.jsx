import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { extractErrorMessage } from '../../utils/errorHelper';
import { ShieldAlert, User, ShieldCheck, HardHat, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [role, setRole] = useState('citizen'); // citizen, worker, admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let loginEndpoint = '';
    if (role === 'citizen') loginEndpoint = '/api/auth/citizen/login';
    else if (role === 'admin') loginEndpoint = '/api/auth/admin/login';
    else if (role === 'worker') loginEndpoint = '/api/auth/worker/login';

    try {
      const response = await api.post(loginEndpoint, { email, password });
      const { token } = response.data;
      
      const loggedRole = login(token);
      
      if (loggedRole) {
        navigate(`/${loggedRole}/dashboard`);
      } else {
        setError('Authentication succeeded but role extraction failed.');
      }
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err, 'Failed to connect to the server. Please verify your backend is running.'));
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
              onClick={() => { setRole('citizen'); setError(''); }}
            >
              <User size={16} />
              Citizen
            </button>
            <button 
              type="button" 
              className={`role-tab ${role === 'worker' ? 'active' : ''}`}
              onClick={() => { setRole('worker'); setError(''); }}
            >
              <HardHat size={16} />
              Worker
            </button>
            <button 
              type="button" 
              className={`role-tab ${role === 'admin' ? 'active' : ''}`}
              onClick={() => { setRole('admin'); setError(''); }}
            >
              <ShieldCheck size={16} />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
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
