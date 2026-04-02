const mongoose = require('mongoose');

const lifeAtRndCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    priority: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('LifeAtRndCategory', lifeAtRndCategorySchema);
