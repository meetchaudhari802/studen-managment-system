/**
 * Student Model (server/models/Student.js)
 * Represents a student enrolled under a teacher/user or self-registered.
 * - enrollmentNo is indexed and unique
 * - password is encrypted using bcryptjs with select: false for security
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    enrollmentNo: {
      type: String,
      required: [true, 'Enrollment number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    mobile: {
      type: String,
      required: [true, 'Student mobile number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits']
    },
    password: {
      type: String,
      required: [true, 'Student password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8']
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    registrationType: {
      type: String,
      enum: ['self', 'faculty'],
      default: 'faculty'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Hash student password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for fast search across enrollmentNo, name, and course
studentSchema.index({ name: 'text', enrollmentNo: 'text', course: 'text' });

module.exports = mongoose.model('Student', studentSchema);
