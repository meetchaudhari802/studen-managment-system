/**
 * Profile Controller (server/controllers/profileController.js)
 * Manages teacher profile details and optional password changes.
 */

const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private (JWT protected)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & optional password update
// @route   PUT /api/profile
// @access  Private (JWT protected)
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, mobile, department, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    // Update basic profile fields if provided
    if (fullName) user.fullName = fullName.trim();
    if (mobile) {
      if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be exactly 10 digits.'
        });
      }
      user.mobile = mobile.trim();
    }
    if (department) user.department = department.trim();

    // Handle optional password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.'
        });
      }

      const isCurrentValid = await user.comparePassword(currentPassword);
      if (!isCurrentValid) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password provided.'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long.'
        });
      }

      user.password = newPassword; // Will be hashed by pre-save hook
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        department: updatedUser.department,
        role: updatedUser.role || 'faculty',
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
