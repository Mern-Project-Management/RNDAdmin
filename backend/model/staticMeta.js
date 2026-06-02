const mongoose = require('mongoose');

const MetaSchema = new mongoose.Schema({
    pageName: { type: String },
    pageSlug: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeyword: { type: String },
    canonicalLink: { type: String },
    faqSchema: { type: String },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    ogType: { type: String },
    twitterCard: { type: String },
    noIndex: { type: Boolean, default: false },
    noFollow: { type: Boolean, default: false },
    structuredData: { type: String },
    h1Count: { type: Number, default: 0 },
    h2Count: { type: Number, default: 0 },
    missingAltCount: { type: Number, default: 0 },
    lastAudited: { type: Date }
});

module.exports = mongoose.model('Meta', MetaSchema);
