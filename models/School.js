const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: String,
  contactEmail: String,
  contactPhone: String,
  timezone: {
    type: String,
    default: 'UTC'
  }
});

module.exports = mongoose.model('School', SchoolSchema);