const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String, required: true },
    organisation: { type: String },
    country: { type: String },
    phone: { type: String },
    address: { type: String },
    url: { type: String, default: 'Manual Entry' },
    email: { type: String, required: true },
    department: { type: String }, // For backward compatibility
    service: { type: String, default: '' },
    post: { type: String, default: '' },
    message: { type: String, },
    status: { type: String, default: 'New Inquiry' },
    source: { type: String, default: '' },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('inquiry', contactSchema);
