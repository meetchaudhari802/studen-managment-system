/**
 * Dashboard Routes (server/routes/dashboardRoutes.js)
 * Protected routes for dashboard summary analytics.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

router.get('/stats', protect, getDashboardStats);

module.exports = router;
