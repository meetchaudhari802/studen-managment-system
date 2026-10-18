/**
 * Attendance Controller (server/controllers/attendanceController.js)
 * Handles marking attendance and retrieving student attendance records & statistics.
 * Rejects future attendance dates and enforces strict faculty data isolation.
 */

const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Helper to normalize dates to midnight UTC to prevent time-shift conflicts
const normalizeDate = (inputDate) => {
  const d = inputDate ? new Date(inputDate) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// @desc    Mark or update attendance for a student on a given date
// @route   POST /api/attendance
// @access  Private (JWT protected)
const markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, status } = req.body;

    if (!studentId || !status) {
      return res.status(400).json({
        success: false,
        message: 'studentId and status (Present/Absent) are required.'
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Present or Absent.'
      });
    }

    const attendanceDate = normalizeDate(date);
    const today = normalizeDate(new Date());

    // Future attendance date validation
    if (attendanceDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Attendance date cannot be in the future.'
      });
    }

    // Verify student belongs to logged-in teacher (or admin)
    let studentFilter = { _id: studentId };
    if (req.user.role !== 'admin') {
      studentFilter.$or = [
        { createdBy: req.user._id },
        { assignedFaculty: req.user._id }
      ];
    }
    const student = await Student.findOne(studentFilter);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or unauthorized.'
      });
    }

    // Upsert attendance record for this student on this date
    const record = await Attendance.findOneAndUpdate(
      { student: studentId, date: attendanceDate },
      {
        status,
        markedBy: req.user._id
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: `Attendance marked as ${status} for ${student.name}.`,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history and percentage for a student
// @route   GET /api/attendance/:studentId
// @access  Private (JWT protected)
const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Check student existence & ownership
    let studentFilter = { _id: studentId };
    if (req.user.role !== 'admin') {
      studentFilter.$or = [
        { createdBy: req.user._id },
        { assignedFaculty: req.user._id }
      ];
    }
    const student = await Student.findOne(studentFilter);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or unauthorized.'
      });
    }

    // Fetch all attendance records sorted by date descending
    const records = await Attendance.find({ student: studentId }).sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent = total - present;
    const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          enrollmentNo: student.enrollmentNo,
          course: student.course
        },
        stats: {
          total,
          present,
          absent,
          percentage
        },
        records
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance
};
