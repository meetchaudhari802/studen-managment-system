/**
 * Register Page (client/src/pages/Register.jsx)
 * Allows teachers to sign up with validation for 10-digit mobile and password match.
 * Redirects to /login upon success.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import AlertMessage from '../components/AlertMessage';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    department: 'Computer Science & Engineering',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    // Client-side validations
    if (!formData.fullName || !formData.email || !formData.mobile || !formData.password) {
      setAlert({ type: 'warning', message: 'Please fill in all required fields.' });
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setAlert({ type: 'warning', message: 'Mobile number must be exactly 10 digits.' });
      return;
    }

    if (formData.password.length < 8) {
      setAlert({ type: 'warning', message: 'Password must be at least 8 characters long.' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({ type: 'danger', message: 'Passwords do not match!' });
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.register(formData);

      setAlert({
        type: 'success',
        message: res.message || 'Registration successful! Redirecting to login...'
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: formData.email } });
      }, 1500);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.message || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="text-center mb-4">
            <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '3rem' }}></i>
            <h2 className="fw-bold mt-2 text-dark">Faculty Registration</h2>
            <p className="text-muted">Create an account to manage your students and track attendance</p>
          </div>

          <div className="card shadow-sm border-0 p-4 bg-white">
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: '', message: '' })}
            />

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Official Email <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="name@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Mobile Number (10 Digits) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="tel"
                    name="mobile"
                    maxLength="10"
                    className="form-control"
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-text">Enter exactly 10 digits without country code</div>
              </div>

              {/* Department Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Department <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-building"></i>
                  </span>
                  <select
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Computer Applications (BCA/MCA)">Computer Applications (BCA/MCA)</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
              </div>

              {/* Passwords */}
              <div className="row g-2 mb-4">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-shield-check"></i>
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus-fill"></i>
                    <span>Create Faculty Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-2 border-top">
              <span className="text-muted">Already registered? </span>
              <Link to="/login" className="text-decoration-none fw-semibold text-primary">
                Login here
              </Link>
            </div>

            <div className="alert alert-info border-0 mt-3 mb-0 py-2 px-3 small d-flex align-items-center gap-2">
              <i className="bi bi-info-circle-fill fs-5 text-info"></i>
              <div>
                <strong>Enrolling a student?</strong> Sign in as faculty to register and manage student records via the <strong>Students Directory</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
