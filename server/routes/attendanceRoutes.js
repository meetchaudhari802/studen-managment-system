/**
 * Attendance Routes (server/routes/attendanceRoutes.js)
 * Endpoints for marking and reviewing attendance records with ObjectId validation.
 */

const express = require('express');
const router = express.Router();
const { protect, validateObjectId } = require('../middleware/authMiddleware');
const { markAttendance, getStudentAttendance } = require('../controllers/attendanceController');

router.post('/', protect, markAttendance);
router.get('/:studentId', protect, validateObjectId('studentId'), getStudentAttendance);

module.exports = router;
