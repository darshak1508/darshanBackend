const mongoose = require('mongoose');

const otpSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  UserID: {
    type: Number,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  collection: 'OtpSessions',
  timestamps: false
});

module.exports = mongoose.model('OtpSession', otpSessionSchema);
