const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema(
  {
    policyType: {
      type: String,
      required: true,
      enum: ['cookies', 'terms', 'privacy'],
      index: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', PolicySchema);

