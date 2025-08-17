const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'early'],
    default: 'present'
  },
  source: {
    type: String,
    enum: ['push', 'pull'],
    required: true
  },
  zkUid: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);