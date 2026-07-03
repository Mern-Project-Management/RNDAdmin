const mongoose = require('mongoose');

const SeoAuditSchema = new mongoose.Schema({
    overallScore: { type: Number, default: 0 },
    pagesScore: { type: Number, default: 0 },
    blogsScore: { type: Number, default: 0 },
    globalScore: { type: Number, default: 0 },
    
    pagesCrawled: { type: Number, default: 0 },
    errorsFound: { type: Number, default: 0 },
    warningsFound: { type: Number, default: 0 },
    infoFound: { type: Number, default: 0 },
    indexedPages: { type: Number, default: 0 },
    noIndexedPages: { type: Number, default: 0 },
    
    startedAt: { type: Date },
    completedAt: { type: Date },

    pageResults: [{
        score: { type: Number },
        name: { type: String },
        url: { type: String },
        errorCount: { type: Number, default: 0 },
        warningCount: { type: Number, default: 0 },
        infoCount: { type: Number, default: 0 },
        noIndex: { type: Boolean, default: false },
        issues: [{
            type: { type: String, enum: ['ERROR', 'WARNING', 'INFO'] },
            message: { type: String }
        }]
    }],

    globalResults: [{
        checkName: { type: String },
        passed: { type: Boolean },
        points: { type: Number }
    }]
}, { timestamps: true });

module.exports = mongoose.model('SeoAudit', SeoAuditSchema);
