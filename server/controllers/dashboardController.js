/**
 * Dashboard Controller (server/controllers/dashboardController.js)
 * Computes summary analytics, course breakdowns, and today's attendance metrics.
 * Incorporates both faculty-enrolled and self-registered students.
 */

const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/dashboard/stats
// @access  Private (JWT protected)
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Faculty filter: sees students created by them, assigned to them, or self-registered
    const facultyFilter = req.user.role === 'admin'
      ? {}
      : {
          $or: [
            { createdBy: userId },
            { assignedFaculty: userId },
            { registrationType: 'self' },
            { createdBy: null }
          ]
        };

    // 1. Total students count
    const totalStudents = await Student.countDocuments(facultyFilter);

    // 2. Students breakdown per course
    const courseAggregation = await Student.aggregate([
      { $match: facultyFilter },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const courseBreakdown = courseAggregation.map(item => ({
      course: item._id,
      count: item.count
    }));

    // 3. Today's attendance summary
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const visibleStudents = await Student.find(facultyFilter).select('_id');
    const studentIds = visibleStudents.map(s => s._id);

    const todayRecords = await Attendance.find({
      student: { $in: studentIds },
      date: today
    });

    const todayPresent = todayRecords.filter(r => r.status === 'Present').length;
    const todayAbsent = todayRecords.filter(r => r.status === 'Absent').length;
    const totalMarked = todayPresent + todayAbsent;
    const todayUnmarked = Math.max(0, totalStudents - totalMarked);

    // 4. Overall cumulative attendance percentage for these students
    const allRecords = await Attendance.find({ student: { $in: studentIds } });
    const allTotal = allRecords.length;
    const allPresent = allRecords.filter(r => r.status === 'Present').length;
    const overallPercentage = allTotal > 0 ? Number(((allPresent / allTotal) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        courseBreakdown,
        todayAttendance: {
          date: today.toISOString().split('T')[0],
          present: todayPresent,
          absent: todayAbsent,
          unmarked: todayUnmarked,
          totalMarked
        },
        overallPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
