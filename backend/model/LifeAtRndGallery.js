const mongoose = require('mongoose');

const lifeAtRndGallerySchema = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LifeAtRndCategory',
        required: true
    },
    image: {
        type: String, // file path
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('LifeAtRndGallery', lifeAtRndGallerySchema);
