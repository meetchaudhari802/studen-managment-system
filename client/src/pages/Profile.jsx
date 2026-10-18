/**
 * Edit Profile Page (client/src/pages/Profile.jsx)
 * Protected page allowing faculty to:
 * - View existing profile loaded via GET /api/profile
 * - Edit fullName, mobile, and department
 * - Optionally update account password
 * - Save changes via PUT /api/profile with alert feedback
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AlertMessage from '../components/AlertMessage';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Fetch current profile from backend
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileAPI.getProfile();
      if (res.success && res.data) {
        setFormData(prev => ({
          ...prev,
          fullName: res.data.fullName || '',
          email: res.data.email || '',
          mobile: res.data.mobile || '',
          department: res.data.department || ''
        }));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to load profile details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    // Mobile validation
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setAlert({ type: 'warning', message: 'Mobile number must be exactly 10 digits.' });
      return;
    }

    // Password validation if user is attempting to change password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setAlert({ type: 'warning', message: 'Please enter your current password to set a new password.' });
        return;
      }
      if (formData.newPassword.length < 8) {
        setAlert({ type: 'warning', message: 'New password must be at least 8 characters long.' });
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setAlert({ type: 'danger', message: 'New passwords do not match.' });
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        department: formData.department
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await profileAPI.updateProfile(payload);

      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Profile updated successfully!' });
        // Update global auth user state
        updateUser(res.data);
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to update profile.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* Header */}
            <div className="mb-4">
              <h2 className="fw-bold text-dark mb-1">
                <i className="bi bi-person-badge-fill text-primary me-2"></i>
                Faculty Profile & Account
              </h2>
              <p className="text-muted mb-0">Update your official faculty details and security credentials</p>
            </div>

            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: '', message: '' })}
            />

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Loading profile...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* 1. General Info Card */}
                <div className="card border-0 shadow-sm p-4 mb-4">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="bi bi-person-lines-fill text-primary me-2"></i>
                    General Information
                  </h5>

                  <div className="row g-3">
                    {/* Full Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        className="form-control"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Official Email (Read-only) */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Official Email <span className="text-muted">(Primary Identifier)</span>
                      </label>
                      <input
                        type="email"
                        className="form-control bg-light"
                        value={formData.email}
                        readOnly
                        disabled
                      />
                      <div className="form-text">Email address cannot be changed</div>
                    </div>

                    {/* Mobile Number */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Mobile Number (10 Digits) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        maxLength="10"
                        className="form-control"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Department */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Department <span className="text-danger">*</span>
                      </label>
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
                </div>

                {/* 2. Security & Password Update Card */}
                <div className="card border-0 shadow-sm p-4 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="bi bi-shield-lock-fill text-warning me-2"></i>
                      Change Password
                    </h5>
                    <span className="badge bg-light text-muted border">Optional</span>
                  </div>
                  <p className="text-muted small mb-3">
                    Leave these fields empty if you do not wish to change your password.
                  </p>

                  <div className="row g-3">
                    {/* Current Password */}
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        className="form-control"
                        placeholder="Enter current password to authorize change"
                        value={formData.currentPassword}
                        onChange={handleChange}
                      />
                    </div>

                    {/* New Password */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        className="form-control"
                        placeholder="Min 8 characters"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Confirm New Password */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        className="form-control"
                        placeholder="Re-enter new password"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="text-end">
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg fs-5"></i>
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          EduTrack &bull; Higher Education Academic Management System
        </div>
      </footer>
    </div>
  );
};

export default Profile;
