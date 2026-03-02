const mongoose = require('mongoose');

const pageHeadingSchema = new mongoose.Schema({
  pageType: {
    type: String,
    required: true,
    unique: true
  },
  heading: {
    type: String,
    default: ''
  },
  subheading: {
    type: String,
    default: ''
  },
  photo: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  imgTitle: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('PageHeading', pageHeadingSchema);