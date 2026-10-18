/**
 * Admin Controller (server/controllers/adminController.js)
 * Provides system-wide administration, faculty management,
 * and master student directory oversight.
 */

const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// @desc    Get system-wide metrics and analytics
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
const getAdminStats = async (req, res, next) => {
  try {
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalStudents = await Student.countDocuments();
    const totalAttendance = await Attendance.countDocuments();

    // Department breakdown of faculty and students
    const facultyPerDept = await User.aggregate([
      { $match: { role: 'faculty' } },
      { $group: { _id: '$department', facultyCount: { $sum: 1 } } }
    ]);

    const studentsPerDept = await Student.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'faculty'
        }
      },
      { $unwind: '$faculty' },
      { $group: { _id: '$faculty.department', studentCount: { $sum: 1 } } }
    ]);

    // Course distribution across entire college
    const courseDistribution = await Student.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Calculate system-wide attendance rate
    const totalPresent = await Attendance.countDocuments({ status: 'Present' });
    const overallRate = totalAttendance > 0
      ? Number(((totalPresent / totalAttendance) * 100).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalFaculty,
        totalStudents,
        totalAttendance,
        overallRate,
        courseDistribution: courseDistribution.map(c => ({ course: c._id, count: c.count })),
        facultyPerDept: facultyPerDept.map(f => ({ department: f._id, count: f.facultyCount })),
        studentsPerDept: studentsPerDept.map(s => ({ department: s._id, count: s.studentCount }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered faculty accounts with their student counts
// @route   GET /api/admin/faculty
// @access  Private (Admin Only)
const getFacultyList = async (req, res, next) => {
  try {
    const facultyMembers = await User.find({ role: 'faculty' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach student count for each faculty
    const facultyWithCounts = await Promise.all(
      facultyMembers.map(async (faculty) => {
        const studentCount = await Student.countDocuments({ createdBy: faculty._id });
        return {
          id: faculty._id,
          fullName: faculty.fullName,
          email: faculty.email,
          mobile: faculty.mobile,
          department: faculty.department,
          studentCount,
          createdAt: faculty.createdAt
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: facultyWithCounts.length,
      data: facultyWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a faculty account and all their associated students & attendance
// @route   DELETE /api/admin/faculty/:id
// @access  Private (Admin Only)
const deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await User.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found.'
      });
    }

    if (faculty.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Administrator accounts cannot be deleted.'
      });
    }

    // Cascade delete: find students belonging to this faculty
    const facultyStudents = await Student.find({ createdBy: faculty._id });
    const studentIds = facultyStudents.map(s => s._id);

    // Delete attendance records
    await Attendance.deleteMany({
      $or: [
        { markedBy: faculty._id },
        { student: { $in: studentIds } }
      ]
    });

    // Delete students
    await Student.deleteMany({ createdBy: faculty._id });

    // Delete user
    await User.findByIdAndDelete(faculty._id);

    return res.status(200).json({
      success: true,
      message: `Faculty ${faculty.fullName} and all their ${facultyStudents.length} student records were removed.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get master list of all college students across all faculties
// @route   GET /api/admin/students?search=
// @access  Private (Admin Only)
const getAllStudents = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { enrollmentNo: regex },
        { course: regex }
      ];
    }

    const students = await Student.find(query)
      .populate('createdBy', 'fullName department email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any student as Administrator
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin Only)
const deleteStudentAdmin = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    // Delete attendance
    await Attendance.deleteMany({ student: student._id });
    // Delete student
    await Student.findByIdAndDelete(student._id);

    return res.status(200).json({
      success: true,
      message: `Student ${student.name} (${student.enrollmentNo}) deleted successfully by Administrator.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getFacultyList,
  deleteFaculty,
  getAllStudents,
  deleteStudentAdmin
};
