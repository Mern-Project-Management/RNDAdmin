const mongoose = require('mongoose');

const ThankYouSchema = new mongoose.Schema({
  photo: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  btnTitle: {
    type: String,
    default: ''
  },
  btnLink: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('ThankYou', ThankYouSchema);
