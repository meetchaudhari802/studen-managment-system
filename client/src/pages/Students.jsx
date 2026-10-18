/**
 * Students Directory Page (client/src/pages/Students.jsx)
 * Comprehensive student management:
 * - Search by name, enrollment number, or course
 * - Bootstrap modal for Add / Edit with validation & duplicate detection
 * - Delete with confirmation
 * - Mark Attendance modal (date + Present/Absent)
 * - View Attendance modal with percentage and history
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AlertMessage from '../components/AlertMessage';
import { studentAPI, attendanceAPI } from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Add/Edit Student Modal State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [studentForm, setStudentForm] = useState({
    enrollmentNo: '',
    name: '',
    email: '',
    mobile: '',
    course: 'B.Tech CSE',
    semester: 1,
    address: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Mark Attendance Modal State
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceTarget, setAttendanceTarget] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });
  const [attendanceSubmitting, setAttendanceSubmitting] = useState(false);

  // View Attendance History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Student Attendance percentages map (studentId -> percentage)
  const [attendancePercentages, setAttendancePercentages] = useState({});

  // Fetch student list with search, filters & pagination
  const loadStudents = async (targetPage = page, targetSearch = search, targetCourse = courseFilter, targetSemester = semesterFilter) => {
    try {
      setLoading(true);
      const res = await studentAPI.getStudents({
        search: targetSearch,
        course: targetCourse,
        semester: targetSemester,
        page: targetPage,
        limit: 10
      });
      if (res.success) {
        setStudents(res.data);
        if (res.pagination) {
          setPage(res.pagination.page);
          setTotalPages(res.pagination.totalPages);
        }
        if (res.total !== undefined) {
          setTotalCount(res.total);
        }
        // Load attendance metrics for each student
        fetchAttendancePercentages(res.data);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to fetch students.' });
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch attendance % for list of students
  const fetchAttendancePercentages = async (studentList) => {
    const percentages = {};
    for (const s of studentList) {
      try {
        const attRes = await attendanceAPI.getStudentAttendance(s._id);
        if (attRes.success && attRes.data?.stats) {
          percentages[s._id] = attRes.data.stats.percentage;
        }
      } catch (e) {
        percentages[s._id] = null;
      }
    }
    setAttendancePercentages(percentages);
  };

  const location = useLocation();

  useEffect(() => {
    loadStudents(1, search, courseFilter, semesterFilter);
  }, [search, courseFilter, semesterFilter]);

  // Open modal for adding a new student
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentStudentId(null);
    setStudentForm({
      enrollmentNo: '',
      name: '',
      email: '',
      mobile: '',
      course: 'B.Tech CSE',
      semester: 1,
      address: ''
    });
    setShowStudentModal(true);
  };

  // If redirected with ?add=true, automatically open the student registration modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      handleOpenAddModal();
    }
  }, [location.search]);

  // Open modal for editing existing student
  const handleOpenEditModal = (student) => {
    setIsEditing(true);
    setCurrentStudentId(student._id);
    setStudentForm({
      enrollmentNo: student.enrollmentNo,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      course: student.course,
      semester: student.semester,
      address: student.address || ''
    });
    setShowStudentModal(true);
  };

  // Handle student form change
  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit Add or Edit Student Form
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    // Validate 10-digit mobile
    if (!/^[0-9]{10}$/.test(studentForm.mobile)) {
      setAlert({ type: 'warning', message: 'Mobile number must be exactly 10 digits.' });
      return;
    }

    try {
      setFormSubmitting(true);
      if (isEditing) {
        const res = await studentAPI.updateStudent(currentStudentId, studentForm);
        setAlert({ type: 'success', message: res.message || 'Student updated successfully!' });
      } else {
        const res = await studentAPI.createStudent(studentForm);
        setAlert({ type: 'success', message: res.message || 'Student added successfully!' });
      }
      setShowStudentModal(false);
      loadStudents(search);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Operation failed.' });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const handleConfirmDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Execute Delete
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      const res = await studentAPI.deleteStudent(studentToDelete._id);
      setAlert({ type: 'success', message: res.message || 'Student deleted.' });
      setShowDeleteModal(false);
      setStudentToDelete(null);
      loadStudents(search);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to delete student.' });
    }
  };

  // Open Mark Attendance Modal
  const handleOpenAttendanceModal = (student) => {
    setAttendanceTarget(student);
    setAttendanceForm({
      date: new Date().toISOString().split('T')[0],
      status: 'Present'
    });
    setShowAttendanceModal(true);
  };

  // Save Attendance
  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceTarget) return;

    try {
      setAttendanceSubmitting(true);
      const res = await attendanceAPI.markAttendance({
        studentId: attendanceTarget._id,
        date: attendanceForm.date,
        status: attendanceForm.status
      });

      setAlert({ type: 'success', message: res.message || 'Attendance marked successfully!' });
      setShowAttendanceModal(false);

      // Refresh percentage for this student
      const updatedAtt = await attendanceAPI.getStudentAttendance(attendanceTarget._id);
      if (updatedAtt.success) {
        setAttendancePercentages(prev => ({
          ...prev,
          [attendanceTarget._id]: updatedAtt.data.stats.percentage
        }));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to mark attendance.' });
    } finally {
      setAttendanceSubmitting(false);
    }
  };

  // Open View History Modal
  const handleOpenHistoryModal = async (student) => {
    try {
      setShowHistoryModal(true);
      setHistoryLoading(true);
      const res = await attendanceAPI.getStudentAttendance(student._id);
      if (res.success) {
        setHistoryData(res.data);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to fetch attendance history.' });
      setShowHistoryModal(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* Header with Title and Add Button */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1 text-dark">
              <i className="bi bi-people-fill text-primary me-2"></i>
              Students Directory
            </h2>
            <p className="text-muted mb-0">Manage student records, mark daily attendance, and track academic standing</p>
          </div>
          <button
            id="btnRegisterStudent"
            onClick={handleOpenAddModal}
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-3 py-2 fw-semibold"
          >
            <i className="bi bi-person-plus-fill fs-5"></i>
            <span>+ Register New Student</span>
          </button>
        </div>

        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        {/* Search & Filter Toolbar */}
        <div className="card border-0 shadow-sm p-3 mb-4">
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by student name, enrollment no, or course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearch('')}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Course Filter Dropdown */}
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="ALL">All Courses</option>
                <option value="B.Tech CSE">B.Tech CSE</option>
                <option value="B.Tech IT">B.Tech IT</option>
                <option value="B.Tech ECE">B.Tech ECE</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.Tech ME">B.Tech ME</option>
                <option value="B.Tech CE">B.Tech CE</option>
              </select>
            </div>

            {/* Semester Filter Dropdown */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                <option value="ALL">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            {/* Total Count Badge */}
            <div className="col-12 col-md-2 text-md-end text-muted small">
              <span className="badge bg-light text-dark border px-2 py-1">
                <strong>{totalCount || students.length}</strong> {totalCount === 1 ? 'Student' : 'Students'}
              </span>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="card border-0 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading students...</span>
              </div>
              <p className="text-muted mt-2">Loading students directory...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-secondary">No Students Found</h5>
              <p className="text-muted">
                {search
                  ? `No student matching "${search}" was found.`
                  : 'Start by clicking "+ Add New Student" to enroll your first student.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Enrollment No</th>
                    <th>Student Info</th>
                    <th>Course & Sem</th>
                    <th>Contact</th>
                    <th>Attendance %</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const percentage = attendancePercentages[student._id];
                    const isLowAttendance = percentage !== null && percentage !== undefined && percentage < 75;

                    return (
                      <tr key={student._id}>
                        <td>
                          <span className="badge bg-secondary bg-opacity-10 text-dark font-monospace fw-bold px-2 py-1">
                            {student.enrollmentNo}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark d-flex align-items-center gap-2">
                            <span>{student.name}</span>
                            {student.registrationType === 'self' && (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success" style={{ fontSize: '0.65rem' }}>
                                Online Enrolled
                              </span>
                            )}
                          </div>
                          <small className="text-muted">{student.email}</small>
                        </td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary me-1">
                            {student.course}
                          </span>
                          <small className="text-muted d-block mt-1">Sem {student.semester}</small>
                        </td>
                        <td>
                          <div className="small text-dark">
                            <i className="bi bi-telephone me-1 text-muted"></i>
                            {student.mobile}
                          </div>
                          {student.address && (
                            <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '160px' }}>
                              <i className="bi bi-geo-alt me-1"></i>
                              {student.address}
                            </small>
                          )}
                        </td>
                        <td>
                          {percentage !== undefined && percentage !== null ? (
                            <span
                              className={`badge ${isLowAttendance ? 'bg-danger' : 'bg-success'} px-2 py-1 cursor-pointer`}
                              style={{ cursor: 'pointer' }}
                              title="Click to view full attendance history"
                              onClick={() => handleOpenHistoryModal(student)}
                            >
                              <i className={`bi ${isLowAttendance ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-1`}></i>
                              {percentage}%
                            </span>
                          ) : (
                            <span className="text-muted small">N/A</span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm" role="group">
                            {/* Mark Attendance Button */}
                            <button
                              type="button"
                              className="btn btn-outline-success"
                              title="Mark Daily Attendance"
                              onClick={() => handleOpenAttendanceModal(student)}
                            >
                              <i className="bi bi-calendar-check"></i>
                            </button>

                            {/* View History Button */}
                            <button
                              type="button"
                              className="btn btn-outline-info"
                              title="View Attendance Report"
                              onClick={() => handleOpenHistoryModal(student)}
                            >
                              <i className="bi bi-clock-history"></i>
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              title="Edit Student Info"
                              onClick={() => handleOpenEditModal(student)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              title="Delete Student"
                              onClick={() => handleConfirmDelete(student)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && students.length > 0 && totalPages > 1 && (
            <div className="card-footer bg-white border-top d-flex flex-column flex-sm-row justify-content-between align-items-center py-3 px-3 gap-2">
              <div className="small text-muted">
                Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total students)
              </div>
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={page <= 1}
                  onClick={() => loadStudents(page - 1, search, courseFilter, semesterFilter)}
                >
                  <i className="bi bi-chevron-left me-1"></i> Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={page >= totalPages}
                  onClick={() => loadStudents(page + 1, search, courseFilter, semesterFilter)}
                >
                  Next <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 1. ADD / EDIT STUDENT MODAL */}
      {showStudentModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-person-plus-fill'} text-primary me-2`}></i>
                  {isEditing ? 'Edit Student Details' : 'Enroll New Student'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStudentModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveStudent}>
                <div className="modal-body p-4">
                  {!isEditing && (
                    <div className="alert alert-info py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-info-circle-fill text-info fs-5"></i>
                      <div>
                        Initial Student Portal password will be <strong>Student@123</strong>. Students can sign in and change it anytime.
                      </div>
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Enrollment No */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Enrollment No <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="enrollmentNo"
                        className="form-control text-uppercase"
                        placeholder="e.g. CSE2024099"
                        value={studentForm.enrollmentNo}
                        onChange={handleStudentFormChange}
                        required
                      />
                    </div>

                    {/* Student Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Student Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Full student name"
                        value={studentForm.name}
                        onChange={handleStudentFormChange}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="student@college.edu"
                        value={studentForm.email}
                        onChange={handleStudentFormChange}
                        required
                      />
                    </div>

                    {/* Mobile */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">
                        Mobile (10 Digits) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        maxLength="10"
                        className="form-control"
                        placeholder="9876543210"
                        value={studentForm.mobile}
                        onChange={handleStudentFormChange}
                        required
                      />
                    </div>

                    {/* Course */}
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold small">
                        Course <span className="text-danger">*</span>
                      </label>
                      <select
                        name="course"
                        className="form-select"
                        value={studentForm.course}
                        onChange={handleStudentFormChange}
                        required
                      >
                        <option value="B.Tech CSE">B.Tech CSE</option>
                        <option value="B.Tech IT">B.Tech IT</option>
                        <option value="B.Tech ECE">B.Tech ECE</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                      </select>
                    </div>

                    {/* Semester */}
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">
                        Semester <span className="text-danger">*</span>
                      </label>
                      <select
                        name="semester"
                        className="form-select"
                        value={studentForm.semester}
                        onChange={handleStudentFormChange}
                        required
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                          <option key={sem} value={sem}>Sem {sem}</option>
                        ))}
                      </select>
                    </div>

                    {/* Address */}
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Residential Address</label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        placeholder="City / Area"
                        value={studentForm.address}
                        onChange={handleStudentFormChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowStudentModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={formSubmitting}
                  >
                    {formSubmitting && <span className="spinner-border spinner-border-sm"></span>}
                    <span>{isEditing ? 'Save Changes' : 'Create Student'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. MARK ATTENDANCE MODAL */}
      {showAttendanceModal && attendanceTarget && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-calendar-check text-success me-2"></i>
                  Mark Daily Attendance
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAttendanceModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveAttendance}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded mb-3 border">
                    <div className="fw-bold text-dark fs-6">{attendanceTarget.name}</div>
                    <small className="text-muted">
                      Enrollment: <strong>{attendanceTarget.enrollmentNo}</strong> &bull; {attendanceTarget.course}
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Attendance Status</label>
                    <div className="d-flex gap-3">
                      <div className="form-check form-check-inline flex-fill border p-2 rounded text-center">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="attendanceStatus"
                          id="statusPresent"
                          value="Present"
                          checked={attendanceForm.status === 'Present'}
                          onChange={() => setAttendanceForm(prev => ({ ...prev, status: 'Present' }))}
                        />
                        <label className="form-check-label fw-bold text-success" htmlFor="statusPresent">
                          <i className="bi bi-check-circle-fill me-1"></i> Present
                        </label>
                      </div>

                      <div className="form-check form-check-inline flex-fill border p-2 rounded text-center">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="attendanceStatus"
                          id="statusAbsent"
                          value="Absent"
                          checked={attendanceForm.status === 'Absent'}
                          onChange={() => setAttendanceForm(prev => ({ ...prev, status: 'Absent' }))}
                        />
                        <label className="form-check-label fw-bold text-danger" htmlFor="statusAbsent">
                          <i className="bi bi-x-circle-fill me-1"></i> Absent
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowAttendanceModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success d-flex align-items-center gap-2"
                    disabled={attendanceSubmitting}
                  >
                    {attendanceSubmitting && <span className="spinner-border spinner-border-sm"></span>}
                    <span>Save Attendance</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW ATTENDANCE REPORT MODAL */}
      {showHistoryModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-clock-history text-info me-2"></i>
                  Attendance History & Standing
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowHistoryModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {historyLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-2">Fetching records...</p>
                  </div>
                ) : historyData ? (
                  <>
                    <div className="p-3 bg-light rounded mb-4 border d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">{historyData.student?.name}</h5>
                        <small className="text-muted">
                          {historyData.student?.enrollmentNo} &bull; {historyData.student?.course}
                        </small>
                      </div>

                      <div className="d-flex gap-2">
                        <div className="badge bg-secondary p-2 text-center">
                          <small className="d-block text-white-50">Total</small>
                          <span className="fs-6 fw-bold">{historyData.stats?.total}</span>
                        </div>
                        <div className="badge bg-success p-2 text-center">
                          <small className="d-block text-white-50">Present</small>
                          <span className="fs-6 fw-bold">{historyData.stats?.present}</span>
                        </div>
                        <div className="badge bg-danger p-2 text-center">
                          <small className="d-block text-white-50">Absent</small>
                          <span className="fs-6 fw-bold">{historyData.stats?.absent}</span>
                        </div>
                        <div className={`badge ${historyData.stats?.percentage < 75 ? 'bg-danger' : 'bg-primary'} p-2 text-center`}>
                          <small className="d-block text-white-50">Rate</small>
                          <span className="fs-6 fw-bold">{historyData.stats?.percentage}%</span>
                        </div>
                      </div>
                    </div>

                    <h6 className="fw-bold mb-2 text-secondary small text-uppercase">Recorded Sessions</h6>
                    {historyData.records?.length === 0 ? (
                      <p className="text-muted text-center py-3">No attendance records logged for this student yet.</p>
                    ) : (
                      <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        <table className="table table-sm table-bordered mb-0">
                          <thead className="table-light sticky-top">
                            <tr>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyData.records.map((rec) => (
                              <tr key={rec._id}>
                                <td>{new Date(rec.date).toLocaleDateString()}</td>
                                <td>
                                  <span className={`badge ${rec.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                                    {rec.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowHistoryModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DELETE CONFIRMATION MODAL */}
      {showDeleteModal && studentToDelete && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirm Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body py-3">
                <p className="mb-1 text-dark">
                  Are you sure you want to delete student <strong>{studentToDelete.name}</strong> ({studentToDelete.enrollmentNo})?
                </p>
                <small className="text-muted">
                  This will also permanently delete all associated attendance history. This action cannot be undone.
                </small>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteStudent}
                >
                  Yes, Delete Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          EduTrack &bull; Higher Education Academic Management System
        </div>
      </footer>
    </div>
  );
};

export default Students;
