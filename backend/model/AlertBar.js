const mongoose = require('mongoose');

const AlertBarSchema = new mongoose.Schema({
    text: { type: String, default: "Our website is currently under construction. Please check back later." },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    link: { type: String, default: "#" },
    linkText: { type: String, default: "Know More" }
}, { timestamps: true });

module.exports = mongoose.model('AlertBar', AlertBarSchema);
