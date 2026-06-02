const mongoose = require('mongoose');

const GlobalSettingsSchema = new mongoose.Schema({
    // Integrations -> Site Identity
    siteName: { type: String, default: '' },
    siteUrl: { type: String, default: '' },
    defaultOgImage: { type: String, default: '' },
    
    // Integrations -> Analytics & Tracking
    googleAnalyticsId: { type: String, default: '' },
    searchConsoleVerification: { type: String, default: '' },
    
    // Integrations -> Social Media Profiles
    socialLinks: [{
        name: { type: String, default: '' },
        url: { type: String, default: '' },
        iconUrl: { type: String, default: '' }
    }],

    // Local SEO -> Business Information
    businessName: { type: String, default: '' },
    businessPhone: { type: String, default: '' },
    businessEmail: { type: String, default: '' },
    
    // Local SEO -> Locations
    locations: [{
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        hours: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        zip: { type: String, default: '' }
    }],

    // Robots.txt
    robotsTxt: { type: String, default: '' },

    // LLM.txt
    llmTxt: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);
