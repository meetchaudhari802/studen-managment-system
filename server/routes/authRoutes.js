/**
 * Authentication Routes (server/routes/authRoutes.js)
 * Public endpoints for user registration and login with rate-limiting.
 */

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);

module.exports = router;
