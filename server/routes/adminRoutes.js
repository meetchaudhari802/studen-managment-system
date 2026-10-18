/**
 * Admin Routes (server/routes/adminRoutes.js)
 * Endpoints for high-level administration, faculty supervision,
 * and master student directory oversight.
 */

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAdminStats,
  getFacultyList,
  deleteFaculty,
  getAllStudents,
  deleteStudentAdmin
} = require('../controllers/adminController');

// All admin routes require valid JWT token and admin role
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/faculty', getFacultyList);
router.delete('/faculty/:id', deleteFaculty);
router.get('/students', getAllStudents);
router.delete('/students/:id', deleteStudentAdmin);

module.exports = router;
