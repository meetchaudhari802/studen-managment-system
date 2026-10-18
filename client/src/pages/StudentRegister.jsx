/**
 * Student Self-Registration Page (client/src/pages/StudentRegister.jsx)
 * Public admission & enrollment portal for students.
 * Registered students automatically appear in the assigned faculty & department's directory.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../services/api';
import AlertMessage from '../components/AlertMessage';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNo: '',
    email: '',
    mobile: '',
    course: 'B.Tech CSE',
    semester: 1,
    assignedFaculty: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [registeredStudent, setRegisteredStudent] = useState(null);

  // Load available faculty mentors
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        setLoadingFaculty(true);
        const res = await studentAPI.getPublicFaculty();
        if (res.success && Array.isArray(res.data)) {
          setFacultyList(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, assignedFaculty: res.data[0]._id }));
          }
        }
      } catch (err) {
        console.warn('Could not fetch faculty list:', err.message);
      } finally {
        setLoadingFaculty(false);
      }
    };

    loadFaculty();
  }, []);

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

    // Client-side validations
    if (!formData.name.trim() || !formData.enrollmentNo.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.password) {
      setAlert({ type: 'warning', message: 'Please complete all required fields.' });
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      setAlert({ type: 'warning', message: 'Mobile number must be exactly 10 digits.' });
      return;
    }

    if (formData.password.length < 8) {
      setAlert({ type: 'warning', message: 'Password must be at least 8 characters long.' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({ type: 'warning', message: 'Passwords do not match.' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await studentAPI.publicRegister({
        name: formData.name.trim(),
        enrollmentNo: formData.enrollmentNo.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        course: formData.course,
        semester: Number(formData.semester),
        assignedFaculty: formData.assignedFaculty || undefined,
        address: formData.address.trim(),
        password: formData.password
      });

      if (res.success) {
        setRegisteredStudent(res.data);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.message || 'Registration failed. Please check your details and try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setRegisteredStudent(null);
    setFormData({
      name: '',
      enrollmentNo: '',
      email: '',
      mobile: '',
      course: 'B.Tech CSE',
      semester: 1,
      assignedFaculty: facultyList.length > 0 ? facultyList[0]._id : '',
      address: '',
      password: '',
      confirmPassword: ''
    });
    setAlert({ type: '', message: '' });
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* 1. Public Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-2">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi bi-mortarboard-fill fs-2 me-2 text-warning"></i>
            <div>
              <span className="fw-bold tracking-tight fs-4">EduTrack</span>
              <small className="d-block text-white-50" style={{ fontSize: '0.68rem', marginTop: '-4px' }}>
                Student Admissions & Enrollment
              </small>
            </div>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link to="/" className="btn btn-outline-light btn-sm px-3">
              <i className="bi bi-house me-1"></i> Home
            </Link>
            <Link to="/login" className="btn btn-warning btn-sm fw-bold text-dark px-3 shadow-sm">
              <i className="bi bi-box-arrow-in-right me-1"></i> Faculty Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Main Content */}
      <main className="container py-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-7">
            {/* Header info */}
            <div className="text-center mb-4">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
                <i className="bi bi-person-lines-fill me-1"></i> Academic Session 2024-2025
              </span>
              <h2 className="fw-bold text-dark mt-1">Student Online Registration</h2>
              <p className="text-muted">
                Complete your institutional enrollment. Your registered profile is directly verified and managed by your department faculty.
              </p>
            </div>

            {/* Success Card */}
            {registeredStudent ? (
              <div className="card border-0 shadow-sm p-4 p-md-5 text-center bg-white rounded-3">
                <div className="mb-3">
                  <div
                    className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-check2-circle fs-1"></i>
                  </div>
                </div>

                <h3 className="fw-bold text-dark mb-1">Registration Successful!</h3>
                <p className="text-muted mb-4">
                  Your student record has been created and enrolled into the institutional directory.
                </p>

                <div className="card bg-light border p-4 text-start mb-4 mx-auto w-100" style={{ maxWidth: '500px' }}>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-muted small">Student Name:</span>
                    <strong className="text-dark">{registeredStudent.name}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-muted small">Enrollment No:</span>
                    <span className="badge bg-primary fs-6">{registeredStudent.enrollmentNo}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-muted small">Course & Semester:</span>
                    <strong className="text-dark">{registeredStudent.course} (Sem {registeredStudent.semester})</strong>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-muted small">Email Address:</span>
                    <span className="text-dark">{registeredStudent.email}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Assigned Department:</span>
                    <span className="text-success fw-semibold">
                      <i className="bi bi-check-circle-fill me-1"></i> Verified Active
                    </span>
                  </div>
                </div>

                <div className="alert alert-info border-0 py-3 text-start small d-flex align-items-center gap-2 mb-4 mx-auto w-100" style={{ maxWidth: '500px' }}>
                  <i className="bi bi-info-circle-fill fs-4 text-info"></i>
                  <div>
                    <strong>Visible to Faculty:</strong> Your professor can now track your daily attendance and academic progress from their portal.
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link to="/student-login" className="btn btn-warning px-4 py-2 fw-bold text-dark shadow-sm">
                    <i className="bi bi-mortarboard-fill me-1"></i> Proceed to Student Login
                  </Link>
                  <button onClick={handleReset} className="btn btn-outline-primary px-4 py-2 fw-semibold">
                    <i className="bi bi-person-plus me-1"></i> Register Another Student
                  </button>
                  <Link to="/" className="btn btn-outline-secondary px-4 py-2 fw-semibold">
                    <i className="bi bi-house me-1"></i> Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <div className="card border-0 shadow-sm p-4 p-md-5 bg-white rounded-3">
                <AlertMessage
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert({ type: '', message: '' })}
                />

                <form onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <h6 className="fw-bold text-uppercase text-muted small mb-3 border-bottom pb-2">
                    <i className="bi bi-person-badge me-1 text-primary"></i> 1. Personal Details
                  </h6>

                  <div className="row g-3 mb-4">
                    {/* Full Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Student Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Enrollment Number */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Enrollment Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="enrollmentNo"
                        className="form-control text-uppercase"
                        placeholder="e.g. CS2024045"
                        value={formData.enrollmentNo}
                        onChange={handleChange}
                        required
                      />
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>Must be unique across the college</small>
                    </div>

                    {/* Email */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="student@college.edu"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Mobile Number */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Mobile Number (10 Digits) <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        name="mobile"
                        className="form-control"
                        placeholder="9876543210"
                        maxLength="10"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Academic Details */}
                  <h6 className="fw-bold text-uppercase text-muted small mb-3 border-bottom pb-2">
                    <i className="bi bi-book me-1 text-primary"></i> 2. Academic & Course Enrollment
                  </h6>

                  <div className="row g-3 mb-4">
                    {/* Course */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Course / Degree <span className="text-danger">*</span></label>
                      <select
                        name="course"
                        className="form-select"
                        value={formData.course}
                        onChange={handleChange}
                        required
                      >
                        <option value="B.Tech CSE">B.Tech - Computer Science & Engineering (CSE)</option>
                        <option value="B.Tech IT">B.Tech - Information Technology (IT)</option>
                        <option value="B.Tech ECE">B.Tech - Electronics & Communication (ECE)</option>
                        <option value="BCA">Bachelor of Computer Applications (BCA)</option>
                        <option value="MCA">Master of Computer Applications (MCA)</option>
                        <option value="B.Tech ME">B.Tech - Mechanical Engineering (ME)</option>
                        <option value="B.Tech CE">B.Tech - Civil Engineering (CE)</option>
                      </select>
                    </div>

                    {/* Semester */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Current Semester <span className="text-danger">*</span></label>
                      <select
                        name="semester"
                        className="form-select"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Faculty Mentor */}
                    <div className="col-12">
                      <label className="form-label fw-semibold small">
                        Department Faculty / Mentor <span className="text-muted">(Optional)</span>
                      </label>
                      <select
                        name="assignedFaculty"
                        className="form-select"
                        value={formData.assignedFaculty}
                        onChange={handleChange}
                        disabled={loadingFaculty}
                      >
                        <option value="">-- General Department Enrollment --</option>
                        {facultyList.map(f => (
                          <option key={f._id} value={f._id}>
                            {f.fullName} ({f.department})
                          </option>
                        ))}
                      </select>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Your attendance and performance records will be reviewed by this faculty member.
                      </small>
                    </div>

                    {/* Residential Address */}
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Residential Address / City</label>
                      <textarea
                        name="address"
                        className="form-control"
                        rows="2"
                        placeholder="e.g. 123 University Campus Road, City"
                        value={formData.address}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

                  {/* Account Security */}
                  <h6 className="fw-bold text-uppercase text-muted small mb-3 border-bottom pb-2">
                    <i className="bi bi-shield-lock me-1 text-primary"></i> 3. Student Portal Account Security
                  </h6>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Create Portal Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                      />
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Must be at least 8 characters long
                      </small>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  {/* Submission Button */}
                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          <span>Submitting Registration...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-check-fill fs-5"></i>
                          <span>Complete Student Registration</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          EduTrack Student Management System &copy; {new Date().getFullYear()} &bull; Academic Portal
        </div>
      </footer>
    </div>
  );
};

export default StudentRegister;
