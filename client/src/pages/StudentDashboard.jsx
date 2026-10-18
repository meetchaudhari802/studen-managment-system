/**
 * Student Dashboard / Student Portal (client/src/pages/StudentDashboard.jsx)
 * Dedicated portal for students to monitor attendance statistics,
 * faculty mentor details, course standing, and daily lecture records.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import AlertMessage from '../components/AlertMessage';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordAlert, setPasswordAlert] = useState({ type: '', message: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Check login authentication and load data
  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    const savedProfile = localStorage.getItem('studentProfile');

    if (!token) {
      navigate('/student-login');
      return;
    }

    if (savedProfile) {
      try {
        setStudent(JSON.parse(savedProfile));
      } catch (e) {
        console.warn('Failed to parse cached student profile');
      }
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // apiRequest uses localStorage.getItem('token') by default,
        // so temporarily or explicitly provide studentToken
        const originalToken = localStorage.getItem('token');
        localStorage.setItem('token', token);

        const res = await studentAPI.getStudentPortalData();

        if (res.success && res.data) {
          setStudent(res.data.student);
          setStats(res.data.stats);
          setAttendanceRecords(res.data.attendanceRecords || []);
        }

        // Restore original token if present
        if (originalToken) {
          localStorage.setItem('token', originalToken);
        }
      } catch (err) {
        setError(err.message || 'Failed to load your student records.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentProfile');
    navigate('/student-login');
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordAlert({ type: '', message: '' });

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordAlert({ type: 'warning', message: 'Please enter both your current and new password.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordAlert({ type: 'warning', message: 'New password must be at least 8 characters long.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordAlert({ type: 'danger', message: 'New passwords do not match.' });
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await studentAPI.studentChangePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (res.success) {
        setPasswordAlert({ type: 'success', message: res.message || 'Password updated successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordAlert({ type: '', message: '' });
        }, 1500);
      }
    } catch (err) {
      setPasswordAlert({
        type: 'danger',
        message: err.message || 'Failed to update password. Please check your current password.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(r => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const percentage = stats?.percentage !== undefined ? stats.percentage : 0;
  const isShortAttendance = percentage < 75;

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* 1. Student Portal Top Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-2">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/student-dashboard">
            <i className="bi bi-mortarboard-fill fs-3 me-2 text-warning"></i>
            <div>
              <span className="fw-bold tracking-tight">EduTrack</span>
              <small className="d-block text-white-50" style={{ fontSize: '0.65rem', marginTop: '-4px' }}>
                Student Academic Dashboard
              </small>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <div className="text-end text-white d-none d-sm-block me-1">
              <span className="fw-semibold small">{student?.name || 'Student'}</span>
              <span className="badge bg-warning text-dark font-monospace ms-2" style={{ fontSize: '0.7rem' }}>
                {student?.enrollmentNo || 'ENROLLMENT'}
              </span>
            </div>

            <button
              onClick={() => {
                setPasswordAlert({ type: '', message: '' });
                setShowPasswordModal(true);
              }}
              className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-1"
              title="Change Portal Password"
            >
              <i className="bi bi-key-fill"></i>
              <span className="d-none d-sm-inline">Password</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-outline-light btn-sm d-none d-md-inline-flex align-items-center gap-1"
              title="Print Academic Standing Report"
            >
              <i className="bi bi-printer"></i>
              <span>Print</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-light btn-sm text-danger fw-semibold px-3 shadow-sm d-flex align-items-center gap-1"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Main Content */}
      <main className="container py-4 flex-grow-1">
        {/* Hero Profile Banner */}
        <div className="card border-0 bg-primary text-white p-4 p-md-5 mb-4 shadow" style={{ borderRadius: '16px' }}>
          <div className="row align-items-center">
            <div className="col-12 col-md-8">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-warning text-dark px-3 py-1 fw-bold">
                  <i className="bi bi-person-check-fill me-1"></i> Enrolled Student Portal
                </span>
                {student?.registrationType === 'self' && (
                  <span className="badge bg-light text-primary px-2 py-1 small">
                    Online Admission
                  </span>
                )}
              </div>

              <h2 className="fw-bold mb-1">
                Welcome, {student?.name || 'Student'}!
              </h2>

              <p className="mb-2 text-white-50 lead fs-6">
                <strong>{student?.course || 'Course'}</strong> &bull; Semester {student?.semester || 1} &bull; Enrollment No: <span className="font-monospace text-warning fw-bold">{student?.enrollmentNo}</span>
              </p>

              {student?.assignedFaculty && (
                <div className="small text-white-50 d-flex align-items-center gap-2">
                  <i className="bi bi-person-workspace text-warning"></i>
                  <span>
                    Faculty Mentor: <strong>{student.assignedFaculty.fullName}</strong> ({student.assignedFaculty.department})
                  </span>
                </div>
              )}
            </div>

            <div className="col-12 col-md-4 text-md-end mt-4 mt-md-0">
              <div className="bg-white bg-opacity-10 rounded p-3 text-center d-inline-block border border-white border-opacity-25 w-100" style={{ maxWidth: '240px' }}>
                <small className="text-white-50 text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                  Exam Eligibility Status
                </small>
                <div className={`fw-bold fs-5 mt-1 ${isShortAttendance ? 'text-warning' : 'text-white'}`}>
                  <i className={`bi ${isShortAttendance ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-1`}></i>
                  {isShortAttendance ? 'Attendance Warning' : 'Eligible for Exams'}
                </div>
                <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                  Min. 75% required
                </small>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-exclamation-octagon-fill fs-5"></i>
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading student records...</span>
            </div>
            <p className="text-muted mt-2">Loading your academic metrics & attendance log...</p>
          </div>
        ) : (
          <>
            {/* 3. Four Key Metric Cards */}
            <div className="row g-3 mb-4">
              {/* Card 1: Attendance Percentage */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 shadow-sm bg-white">
                  <div className="d-flex align-items-center">
                    <div className={`stat-icon-wrapper ${isShortAttendance ? 'bg-danger text-danger' : 'bg-success text-success'} bg-opacity-10 me-3`}>
                      <i className={`bi ${isShortAttendance ? 'bi-pie-chart' : 'bi-patch-check-fill'}`}></i>
                    </div>
                    <div>
                      <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                        Attendance Rate
                      </small>
                      <h3 className={`fw-bold mb-0 ${isShortAttendance ? 'text-danger' : 'text-success'}`}>
                        {percentage}%
                      </h3>
                    </div>
                  </div>
                  <div className="progress mt-3" style={{ height: '6px' }}>
                    <div
                      className={`progress-bar ${isShortAttendance ? 'bg-danger' : 'bg-success'}`}
                      role="progressbar"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card 2: Lectures Attended */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 shadow-sm bg-white">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary me-3">
                      <i className="bi bi-calendar2-check-fill"></i>
                    </div>
                    <div>
                      <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                        Classes Attended
                      </small>
                      <h3 className="fw-bold mb-0 text-dark">
                        {stats?.totalPresent || 0}
                      </h3>
                    </div>
                  </div>
                  <small className="text-muted mt-3 d-block">
                    Total Present marks recorded
                  </small>
                </div>
              </div>

              {/* Card 3: Classes Missed */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 shadow-sm bg-white">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-danger bg-opacity-10 text-danger me-3">
                      <i className="bi bi-calendar-x-fill"></i>
                    </div>
                    <div>
                      <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                        Classes Missed
                      </small>
                      <h3 className="fw-bold mb-0 text-danger">
                        {stats?.totalAbsent || 0}
                      </h3>
                    </div>
                  </div>
                  <small className="text-muted mt-3 d-block">
                    Absences on lecture dates
                  </small>
                </div>
              </div>

              {/* Card 4: Total Lectures Conducted */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 shadow-sm bg-white">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info me-3">
                      <i className="bi bi-journals"></i>
                    </div>
                    <div>
                      <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                        Total Classes Held
                      </small>
                      <h3 className="fw-bold mb-0 text-dark">
                        {stats?.totalLectures || 0}
                      </h3>
                    </div>
                  </div>
                  <small className="text-muted mt-3 d-block">
                    Active academic curriculum
                  </small>
                </div>
              </div>
            </div>

            {/* 4. Two-Column Layout */}
            <div className="row g-4">
              {/* Left Column: Student Details Card */}
              <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm p-4 bg-white mb-4">
                  <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">
                    <i className="bi bi-person-lines-fill text-primary me-2"></i>
                    Student Profile
                  </h5>

                  <div className="mb-3">
                    <span className="text-muted small d-block">Full Name</span>
                    <strong className="text-dark fs-6">{student?.name}</strong>
                  </div>

                  <div className="mb-3">
                    <span className="text-muted small d-block">Enrollment Number</span>
                    <span className="badge bg-secondary bg-opacity-10 text-dark font-monospace fs-6 px-2 py-1">
                      {student?.enrollmentNo}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="text-muted small d-block">Course & Semester</span>
                    <strong className="text-dark">{student?.course} (Sem {student?.semester})</strong>
                  </div>

                  <div className="mb-3">
                    <span className="text-muted small d-block">Email Address</span>
                    <span className="text-dark">{student?.email}</span>
                  </div>

                  <div className="mb-3">
                    <span className="text-muted small d-block">Registered Mobile</span>
                    <span className="text-dark">{student?.mobile}</span>
                  </div>

                  {student?.address && (
                    <div className="mb-3">
                      <span className="text-muted small d-block">Residential Address</span>
                      <span className="text-dark small">{student.address}</span>
                    </div>
                  )}

                  {student?.assignedFaculty && (
                    <div className="p-3 bg-light rounded border mt-3">
                      <small className="text-uppercase fw-bold text-primary" style={{ fontSize: '0.68rem' }}>
                        Assigned Faculty Mentor
                      </small>
                      <div className="fw-bold text-dark mt-1">{student.assignedFaculty.fullName}</div>
                      <small className="text-muted d-block">{student.assignedFaculty.department}</small>
                      <small className="text-muted d-block">{student.assignedFaculty.email}</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Attendance Records Log Table */}
              <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-sm bg-white overflow-hidden">
                  <div className="p-4 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">
                        <i className="bi bi-clock-history text-primary me-2"></i>
                        Daily Attendance History
                      </h5>
                      <small className="text-muted">Verified daily attendance marks for this academic session</small>
                    </div>

                    {/* Filter buttons */}
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className={`btn ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setStatusFilter('ALL')}
                      >
                        All ({attendanceRecords.length})
                      </button>
                      <button
                        type="button"
                        className={`btn ${statusFilter === 'Present' ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => setStatusFilter('Present')}
                      >
                        Present ({stats?.totalPresent || 0})
                      </button>
                      <button
                        type="button"
                        className={`btn ${statusFilter === 'Absent' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => setStatusFilter('Absent')}
                      >
                        Absent ({stats?.totalAbsent || 0})
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light small text-uppercase text-muted">
                        <tr>
                          <th className="ps-4">Date</th>
                          <th>Status</th>
                          <th>Recorded By</th>
                          <th>Verification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-5 text-muted">
                              <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
                              No attendance entries found for the selected filter.
                            </td>
                          </tr>
                        ) : (
                          filteredRecords.map((record) => {
                            const isPresent = record.status === 'Present';
                            const dateFormatted = new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            });

                            return (
                              <tr key={record._id}>
                                <td className="ps-4 fw-semibold text-dark">
                                  <i className="bi bi-calendar3 me-2 text-muted"></i>
                                  {dateFormatted}
                                </td>
                                <td>
                                  <span className={`badge ${isPresent ? 'bg-success' : 'bg-danger'} px-3 py-2 fw-semibold`}>
                                    <i className={`bi ${isPresent ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                                    {record.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="small fw-semibold text-dark">
                                    {record.markedBy?.fullName || 'Faculty Member'}
                                  </div>
                                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                    {record.markedBy?.department || 'Academic Department'}
                                  </small>
                                </td>
                                <td>
                                  <span className="badge bg-light text-secondary border">
                                    <i className="bi bi-shield-check text-success me-1"></i> Verified
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-shield-lock-fill me-2"></i>
                  Change Portal Password
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPasswordModal(false)}
                ></button>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="modal-body p-4">
                  <AlertMessage
                    type={passwordAlert.type}
                    message={passwordAlert.message}
                    onClose={() => setPasswordAlert({ type: '', message: '' })}
                  />

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                      If this is your first time, the initial default password was <strong>Student@123</strong>.
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="At least 8 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                      minLength={8}
                    />
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Must be at least 8 characters long
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg"></i>
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          EduTrack Student Management System &bull; Student Self-Service Portal
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
