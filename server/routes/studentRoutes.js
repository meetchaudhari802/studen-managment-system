/**
 * Student Routes (server/routes/studentRoutes.js)
 * Routes for student CRUD operations, public registration, and student portal.
 */

const express = require('express');
const router = express.Router();
const { protect, protectStudent, validateObjectId, loginLimiter } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/studentController');

// Public routes for students
router.post('/public-register', publicRegisterStudent);
router.get('/public-faculty', getPublicFacultyList);
router.post('/login', loginLimiter, studentLogin);

// Student portal dashboard routes (protected by student token)
router.get('/portal-data', protectStudent, getStudentPortalData);
router.put('/change-password', protectStudent, studentChangePassword);

// Protected routes for faculty & admin
router.route('/')
  .get(protect, getStudents)
  .post(protect, createStudent);

router.route('/:id')
  .get(protect, validateObjectId('id'), getStudentById)
  .put(protect, validateObjectId('id'), updateStudent)
  .delete(protect, validateObjectId('id'), deleteStudent);

module.exports = router;
