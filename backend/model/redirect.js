const mongoose = require('mongoose');

const RedirectSchema = new mongoose.Schema({
    sourceUrl: { type: String, required: true },
    targetUrl: { type: String, required: true },
    statusCode: { type: Number, default: 301 },
    isActive: { type: Boolean, default: true },
    hits: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Redirect', RedirectSchema);
