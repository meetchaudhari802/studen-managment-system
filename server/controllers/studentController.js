/**
 * Student Controller (server/controllers/studentController.js)
 * Implements Student CRUD, Pagination (10/page), Course/Semester Filtering,
 * Safe Regex Search, Strict Faculty Isolation, and Student Authentication with Hashed Passwords.
 */

const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to escape special regex characters (prevents regex injection / crash on '(', '*', etc.)
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper for strict faculty data isolation
// Faculty A can ONLY see/manage students created by them or assigned to them
const getTeacherFilter = (user) => {
  if (user.role === 'admin') {
    return {};
  }
  return {
    $or: [
      { createdBy: user._id },
      { assignedFaculty: user._id }
    ]
  };
};

// @desc    Get all students visible to current user with pagination, search & filters
// @route   GET /api/students?search=&course=&semester=&page=&limit=
// @access  Private (Faculty & Admin)
const getStudents = async (req, res, next) => {
  try {
    const { search, course, semester, page = 1, limit = 10 } = req.query;
    const baseFilter = getTeacherFilter(req.user);

    const conditions = [];

    // Add faculty isolation condition
    if (Object.keys(baseFilter).length > 0) {
      conditions.push(baseFilter);
    }

    // Course filter
    if (course && course.trim() !== '' && course !== 'ALL') {
      conditions.push({ course: course.trim() });
    }

    // Semester filter
    if (semester && semester.trim() !== '' && semester !== 'ALL') {
      conditions.push({ semester: Number(semester) });
    }

    // Search query with regex escaping
    if (search && search.trim() !== '') {
      const sanitized = escapeRegex(search.trim());
      const regex = new RegExp(sanitized, 'i');
      conditions.push({
        $or: [
          { name: regex },
          { enrollmentNo: regex },
          { course: regex }
        ]
      });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    // Pagination calculations (default 10 per page)
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('assignedFaculty', 'fullName department email')
      .populate('createdBy', 'fullName department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: students.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single student by ID (enforces faculty isolation)
// @route   GET /api/students/:id
// @access  Private (Faculty & Admin)
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      ...getTeacherFilter(req.user)
    })
      .populate('assignedFaculty', 'fullName department email')
      .populate('createdBy', 'fullName department');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or unauthorized access.'
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student by faculty/admin
// @route   POST /api/students
// @access  Private (Faculty & Admin)
const createStudent = async (req, res, next) => {
  try {
    const { enrollmentNo, name, email, mobile, course, semester, address, password } = req.body;

    // Validation
    if (!enrollmentNo || !name || !email || !mobile || !course || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required student details.'
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be exactly 10 digits.'
      });
    }

    // Default documented initial password for faculty-enrolled students
    const initialPassword = password && password.trim().length >= 8 ? password.trim() : 'Student@123';

    // Check duplicate enrollment number
    const existingEnrollment = await Student.findOne({
      enrollmentNo: enrollmentNo.trim().toUpperCase()
    });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: `Student with enrollment number '${enrollmentNo.trim().toUpperCase()}' already exists.`
      });
    }

    // Check duplicate email
    const existingEmail = await Student.findOne({
      email: email.trim().toLowerCase()
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Student with email '${email.trim().toLowerCase()}' already exists.`
      });
    }

    const student = await Student.create({
      enrollmentNo: enrollmentNo.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      password: initialPassword,
      course: course.trim(),
      semester: Number(semester),
      address: address ? address.trim() : '',
      createdBy: req.user._id,
      assignedFaculty: req.user._id,
      registrationType: 'faculty'
    });

    return res.status(201).json({
      success: true,
      message: 'Student enrolled successfully! (Initial password: Student@123)',
      data: {
        _id: student._id,
        enrollmentNo: student.enrollmentNo,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
        course: student.course,
        semester: student.semester,
        address: student.address
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (Faculty & Admin)
const updateStudent = async (req, res, next) => {
  try {
    const { enrollmentNo, name, email, mobile, course, semester, address, assignedFaculty } = req.body;

    const student = await Student.findOne({
      _id: req.params.id,
      ...getTeacherFilter(req.user)
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or unauthorized access.'
      });
    }

    // If enrollment number is changed, check for conflict
    if (enrollmentNo && enrollmentNo.trim().toUpperCase() !== student.enrollmentNo) {
      const conflict = await Student.findOne({
        enrollmentNo: enrollmentNo.trim().toUpperCase(),
        _id: { $ne: student._id }
      });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `Enrollment number '${enrollmentNo.trim().toUpperCase()}' is already in use by another student.`
        });
      }
      student.enrollmentNo = enrollmentNo.trim().toUpperCase();
    }

    if (name) student.name = name.trim();
    if (email) student.email = email.trim().toLowerCase();
    if (mobile) {
      if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be exactly 10 digits.'
        });
      }
      student.mobile = mobile.trim();
    }
    if (course) student.course = course.trim();
    if (semester !== undefined) student.semester = Number(semester);
    if (address !== undefined) student.address = address.trim();
    if (assignedFaculty) student.assignedFaculty = assignedFaculty;

    const updatedStudent = await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully!',
      data: updatedStudent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a student & their attendance history
// @route   DELETE /api/students/:id
// @access  Private (Faculty & Admin)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      ...getTeacherFilter(req.user)
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or unauthorized access.'
      });
    }

    // Delete attendance records associated with this student
    await Attendance.deleteMany({ student: student._id });

    // Delete student record
    await Student.findByIdAndDelete(student._id);

    return res.status(200).json({
      success: true,
      message: 'Student and related attendance records deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public student self-registration with password
// @route   POST /api/students/public-register
// @access  Public
const publicRegisterStudent = async (req, res, next) => {
  try {
    const { enrollmentNo, name, email, mobile, course, semester, address, assignedFaculty, password } = req.body;

    if (!enrollmentNo || !name || !email || !mobile || !course || !semester || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including password.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be exactly 10 digits.'
      });
    }

    // Check duplicate enrollment number
    const existingEnrollment = await Student.findOne({
      enrollmentNo: enrollmentNo.trim().toUpperCase()
    });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: `Enrollment number '${enrollmentNo.trim().toUpperCase()}' is already registered.`
      });
    }

    // Check duplicate email
    const existingEmail = await Student.findOne({
      email: email.trim().toLowerCase()
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Student with email '${email.trim().toLowerCase()}' is already registered.`
      });
    }

    let facultyId = null;
    if (assignedFaculty && assignedFaculty.trim() !== '') {
      const validFaculty = await User.findById(assignedFaculty);
      if (validFaculty) {
        facultyId = validFaculty._id;
      }
    }

    const student = await Student.create({
      enrollmentNo: enrollmentNo.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      password: password.trim(),
      course: course.trim(),
      semester: Number(semester),
      address: address ? address.trim() : '',
      assignedFaculty: facultyId,
      createdBy: facultyId,
      registrationType: 'self'
    });

    return res.status(201).json({
      success: true,
      message: 'Student registration successful! You can now log into the Student Portal.',
      data: {
        _id: student._id,
        enrollmentNo: student.enrollmentNo,
        name: student.name,
        email: student.email,
        course: student.course,
        semester: student.semester
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of faculty for student registration mentor dropdown
// @route   GET /api/students/public-faculty
// @access  Public
const getPublicFacultyList = async (req, res, next) => {
  try {
    const faculty = await User.find({ role: 'faculty' })
      .select('fullName department email')
      .sort({ fullName: 1 });

    return res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student Login using Enrollment No & Password
// @route   POST /api/students/login
// @access  Public
const studentLogin = async (req, res, next) => {
  try {
    const { enrollmentNo, password } = req.body;

    if (!enrollmentNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Enrollment Number and Password.'
      });
    }

    // Select password field explicitly since select: false
    const student = await Student.findOne({
      enrollmentNo: enrollmentNo.trim().toUpperCase()
    })
      .select('+password')
      .populate('assignedFaculty', 'fullName department email mobile')
      .populate('createdBy', 'fullName department email');

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid enrollment number or password.'
      });
    }

    // Compare hashed password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid enrollment number or password.'
      });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: 'student',
        enrollmentNo: student.enrollmentNo
      },
      process.env.JWT_SECRET || 'supersecret_pbl_student_management_token_key_2026',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Student login successful!',
      token,
      student: {
        _id: student._id,
        name: student.name,
        enrollmentNo: student.enrollmentNo,
        email: student.email,
        mobile: student.mobile,
        course: student.course,
        semester: student.semester,
        address: student.address,
        assignedFaculty: student.assignedFaculty || student.createdBy,
        registrationType: student.registrationType,
        createdAt: student.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student Change Password from Student Portal
// @route   PUT /api/students/change-password
// @access  Private (Student token)
const studentChangePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    const student = await Student.findById(req.student._id).select('+password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    const isMatch = await student.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    student.password = newPassword;
    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete student portal dashboard data & attendance history
// @route   GET /api/students/portal-data
// @access  Private (Student token)
const getStudentPortalData = async (req, res, next) => {
  try {
    const student = await Student.findById(req.student._id)
      .populate('assignedFaculty', 'fullName department email mobile')
      .populate('createdBy', 'fullName department email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    // Fetch student's attendance records
    const attendanceRecords = await Attendance.find({ student: student._id })
      .populate('markedBy', 'fullName department')
      .sort({ date: -1 });

    const totalLectures = attendanceRecords.length;
    const totalPresent = attendanceRecords.filter(r => r.status === 'Present').length;
    const totalAbsent = attendanceRecords.filter(r => r.status === 'Absent').length;
    const percentage = totalLectures > 0 ? Number(((totalPresent / totalLectures) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          enrollmentNo: student.enrollmentNo,
          email: student.email,
          mobile: student.mobile,
          course: student.course,
          semester: student.semester,
          address: student.address,
          assignedFaculty: student.assignedFaculty || student.createdBy,
          registrationType: student.registrationType,
          createdAt: student.createdAt
        },
        stats: {
          totalLectures,
          totalPresent,
          totalAbsent,
          percentage,
          eligibilityStatus: percentage >= 75 ? 'Eligible for Exams' : 'Short Attendance Alert (<75%)'
        },
        attendanceRecords
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  publicRegisterStudent,
  getPublicFacultyList,
  studentLogin,
  studentChangePassword,
  getStudentPortalData
};
