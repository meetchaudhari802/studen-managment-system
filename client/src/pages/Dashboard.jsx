/**
 * Dashboard Page (client/src/pages/Dashboard.jsx)
 * Protected landing page displaying:
 * - Logged-in teacher's greeting and department
 * - Metric stat cards: Total Students, Today's Present, Today's Absent, Overall Attendance %
 * - Course distribution list
 * - Quick action links to Students Directory and Edit Profile
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import Navbar from '../components/Navbar';
import AlertMessage from '../components/AlertMessage';

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* Welcome Banner */}
        <div className="card border-0 bg-primary text-white p-4 mb-4 shadow-sm" style={{ borderRadius: '14px' }}>
          <div className="row align-items-center">
            <div className="col-12 col-md-8">
              <span className="badge bg-white text-primary mb-2 px-2 py-1">
                <i className="bi bi-person-check-fill me-1"></i> Faculty Portal
              </span>
              <h2 className="fw-bold mb-1">
                Welcome back, {user?.fullName || 'Professor'}!
              </h2>
              <p className="mb-0 text-white-50">
                Department of {user?.department || 'Engineering & Technology'} | Active Academic Session
              </p>
            </div>
            <div className="col-12 col-md-5 text-md-end mt-3 mt-md-0 d-flex flex-wrap justify-content-md-end gap-2">
              <Link to="/students?add=true" className="btn btn-warning fw-bold shadow text-dark px-3">
                <i className="bi bi-person-plus-fill me-1"></i> Register Student
              </Link>
              <Link to="/students" className="btn btn-outline-light">
                <i className="bi bi-people-fill me-1"></i> View Directory
              </Link>
              <Link to="/profile" className="btn btn-outline-light">
                <i className="bi bi-gear-fill me-1"></i> Profile
              </Link>
            </div>
          </div>
        </div>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading statistics...</span>
            </div>
            <p className="text-muted mt-2">Loading academic metrics...</p>
          </div>
        ) : (
          <>
            {/* Stat Metric Cards Row */}
            <div className="row g-3 mb-4">
              {/* Total Students */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 card-hover shadow-sm">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary me-3">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase">Total Students</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.totalStudents || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Present */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 card-hover shadow-sm">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success me-3">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase">Today's Present</div>
                      <h3 className="fw-bold mb-0 text-dark">
                        {stats?.todayAttendance?.present || 0}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Absent */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 card-hover shadow-sm">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-danger bg-opacity-10 text-danger me-3">
                      <i className="bi bi-x-circle-fill"></i>
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase">Today's Absent</div>
                      <h3 className="fw-bold mb-0 text-dark">
                        {stats?.todayAttendance?.absent || 0}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Attendance Rate */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 card-hover shadow-sm">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info me-3">
                      <i className="bi bi-graph-up-arrow"></i>
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase">Avg. Attendance</div>
                      <h3 className="fw-bold mb-0 text-dark">
                        {stats?.overallPercentage ?? 0}%
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Breakdown & Quick Actions Row */}
            <div className="row g-4 mb-4">
              {/* Course Distribution */}
              <div className="col-12 col-lg-8">
                <div className="card border-0 p-4 shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 text-dark">
                      <i className="bi bi-journal-bookmark-fill text-primary me-2"></i>
                      Students Enrolled by Course
                    </h5>
                    <span className="badge bg-light text-secondary border">
                      {stats?.courseBreakdown?.length || 0} Courses Active
                    </span>
                  </div>

                  {stats?.courseBreakdown && stats.courseBreakdown.length > 0 ? (
                    <div className="row g-3">
                      {stats.courseBreakdown.map((item, idx) => {
                        const percent = stats.totalStudents > 0
                          ? Math.round((item.count / stats.totalStudents) * 100)
                          : 0;

                        return (
                          <div key={idx} className="col-12 col-md-6">
                            <div className="p-3 bg-light rounded border">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold text-dark">{item.course}</span>
                                <span className="badge bg-primary rounded-pill">
                                  {item.count} Students
                                </span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div
                                  className="progress-bar bg-primary"
                                  role="progressbar"
                                  style={{ width: `${percent}%` }}
                                  aria-valuenow={percent}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              <small className="text-muted mt-1 d-block text-end">
                                {percent}% of your total students
                              </small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                      No students enrolled yet. Click "Add Student" to get started!
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions & Attendance Status */}
              <div className="col-12 col-lg-4">
                <div className="card border-0 p-4 shadow-sm h-100">
                  <h5 className="fw-bold mb-3 text-dark">
                    <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
                    Today's Attendance Status
                  </h5>

                  <div className="bg-light p-3 rounded mb-3 border">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Status Date:</span>
                      <strong className="text-dark">{stats?.todayAttendance?.date || 'Today'}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Total Marked:</span>
                      <strong className="text-primary">{stats?.todayAttendance?.totalMarked || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Pending Today:</span>
                      <strong className="text-secondary">{stats?.todayAttendance?.unmarked || 0}</strong>
                    </div>
                  </div>

                  <h6 className="fw-bold text-muted small text-uppercase mb-2">Quick Navigation</h6>
                  <div className="d-grid gap-2">
                    <Link to="/students?add=true" className="btn btn-primary text-start d-flex align-items-center justify-content-between shadow-sm">
                      <span><i className="bi bi-person-plus-fill me-2"></i> Register New Student</span>
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                    <Link to="/students" className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between">
                      <span><i className="bi bi-people-fill me-2"></i> View Students Directory</span>
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                    <Link to="/profile" className="btn btn-outline-secondary text-start d-flex align-items-center justify-content-between">
                      <span><i className="bi bi-person-gear me-2"></i> Faculty Settings</span>
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
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

export default Dashboard;
