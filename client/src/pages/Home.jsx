/**
 * Home Landing Page (client/src/pages/Home.jsx)
 * Public showcase page for the EduTrack Student Management System PBL Micro Project.
 * - Hero banner with dynamic call-to-actions
 * - Highlights key system capabilities: Student Directory, Attendance Tracking, Analytics
 * - Architecture & MERN stack overview
 * - Institutional portal sign-in and registration
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* 1. Public Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-2">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi bi-mortarboard-fill fs-2 me-2 text-warning"></i>
            <div>
              <span className="fw-bold tracking-tight fs-4">EduTrack</span>
              <small className="d-block text-white-50" style={{ fontSize: '0.68rem', marginTop: '-4px' }}>
                Student Management System
              </small>
            </div>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#homeNavbar"
            aria-controls="homeNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="homeNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
              <li className="nav-item">
                <a className="nav-link active" href="#hero">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#features">Capabilities</a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              <Link to="/student-login" className="btn btn-outline-light btn-sm px-3 fw-semibold">
                <i className="bi bi-mortarboard me-1"></i> Student Portal
              </Link>
              <Link to="/student-register" className="btn btn-warning btn-sm px-3 fw-bold text-dark shadow-sm">
                <i className="bi bi-person-plus-fill me-1"></i> Student Registration
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-light btn-sm fw-semibold text-primary px-3 shadow-sm">
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard ({user?.fullName?.split(' ')[0]})
                </Link>
              ) : (
                <Link to="/login" className="btn btn-light btn-sm px-3 fw-semibold text-primary">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Faculty Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section id="hero" className="py-5 bg-white border-bottom">
        <div className="container py-lg-4">
          <div className="row align-items-center gy-4">
            <div className="col-12 col-lg-7 text-center text-lg-start">
              <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold mb-3">
                <i className="bi bi-shield-check me-1 text-primary"></i> Institutional Academic Platform &bull; MERN Stack
              </div>
              <h1 className="display-4 fw-bold text-dark lh-sm mb-3">
                Smart Student Management & Attendance Tracking
              </h1>
              <p className="lead text-muted mb-4 pe-lg-4">
                A modern, responsive platform engineered for higher education faculty, administrators, and students to seamlessly track attendance statistics, course records, and academic progress in real time.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Link to="/student-login" className="btn btn-warning btn-lg px-4 py-3 shadow fw-bold text-dark">
                  <i className="bi bi-mortarboard-fill me-2 fs-5"></i> Student Portal Dashboard
                </Link>
                <Link to="/student-register" className="btn btn-outline-primary btn-lg px-4 py-3 shadow-sm fw-semibold">
                  <i className="bi bi-person-plus-fill me-2"></i> Online Admission
                </Link>
                <Link to="/login" className="btn btn-primary btn-lg px-4 py-3 shadow-sm fw-semibold">
                  <i className="bi bi-box-arrow-in-right me-2"></i> Faculty & Staff Login
                </Link>
              </div>

              <div className="mt-4 pt-3 border-top d-flex gap-4 justify-content-center justify-content-lg-start text-muted small">
                <div><i className="bi bi-check-circle-fill text-success me-1"></i> JWT Authentication</div>
                <div><i className="bi bi-check-circle-fill text-success me-1"></i> MongoDB Atlas Cloud</div>
                <div><i className="bi bi-check-circle-fill text-success me-1"></i> Native Fetch API</div>
              </div>
            </div>

            {/* Hero Interactive Card Preview */}
            <div className="col-12 col-lg-5">
              <div className="card shadow-lg border-0 p-4 bg-white" style={{ borderRadius: '16px' }}>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary p-2 me-2 rounded-circle">
                      <i className="bi bi-person-workspace text-white fs-6"></i>
                    </span>
                    <div>
                      <h6 className="mb-0 fw-bold text-dark">Live System Overview</h6>
                      <small className="text-muted">Academic Session 2026</small>
                    </div>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success border border-success">
                    <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i> Active
                  </span>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded text-center border">
                      <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Enrolled Students</small>
                      <h3 className="fw-bold text-primary mb-0 mt-1">10+</h3>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded text-center border">
                      <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Avg. Attendance</small>
                      <h3 className="fw-bold text-success mb-0 mt-1">80.0%</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-light p-3 rounded border mb-3">
                  <div className="d-flex justify-content-between text-muted small mb-1">
                    <span>Course: B.Tech CSE</span>
                    <strong className="text-dark">4 Students</strong>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-primary" style={{ width: '40%' }}></div>
                  </div>

                  <div className="d-flex justify-content-between text-muted small mt-2 mb-1">
                    <span>Course: B.Tech IT</span>
                    <strong className="text-dark">2 Students</strong>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-info" style={{ width: '20%' }}></div>
                  </div>
                </div>

                <Link to="/login" className="btn btn-outline-primary w-100 fw-semibold">
                  <i className="bi bi-arrow-right-circle me-1"></i> Access Live Faculty Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core System Features */}
      <section id="features" className="py-5 bg-light">
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">
              Capabilities
            </span>
            <h2 className="fw-bold text-dark mt-2">Engineered for Academic Excellence</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '620px' }}>
              Everything needed to run department records cleanly, with built-in data isolation and responsive design.
            </p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 p-4 shadow-sm card-hover">
                <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary mb-3">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h5 className="fw-bold text-dark">Student Registration & Directory</h5>
                <p className="text-muted mb-0 small">
                  Register new students with instant duplicate detection, track enrollment numbers, manage courses & semesters, and update contact profiles.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 p-4 shadow-sm card-hover">
                <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success mb-3">
                  <i className="bi bi-calendar-check-fill"></i>
                </div>
                <h5 className="fw-bold text-dark">Daily Attendance Tracker</h5>
                <p className="text-muted mb-0 small">
                  Mark daily attendance as Present or Absent with custom dates, compound uniqueness, and automatic percentage calculation.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 p-4 shadow-sm card-hover">
                <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info mb-3">
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
                <h5 className="fw-bold text-dark">Live Analytics Dashboard</h5>
                <p className="text-muted mb-0 small">
                  Real-time stat cards, today's attendance summary, and dynamic progress bar visualizers per course.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 p-4 shadow-sm card-hover">
                <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning mb-3">
                  <i className="bi bi-search"></i>
                </div>
                <h5 className="fw-bold text-dark">Instant Live Search</h5>
                <p className="text-muted mb-0 small">
                  Real-time multi-field regex filtering across student name, enrollment ID, or course branch.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 p-4 shadow-sm card-hover">
                <div className="stat-icon-wrapper bg-danger bg-opacity-10 text-danger mb-3">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h5 className="fw-bold text-dark">JWT Security & Isolation</h5>
                <p className="text-muted mb-0 small">
                  Bcrypt password encryption and signed JWT bearer tokens ensure professors only see and manage their own students.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 p-4 shadow-sm card-hover">
                <div className="stat-icon-wrapper bg-secondary bg-opacity-10 text-secondary mb-3">
                  <i className="bi bi-cloud-check-fill"></i>
                </div>
                <h5 className="fw-bold text-dark">MongoDB Atlas Cloud</h5>
                <p className="text-muted mb-0 small">
                  Cloud database integration with Mongoose ODM schemas, compound indices, and automatic offline fallback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* 5. Institutional Portal Callout */}
      <section className="py-5 bg-light">
        <div className="container py-lg-4">
          <div className="card border-0 bg-primary text-white p-4 p-lg-5 shadow" style={{ borderRadius: '18px' }}>
            <div className="row align-items-center">
              <div className="col-12 col-lg-8">
                <span className="badge bg-warning text-dark px-3 py-1 fw-bold mb-2">
                  <i className="bi bi-shield-lock-fill"></i> Secure Institutional Access
                </span>
                <h2 className="fw-bold mb-2">Access Your Academic Dashboard</h2>
                <p className="text-white-50 mb-3 lead">
                  Seamlessly manage student enrollments, course records, daily attendance tracking, and faculty analytics.
                </p>
                <div className="d-flex flex-wrap gap-2 text-white-50 small">
                  <div><i className="bi bi-check2 text-warning me-1"></i> Role-Based Permissions</div>
                  <div><i className="bi bi-check2 text-warning me-1"></i> Master Student Directory</div>
                  <div><i className="bi bi-check2 text-warning me-1"></i> Live Course Analytics</div>
                </div>
              </div>
              <div className="col-12 col-lg-5 text-lg-end mt-4 mt-lg-0 d-flex flex-wrap justify-content-lg-end gap-2">
                <Link to="/student-register" className="btn btn-warning btn-lg px-4 py-3 fw-bold text-dark shadow">
                  <i className="bi bi-mortarboard-fill me-2"></i> Register as Student
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Faculty Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-white border-top py-4 text-center text-muted small mt-auto">
        <div className="container">
          <div className="mb-2 fw-semibold text-dark">
            EduTrack &bull; Higher Education Academic Management System
          </div>
          <p className="mb-0 text-muted">
            Designed for colleges, universities, and academic institutions &bull; Secure MERN Architecture
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
