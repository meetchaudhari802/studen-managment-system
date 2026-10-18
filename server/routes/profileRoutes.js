/**
 * Profile Routes (server/routes/profileRoutes.js)
 * Protected routes for getting and updating current user profile.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');

router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile);

module.exports = router;
