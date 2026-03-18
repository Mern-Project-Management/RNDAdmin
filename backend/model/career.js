const mongoose = require('mongoose');

const CareerApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    careerTitle: {
      type: String,
      required: [true, 'Career title is required'],
      trim: true
    },
    post: {
      type: String,
      trim: true,
      default: ''
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please enter a valid URL'
      }
    },
    resumeUrl: {
      type: String,
      // Change to optional for existing docs that might not have it yet, 
      // but form will require it.
      required: false 
    },
    resumeName: {
      type: String,
      required: false
    },
    projectDetails: {
      type: String,
      default: '',
      trim: true
    },
    coverLetter: {
      type: String,
      default: '',
      trim: true
    },
    address: { type: String, default: 'Not Provided' },
    url: { type: String, default: 'Website' },
    contactNo: { type: String },
    postAppliedFor: { type: String },
    resumeFile: { type: String },
    isRead: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending'
    }
  },
  { 
    timestamps: true,
    collection: 'careerapplications'
  }
);

// Indexes
CareerApplicationSchema.index({ email: 1 });
CareerApplicationSchema.index({ careerTitle: 1 });
CareerApplicationSchema.index({ status: 1 });
CareerApplicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('JobApplication', CareerApplicationSchema);

