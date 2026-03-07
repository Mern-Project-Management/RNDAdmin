const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String },
    phone: { type: String },
    url: { type: String, default: 'Manual Entry' },
    email: { type: String, required: true },
    message: { type: String, },
    status: { type: String, default: '' },
    source: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('inquiry', contactSchema);
