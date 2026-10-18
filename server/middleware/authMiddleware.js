/**
 * JWT Authentication & RBAC Middleware (server/middleware/authMiddleware.js)
 * Protects endpoints and strictly enforces role boundaries:
 * - Admin, Faculty, and Student roles
 * - Student tokens receive 403 on faculty/admin routes
 * - Faculty tokens receive 403 on student portal data
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Student = require('../models/Student');

// Protect faculty & admin routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_pbl_student_management_token_key_2026');

      // Student token must get 403 Forbidden on faculty/admin routes
      if (decoded.role === 'student') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: student token cannot access faculty/admin endpoints.'
        });
      }

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token.'
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Access denied. No authorization token provided.'
  });
};

// Admin role check middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrator privileges required.'
  });
};

// Protect student portal routes
const protectStudent = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_pbl_student_management_token_key_2026');

      // Faculty or Admin token must get 403 on student portal data
      if (decoded.role !== 'student') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: student portal data is for students only.'
        });
      }

      const student = await Student.findById(decoded.id);
      if (!student) {
        return res.status(401).json({
          success: false,
          message: 'Student record no longer exists.'
        });
      }
      req.student = student;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token.'
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Access denied. Please login to your student portal.'
  });
};

// Validate Mongoose ObjectId format in route params (returns 400 on invalid format)
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: '${id}' is not a valid ObjectId.`
    });
  }
  next();
};

// Rate limiter for authentication endpoints (anti-brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

module.exports = {
  protect,
  adminOnly,
  protectStudent,
  validateObjectId,
  loginLimiter
};
