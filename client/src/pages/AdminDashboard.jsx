/**
 * Administrator Console (client/src/pages/AdminDashboard.jsx)
 * High-level college administrative dashboard:
 * - System-wide metrics (Total Faculty, Total Students, Total Attendance records)
 * - Faculty Management (View all faculty, student count, remove faculty)
 * - College-Wide Master Student Directory (Search & manage all students college-wide)
 * - Department analytics breakdown
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AlertMessage from '../components/AlertMessage';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('faculty'); // 'faculty' | 'students' | 'departments'

  // Data states
  const [stats, setStats] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Loading & Alert states
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Delete Modals State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'faculty' | 'student', data: obj }
  const [deleting, setDeleting] = useState(false);

  // Fetch all admin data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, facultyRes, studentsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getFaculty(),
        adminAPI.getAllStudents(studentSearch)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (facultyRes.success) setFacultyList(facultyRes.data);
      if (studentsRes.success) setAllStudents(studentsRes.data);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to load administrator data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Filter students when search changes
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await adminAPI.getAllStudents(studentSearch);
        if (res.success) setAllStudents(res.data);
      } catch (err) {
        console.error('Search error', err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [studentSearch]);

  // Handle confirm delete execution
  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      if (deleteTarget.type === 'faculty') {
        const res = await adminAPI.deleteFaculty(deleteTarget.data.id);
        setAlert({ type: 'success', message: res.message || 'Faculty account removed.' });
      } else if (deleteTarget.type === 'student') {
        const res = await adminAPI.deleteStudent(deleteTarget.data._id);
        setAlert({ type: 'success', message: res.message || 'Student removed from college directory.' });
      }
      setDeleteTarget(null);
      loadAdminData();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Delete operation failed.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* Administrator Header Banner */}
        <div className="card border-0 bg-dark text-white p-4 mb-4 shadow-sm" style={{ borderRadius: '14px' }}>
          <div className="row align-items-center">
            <div className="col-12 col-md-8">
              <span className="badge bg-danger mb-2 px-3 py-1 fw-bold text-uppercase">
                <i className="bi bi-shield-lock-fill me-1"></i> Administrator Access Only
              </span>
              <h2 className="fw-bold mb-1">College Dean & Admin Console</h2>
              <p className="mb-0 text-white-50">
                System-wide oversight of faculty members, student enrollments, and academic attendance logs.
              </p>
            </div>
            <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
              <Link to="/dashboard" className="btn btn-outline-light me-2">
                <i className="bi bi-person-workspace me-1"></i> Faculty View
              </Link>
              <button onClick={loadAdminData} className="btn btn-primary" title="Refresh metrics">
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
          </div>
        </div>

        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading administrative data...</span>
            </div>
            <p className="text-muted mt-2">Loading system-wide metrics...</p>
          </div>
        ) : (
          <>
            {/* System-Wide Metric Cards */}
            <div className="row g-3 mb-4">
              {/* Total Faculty */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 shadow-sm card-hover">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary me-3">
                      <i className="bi bi-person-badge-fill"></i>
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase">Total Faculty</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.totalFaculty || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Students College-wide */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 shadow-sm card-hover">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success me-3">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase">College Students</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.totalStudents || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Attendance Logs */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 shadow-sm card-hover">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info me-3">
                      <i className="bi bi-calendar2-check-fill"></i>
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase">Attendance Logs</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.totalAttendance || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* College Attendance Rate */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 p-3 shadow-sm card-hover">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning me-3">
                      <i className="bi bi-graph-up"></i>
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase">College Avg. Rate</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.overallRate || 0}%</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Tabs Navigation */}
            <ul className="nav nav-pills mb-4 bg-white p-2 rounded shadow-sm border">
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${activeTab === 'faculty' ? 'active' : ''}`}
                  onClick={() => setActiveTab('faculty')}
                >
                  <i className="bi bi-people me-1"></i> Faculty Management ({facultyList.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${activeTab === 'students' ? 'active' : ''}`}
                  onClick={() => setActiveTab('students')}
                >
                  <i className="bi bi-mortarboard me-1"></i> Master Student Directory ({allStudents.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${activeTab === 'departments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('departments')}
                >
                  <i className="bi bi-building me-1"></i> Department & Course Breakdown
                </button>
              </li>
            </ul>

            {/* TAB 1: FACULTY MANAGEMENT */}
            {activeTab === 'faculty' && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-person-lines-fill text-primary me-2"></i>
                    Registered Faculty Accounts
                  </h5>
                  <span className="badge bg-light text-secondary border">
                    {facultyList.length} Active Professors
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Faculty Name</th>
                        <th>Email & Phone</th>
                        <th>Department</th>
                        <th className="text-center">Managed Students</th>
                        <th>Registration Date</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No faculty members registered yet.
                          </td>
                        </tr>
                      ) : (
                        facultyList.map((faculty) => (
                          <tr key={faculty.id}>
                            <td>
                              <div className="fw-bold text-dark">{faculty.fullName}</div>
                              <span className="badge bg-primary bg-opacity-10 text-primary">Faculty</span>
                            </td>
                            <td>
                              <div>{faculty.email}</div>
                              <small className="text-muted"><i className="bi bi-telephone me-1"></i>{faculty.mobile}</small>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {faculty.department}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-info bg-opacity-10 text-info fs-6 px-3 py-1">
                                {faculty.studentCount} Students
                              </span>
                            </td>
                            <td className="text-muted small">
                              {new Date(faculty.createdAt).toLocaleDateString()}
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-outline-danger btn-sm"
                                title="Remove Faculty & Data"
                                onClick={() => setDeleteTarget({ type: 'faculty', data: faculty })}
                              >
                                <i className="bi bi-trash me-1"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: MASTER STUDENT DIRECTORY */}
            {activeTab === 'students' && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-bottom">
                  <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-6">
                      <h5 className="fw-bold mb-0 text-dark">
                        <i className="bi bi-mortarboard-fill text-success me-2"></i>
                        College-Wide Master Student Records
                      </h5>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="Search any student by name, enrollment, or course..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Enrollment No</th>
                        <th>Student Name</th>
                        <th>Course & Sem</th>
                        <th>Contact</th>
                        <th>Enrolled By (Faculty)</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStudents.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No students match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        allStudents.map((student) => (
                          <tr key={student._id}>
                            <td>
                              <span className="badge bg-secondary bg-opacity-10 text-dark font-monospace fw-bold px-2 py-1">
                                {student.enrollmentNo}
                              </span>
                            </td>
                            <td>
                              <div className="fw-semibold text-dark">{student.name}</div>
                              <small className="text-muted">{student.email}</small>
                            </td>
                            <td>
                              <span className="badge bg-primary bg-opacity-10 text-primary me-1">
                                {student.course}
                              </span>
                              <small className="text-muted d-block">Sem {student.semester}</small>
                            </td>
                            <td>
                              <div className="small text-dark">{student.mobile}</div>
                              {student.address && (
                                <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '140px' }}>
                                  {student.address}
                                </small>
                              )}
                            </td>
                            <td>
                              <div className="small fw-semibold text-dark">
                                {student.createdBy?.fullName || 'Faculty User'}
                              </div>
                              <small className="text-muted">{student.createdBy?.department}</small>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-outline-danger btn-sm"
                                title="Remove Student (Admin Override)"
                                onClick={() => setDeleteTarget({ type: 'student', data: student })}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: DEPARTMENT & COURSE BREAKDOWN */}
            {activeTab === 'departments' && (
              <div className="row g-4">
                {/* Course Distribution */}
                <div className="col-12 col-lg-6">
                  <div className="card border-0 p-4 shadow-sm h-100">
                    <h5 className="fw-bold mb-3 text-dark">
                      <i className="bi bi-journal-check text-primary me-2"></i>
                      College Course Distribution
                    </h5>
                    {stats?.courseDistribution && stats.courseDistribution.length > 0 ? (
                      stats.courseDistribution.map((item, idx) => {
                        const pct = stats.totalStudents > 0
                          ? Math.round((item.count / stats.totalStudents) * 100)
                          : 0;
                        return (
                          <div key={idx} className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span className="fw-semibold text-dark">{item.course}</span>
                              <span className="badge bg-primary">{item.count} Students ({pct}%)</span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div className="progress-bar bg-primary" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted">No courses recorded yet.</p>
                    )}
                  </div>
                </div>

                {/* Faculty per Department */}
                <div className="col-12 col-lg-6">
                  <div className="card border-0 p-4 shadow-sm h-100">
                    <h5 className="fw-bold mb-3 text-dark">
                      <i className="bi bi-building-check text-success me-2"></i>
                      Faculty Members by Department
                    </h5>
                    {stats?.facultyPerDept && stats.facultyPerDept.length > 0 ? (
                      stats.facultyPerDept.map((dept, idx) => (
                        <div key={idx} className="p-3 bg-light rounded border mb-2 d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-dark">{dept.department}</span>
                          <span className="badge bg-success rounded-pill px-3 py-2">
                            {dept.count} Faculty Member(s)
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No department data recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirm Administrator Action
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteTarget(null)}
                ></button>
              </div>
              <div className="modal-body py-3">
                {deleteTarget.type === 'faculty' ? (
                  <p className="mb-1 text-dark">
                    Are you sure you want to delete faculty account <strong>{deleteTarget.data.fullName}</strong> ({deleteTarget.data.email})?
                    <br />
                    <span className="text-danger small mt-2 d-block">
                      <strong>Warning:</strong> This will also permanently delete all <strong>{deleteTarget.data.studentCount}</strong> students managed by this faculty member and their attendance logs.
                    </span>
                  </p>
                ) : (
                  <p className="mb-1 text-dark">
                    Are you sure you want to delete student <strong>{deleteTarget.data.name}</strong> ({deleteTarget.data.enrollmentNo}) from the college system?
                  </p>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={executeDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Removing...' : 'Confirm Deletion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          EduTrack &bull; College Dean & Administrator Console
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
