/**
 * Login Page (client/src/pages/Login.jsx)
 * Standard institutional authentication with role-based routing.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // If user is already logged in, redirect straight to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    }

    // If redirected from successful registration, prefill email
    if (location.state?.registeredEmail) {
      setFormData(prev => ({ ...prev, email: location.state.registeredEmail }));
      setAlert({
        type: 'success',
        message: 'Account created successfully! Please enter your password to login.'
      });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!formData.email || !formData.password) {
      setAlert({ type: 'warning', message: 'Please enter both email and password.' });
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.login(formData);

      // Save token and user in context & localStorage
      login(res.token, res.user);

      // Redirect based on role
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.message || 'Invalid email or password.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="text-center mb-4">
            <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '3.2rem' }}></i>
            <h2 className="fw-bold mt-2 text-dark">College Portal</h2>
            <p className="text-muted">Sign in with your institutional credentials</p>
          </div>

          <div className="card shadow-sm border-0 p-4 bg-white">
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: '', message: '' })}
            />

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="teacher@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold shadow-sm d-flex justify-content-center align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Login to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-2 border-top">
              <span className="text-muted">New faculty member? </span>
              <Link to="/register" className="text-decoration-none fw-semibold text-primary">
                Register Faculty Account
              </Link>
            </div>

            <div className="text-center mt-2">
              <span className="text-muted small">Are you a student? </span>
              <Link to="/student-register" className="text-decoration-none fw-bold text-success small">
                <i className="bi bi-mortarboard-fill me-1"></i> Register as Student &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
