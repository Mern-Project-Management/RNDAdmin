const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  url: { type: String, required: true },
  contactNo: { type: String, required: true },
  postAppliedFor: { type: String, required: true },
  resumeFile: { type: String, required: true }
}, {
  timestamps: true,
  collection: 'careerapplications'
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);

