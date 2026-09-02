import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { extractErrorMessage } from '../../utils/errorHelper';
import FieldErrors from '../../components/FieldErrors';
import { clearFieldError } from '../../utils/formValidation';
import { ShieldAlert, User, Mail, Phone, MapPin, Lock, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import './RegisterPage.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordErrors = (value) => {
  if (!value) {
    return ['Password is required.'];
  }

  const errors = [];
  if (value.length < 8 || value.length > 20) errors.push('Password must be between 8 and 20 characters.');
  if (!/[A-Z]/.test(value)) errors.push('Password must include an uppercase letter.');
  if (!/[a-z]/.test(value)) errors.push('Password must include a lowercase letter.');
  if (!/[0-9]/.test(value)) errors.push('Password must include a digit.');
  if (!/[@#$%^&+=!]/.test(value)) errors.push('Password must include a special character (@#$%^&+=!).');
  return errors;
};

const validateRegistration = ({ name, email, phoneNumber, address, password, confirmPassword }) => {
  const errors = {};
  const addError = (field, message) => {
    errors[field] = [...(errors[field] || []), message];
  };

  const trimmedName = name.trim();
  if (!trimmedName) addError('name', 'Name is required.');
  else if (trimmedName.length < 2 || trimmedName.length > 100) addError('name', 'Name must be between 2 and 100 characters.');

  const trimmedPhoneNumber = phoneNumber.trim();
  if (!trimmedPhoneNumber) addError('phoneNumber', 'Phone number is required.');
  else if (!/^[6-9]\d{9}$/.test(trimmedPhoneNumber)) addError('phoneNumber', 'Phone number must be a valid 10-digit Indian mobile number.');

  const trimmedEmail = email.trim();
  if (!trimmedEmail) addError('email', 'Email is required.');
  else if (!emailPattern.test(trimmedEmail)) addError('email', 'Email must be a valid email address.');

  const trimmedAddress = address.trim();
  if (!trimmedAddress) addError('address', 'Address is required.');
  else if (trimmedAddress.length > 255) addError('address', 'Address must not exceed 255 characters.');

  const passwordErrors = getPasswordErrors(password);
  if (passwordErrors.length) errors.password = passwordErrors;

  if (!confirmPassword) addError('confirmPassword', 'Please confirm your password.');
  else if (password !== confirmPassword) addError('confirmPassword', 'Passwords do not match.');

  return errors;
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Client-side password pattern checks
  const hasMinLen = password.length >= 8 && password.length <= 20;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[@#$%^&+=!]/.test(password);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError('');

    const validationErrors = validateRegistration({ name, email, phoneNumber, address, password, confirmPassword });
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/citizen/register', {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        password
      });
      // The API returns the email in the body on success
      const registeredEmail = response.data;
      navigate(`/verify-otp?email=${encodeURIComponent(registeredEmail || email)}`);
    } catch (err) {
      console.error(err);
      const backendFieldErrors = err?.response?.data?.fieldErrors;
      if (backendFieldErrors && typeof backendFieldErrors === 'object') {
        setFieldErrors(backendFieldErrors);
      } else if (err?.response?.status === 409) {
        setFieldErrors({ email: [extractErrorMessage(err)] });
      } else {
        setSubmissionError(extractErrorMessage(err, 'Failed to connect to the server. Please verify your backend is running.'));
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
          <form onSubmit={handleSubmit} className="register-form" noValidate>
            {submissionError && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{submissionError}</span>
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
                    onChange={(e) => { setName(e.target.value); clearFieldError(setFieldErrors, 'name'); }}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    required
                  />
                </div>
                <FieldErrors errors={fieldErrors.name} id="name-error" />
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
                    onChange={(e) => { setPhoneNumber(e.target.value); clearFieldError(setFieldErrors, 'phoneNumber'); }}
                    aria-invalid={Boolean(fieldErrors.phoneNumber)}
                    aria-describedby={fieldErrors.phoneNumber ? 'phoneNumber-error' : undefined}
                    required
                  />
                </div>
                <FieldErrors errors={fieldErrors.phoneNumber} id="phoneNumber-error" />
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
                  onChange={(e) => { setEmail(e.target.value); clearFieldError(setFieldErrors, 'email'); }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  required
                />
              </div>
              <FieldErrors errors={fieldErrors.email} id="email-error" />
            </div>

            <div className="input-group">
              <label htmlFor="address">Residential Address</label>
              <div className="input-field-wrapper">
                <MapPin size={18} className="input-icon" />
                <textarea
                  id="address"
                  placeholder="Flat No, Street, Landmark, Area, City"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); clearFieldError(setFieldErrors, 'address'); }}
                  rows={2}
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={fieldErrors.address ? 'address-error' : undefined}
                  required
                />
              </div>
              <FieldErrors errors={fieldErrors.address} id="address-error" />
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
                    onChange={(e) => { setPassword(e.target.value); clearFieldError(setFieldErrors, 'password'); }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    required
                  />
                </div>
                <FieldErrors errors={fieldErrors.password} id="password-error" />
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
                    onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError(setFieldErrors, 'confirmPassword'); }}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                    required
                  />
                </div>
                <FieldErrors errors={fieldErrors.confirmPassword} id="confirmPassword-error" />
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
              disabled={loading}
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
