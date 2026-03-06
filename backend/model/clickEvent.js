// models/ClickEvent.js
const mongoose = require('mongoose');

const clickEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true
  },
  userId: String,
  sessionId: String,
  page: String,
  buttonName: String,
  productId: String,
  productName: String,

  timestamp: {
    type: Date,
    default: Date.now
  },
  repetitionCount: {
    type: Number,
    default: 1
  },
  userAgent: String,
  ipAddress: String,
  referrer: String,
  metadata: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('ClickEvent', clickEventSchema);