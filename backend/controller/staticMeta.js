const Meta = require('../model/staticMeta');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Create a new meta
exports.createMeta = async (req, res) => {
    try {
        const { pageName, metaTitle, pageSlug, metaDescription, metaKeyword, canonicalLink, faqSchema, ogTitle, ogDescription, ogImage, ogType, twitterCard, noIndex, noFollow, structuredData } = req.body;
        const newMeta = new Meta({ pageName, metaTitle, metaDescription, metaKeyword, pageSlug, canonicalLink, faqSchema, ogTitle, ogDescription, ogImage, ogType, twitterCard, noIndex, noFollow, structuredData });
        await newMeta.save();
        res.status(201).json({ success: true, data: newMeta });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all metas
exports.getAllMetas = async (req, res) => {
    try {
        const metas = await Meta.find();
        res.status(200).json({ success: true, data: metas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get meta by pageSlug
exports.getMetaBySlug = async (req, res) => {
    try {
        const meta = await Meta.findOne({ pageSlug: req.params.slug });
        if (!meta) {
            return res.status(404).json({ success: false, message: 'Meta not found for this slug' });
        }
        res.status(200).json({ success: true, data: meta });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single meta by ID
exports.getMetaById = async (req, res) => {
    try {
        const meta = await Meta.findById(req.params.id);
        if (!meta) {
            return res.status(404).json({ success: false, message: 'Meta not found' });
        }
        res.status(200).json({ success: true, data: meta });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a meta by ID
exports.updateMeta = async (req, res) => {
    try {
        const { pageName, metaTitle, metaDescription, pageSlug, metaKeyword, canonicalLink, faqSchema, ogTitle, ogDescription, ogImage, ogType, twitterCard, noIndex, noFollow, structuredData } = req.body;
        const updatedMeta = await Meta.findByIdAndUpdate(
            req.params.id,
            { pageName, metaTitle, metaDescription, metaKeyword, pageSlug, canonicalLink, faqSchema, ogTitle, ogDescription, ogImage, ogType, twitterCard, noIndex, noFollow, structuredData },
            { new: true, runValidators: true }
        );
        if (!updatedMeta) {
            return res.status(404).json({ success: false, message: 'Meta not found' });
        }
        res.status(200).json({ success: true, data: updatedMeta });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a meta by ID
exports.deleteMeta = async (req, res) => {
    try {
        const deletedMeta = await Meta.findByIdAndDelete(req.params.id);
        if (!deletedMeta) {
            return res.status(404).json({ success: false, message: 'Meta not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Audit page for SEO (H1, H2, missing Alts)
exports.auditMeta = async (req, res) => {
    try {
        const meta = await Meta.findById(req.params.id);
        if (!meta) {
            return res.status(404).json({ success: false, message: 'Meta not found' });
        }

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        let pageUrl = baseUrl;
        
        // Handle slug
        if (meta.pageSlug && meta.pageSlug !== '/' && meta.pageSlug.toLowerCase() !== 'home') {
            pageUrl = `${baseUrl}${meta.pageSlug.startsWith('/') ? '' : '/'}${meta.pageSlug}`;
        }

        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Wait until network is idle so Next.js hydrates and images load
        await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const html = await page.content();
        await browser.close();

        const $ = cheerio.load(html);

        const h1Count = $('h1').length;
        const h2Count = $('h2').length;
        
        let missingAltCount = 0;
        $('img').each((i, el) => {
            const alt = $(el).attr('alt');
            // If alt is missing entirely or explicitly empty (though empty alt="" is fine for decorative, the user deduction logic is simple: without an alt tag)
            if (alt === undefined) {
                missingAltCount++;
            }
        });

        meta.h1Count = h1Count;
        meta.h2Count = h2Count;
        meta.missingAltCount = missingAltCount;
        meta.lastAudited = new Date();
        
        await meta.save();

        res.status(200).json({ success: true, data: meta });
    } catch (error) {
        console.error("Audit error: ", error);
        res.status(500).json({ success: false, message: error.message });
    }
};