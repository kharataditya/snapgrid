import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email or username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
      await login({
        email: email.trim(),
        username: email.trim(), // Support login via username or email
        password,
      });

      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Invalid credentials. Please check and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-container">
        <div className="auth-card">
          <h1 className="auth-logo">SnapGrid</h1>
          <p className="auth-subtitle">Sign in to see photos and videos from your friends.</p>

          {formError && (
            <div className="error-banner" role="alert">
              <span>{formError}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email or Username</label>
              <input
                id="login-email"
                type="text"
                className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                placeholder="Phone number, username, or email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                }}
                disabled={submitting}
                autoComplete="username"
                required
              />
              {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <input
                id="login-password"
                type="password"
                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                }}
                disabled={submitting}
                autoComplete="current-password"
                required
              />
              {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={submitting || !email.trim() || !password}
            >
              {submitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Quick Demo Login for College Viva & Reviewers */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', letterSpacing: '0.5px', marginBottom: '10px', textTransform: 'uppercase' }}>
              Quick 1-Click Demo Login (College Viva)
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                disabled={submitting}
                onClick={async () => {
                  setEmail('john@example.com');
                  setPassword('password123');
                  setFormError(null);
                  setSubmitting(true);
                  try {
                    await login({ email: 'john@example.com', password: 'password123' });
                    navigate('/', { replace: true });
                  } catch (err) {
                    setFormError(err.message || 'Login failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                👤 John (Demo) ⚡
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                disabled={submitting}
                onClick={async () => {
                  setEmail('jane@example.com');
                  setPassword('password123');
                  setFormError(null);
                  setSubmitting(true);
                  try {
                    await login({ email: 'jane@example.com', password: 'password123' });
                    navigate('/', { replace: true });
                  } catch (err) {
                    setFormError(err.message || 'Login failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                👤 Jane (Demo) ⚡
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                disabled={submitting}
                onClick={async () => {
                  setEmail('alex@example.com');
                  setPassword('password123');
                  setFormError(null);
                  setSubmitting(true);
                  try {
                    await login({ email: 'alex@example.com', password: 'password123' });
                    navigate('/', { replace: true });
                  } catch (err) {
                    setFormError(err.message || 'Login failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                👤 Alex (Demo) ⚡
              </button>
            </div>
          </div>
        </div>

        <div className="auth-footer-card">
          <span>Don't have an account?</span>
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
