/**
 * Attendance Model (server/models/Attendance.js)
 * Tracks daily attendance per student.
 * - Compound unique index ensures one attendance entry per student per day
 * - markedBy references the User/Teacher who took attendance
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required']
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent'],
        message: 'Status must be either Present or Absent'
      },
      default: 'Present',
      required: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound Unique Index: prevents multiple attendance entries for the same student on the same date
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
