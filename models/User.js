const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    ref: 'School',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'staff', 'admin'],
    default: 'staff'
  },
  zkUid: {
    type: Number,
    unique: true,
    sparse: true // Allows null for non-device users
  },
  cardNumber: String,
  privileges: {
    type: Number,
    default: 0
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  lastLogin: Date
}, { timestamps: true });

// Prevent password and tokens from being returned
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

module.exports = mongoose.model('User', UserSchema);