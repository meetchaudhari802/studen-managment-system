/**
 * Authentication Controller (server/controllers/authController.js)
 * Handles user registration and login with JWT token issuance.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate signed JWT token
const generateToken = (userId, role = 'faculty') => {
  return jwt.sign(
    { id: userId, role: role || 'faculty' },
    process.env.JWT_SECRET || 'supersecret_pbl_student_management_token_key_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user / teacher
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, mobile, department, password, confirmPassword } = req.body;

    // Validate presence of fields
    if (!fullName || !email || !mobile || !department || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    // Check passwords match if confirmPassword was passed
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Validate 10-digit mobile number
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be exactly 10 digits.'
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.'
      });
    }

    // Create user (password is automatically hashed via pre-save hook)
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      department: department.trim(),
      password
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login with your credentials.',
      token: generateToken(newUser._id),
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role || 'faculty'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get JWT token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found with this email.'
      });
    }

    // Verify password match using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.role || 'faculty');

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        department: user.department,
        role: user.role || 'faculty'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser };
