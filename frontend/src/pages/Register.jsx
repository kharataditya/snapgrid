import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm_password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (!usernameRegex.test(formData.username.trim())) {
      errors.username = 'Username must be 3-30 chars, letters, numbers, periods or underscores';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        full_name: formData.full_name.trim(),
        password: formData.password,
      });

      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-container">
        <div className="auth-card">
          <h1 className="auth-logo">SnapGrid</h1>
          <p className="auth-subtitle">Sign up to see photos and videos from your friends.</p>

          {formError && (
            <div className="error-banner" role="alert">
              <span>{formError}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
                autoComplete="email"
                required
              />
              {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-fullname" className="form-label">Full Name</label>
              <input
                id="reg-fullname"
                name="full_name"
                type="text"
                className={`form-input ${fieldErrors.full_name ? 'input-error' : ''}`}
                placeholder="Full name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={submitting}
                autoComplete="name"
                required
              />
              {fieldErrors.full_name && <span className="field-error-msg">{fieldErrors.full_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-username" className="form-label">Username</label>
              <input
                id="reg-username"
                name="username"
                type="text"
                className={`form-input ${fieldErrors.username ? 'input-error' : ''}`}
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                disabled={submitting}
                autoComplete="username"
                required
              />
              {fieldErrors.username && <span className="field-error-msg">{fieldErrors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">Password</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={submitting}
                autoComplete="new-password"
                required
              />
              {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
              <input
                id="reg-confirm"
                name="confirm_password"
                type="password"
                className={`form-input ${fieldErrors.confirm_password ? 'input-error' : ''}`}
                placeholder="Confirm password"
                value={formData.confirm_password}
                onChange={handleChange}
                disabled={submitting}
                autoComplete="new-password"
                required
              />
              {fieldErrors.confirm_password && (
                <span className="field-error-msg">{fieldErrors.confirm_password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <div className="auth-footer-card">
          <span>Have an account?</span>
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
