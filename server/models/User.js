/**
 * User Model (server/models/User.js)
 * Represents teachers/administrators managing students.
 * - Stores hashed passwords using bcryptjs
 * - Automatically checks password validity using comparePassword()
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    mobile: {
      type: String,
      required: [true, '10-digit mobile number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long']
    },
    role: {
      type: String,
      enum: ['faculty', 'admin'],
      default: 'faculty'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare input password with stored hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
