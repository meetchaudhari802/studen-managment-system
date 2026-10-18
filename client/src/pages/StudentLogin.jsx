/**
 * Student Login Portal (client/src/pages/StudentLogin.jsx)
 * Authenticates students via Enrollment Number and registered Mobile Number.
 * Sets the student JWT and redirects to /student-dashboard.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import AlertMessage from '../components/AlertMessage';

const StudentLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    enrollmentNo: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'enrollmentNo') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!formData.enrollmentNo.trim() || !formData.password) {
      setAlert({ type: 'warning', message: 'Please enter both your Enrollment Number and Password.' });
      return;
    }

    try {
      setLoading(true);
      const res = await studentAPI.studentLogin({
        enrollmentNo: formData.enrollmentNo.trim().toUpperCase(),
        password: formData.password
      });

      if (res.success && res.token) {
        // Save student token and profile in localStorage
        localStorage.setItem('studentToken', res.token);
        localStorage.setItem('studentProfile', JSON.stringify(res.student));

        navigate('/student-dashboard');
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.message || 'Login failed. Please check your Enrollment Number and Password.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Public Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-2">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi bi-mortarboard-fill fs-2 me-2 text-warning"></i>
            <div>
              <span className="fw-bold tracking-tight fs-4">EduTrack</span>
              <small className="d-block text-white-50" style={{ fontSize: '0.68rem', marginTop: '-4px' }}>
                Student Self-Service Portal
              </small>
            </div>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link to="/" className="btn btn-outline-light btn-sm px-3">
              <i className="bi bi-house me-1"></i> Home
            </Link>
            <Link to="/login" className="btn btn-warning btn-sm fw-bold text-dark px-3">
              <i className="bi bi-person-workspace me-1"></i> Faculty Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Login Form */}
      <main className="container py-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="text-center mb-4">
              <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '70px', height: '70px' }}
              >
                <i className="bi bi-mortarboard-fill fs-2"></i>
              </div>
              <h2 className="fw-bold text-dark">Student Portal Login</h2>
              <p className="text-muted small">
                Access your academic attendance history, faculty mentor, and course performance
              </p>
            </div>

            <div className="card shadow-sm border-0 p-4 bg-white rounded-3">
              <AlertMessage
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: '', message: '' })}
              />

              <form onSubmit={handleSubmit}>
                {/* Enrollment Number */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Enrollment Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-card-text"></i>
                    </span>
                    <input
                      type="text"
                      name="enrollmentNo"
                      className="form-control text-uppercase"
                      placeholder="e.g. CS2024001 or BCA2024199"
                      value={formData.enrollmentNo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-shield-lock"></i>
                    </span>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter your student portal password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Default initial password for enrolled students: <strong className="text-dark">Student@123</strong>
                  </small>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Verifying Enrollment...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right"></i>
                      <span>Sign In to Student Portal</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted small">Not registered yet? </span>
                <Link to="/student-register" className="text-decoration-none fw-semibold text-primary small">
                  Register for Admission here &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          EduTrack Student Management System &bull; Student Self-Service Portal
        </div>
      </footer>
    </div>
  );
};

export default StudentLogin;
