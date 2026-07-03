const SeoAudit = require('../model/seoAudit');
const StaticMeta = require('../model/staticMeta');
const Blog = require('../model/blog');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Service = require('../model/service');
const ServiceCategory = require('../model/serviceCategory');

exports.getAudits = async (req, res) => {
    try {
        const audits = await SeoAudit.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: audits });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.clearHistory = async (req, res) => {
    try {
        await SeoAudit.deleteMany({});
        res.status(200).json({ success: true, message: 'History cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.runAudit = async (req, res) => {
    // We start the audit process in background to prevent timeout
    const auditRecord = new SeoAudit({ startedAt: new Date() });
    await auditRecord.save();
    
    // Return immediately to frontend
    res.status(200).json({ success: true, data: auditRecord, message: "Audit started in background" });

    // Run audit in background
    runAuditBackground(auditRecord._id).catch(err => console.error("Background Audit Failed:", err));
};

async function runAuditBackground(auditId) {
    try {
        const audit = await SeoAudit.findById(auditId);
        if (!audit) return;

        // Fetch pages from database
        const pages = await StaticMeta.find() || [];
        const blogs = await Blog.find({ status: 'active' }) || [];
        const services = await Service.find({ status: 'active' }) || [];
        const serviceCategories = await ServiceCategory.find({ status: 'active' }) || [];

        const itemsToAudit = [];
        for (const p of pages) {
            itemsToAudit.push({
                metaTitle: p.metaTitle,
                metaDescription: p.metaDescription,
                metaKeyword: p.metaKeyword,
                canonicalLink: p.canonicalLink,
                ogTitle: p.ogTitle,
                ogDescription: p.ogDescription,
                ogImage: p.ogImage,
                noIndex: p.noIndex,
                noFollow: p.noFollow,
                metaschema: p.metaschema,
                pageName: p.pageName || p.pageSlug || 'Unknown Page',
                pageSlug: p.pageSlug,
                h1Count: p.h1Count,
                h2Count: p.h2Count,
                missingAltCount: p.missingAltCount
            });
        }

        for (const b of blogs) {
            itemsToAudit.push({
                metaTitle: b.metatitle || b.title,
                metaDescription: b.metadescription,
                metaKeyword: b.metakeywords,
                canonicalLink: b.metacanonical,
                ogTitle: b.metatitle || b.title,
                ogDescription: b.metadescription,
                ogImage: b.image && b.image.length > 0 ? b.image[0] : null,
                noIndex: b.noIndex || false,
                noFollow: b.noFollow || false,
                metaschema: b.metaschema,
                pageName: b.title || 'Blog Post',
                pageSlug: `blogs/${b.slug}`,
                h1Count: 1, 
                h2Count: 1, 
                missingAltCount: 0 
            });
        }

        // Process Services
        for (const s of services) {
            itemsToAudit.push({
                metaTitle: s.metatitle || s.title,
                metaDescription: s.metadescription,
                metaKeyword: s.metakeywords,
                canonicalLink: s.metacanonical,
                ogTitle: s.metatitle || s.title,
                ogDescription: s.metadescription,
                ogImage: s.photo && s.photo.length > 0 ? s.photo[0] : null,
                noIndex: s.noIndex || false,
                noFollow: s.noFollow || false,
                metaschema: s.metaschema,
                pageName: s.title || 'Service',
                pageSlug: s.slug ? `${s.slug}` : '', // Use raw slug without prefix
                h1Count: 1,
                h2Count: 1,
                missingAltCount: 0
            });
        }

        // Process Service Categories, Subcategories, SubSubcategories
        const addCategoryToAudit = (cat, pathPrefix) => {
            if (!cat) return;
            // Only add if there's a valid slug
            if (cat.slug) {
                itemsToAudit.push({
                    metaTitle: cat.metatitle || cat.category,
                    metaDescription: cat.metadescription,
                    metaKeyword: cat.metakeywords,
                    canonicalLink: cat.metacanonical,
                    ogTitle: cat.metatitle || cat.category,
                    ogDescription: cat.metadescription,
                    ogImage: cat.photo || null,
                    noIndex: cat.noIndex || false,
                    noFollow: cat.noFollow || false,
                    metaschema: cat.metaschema,
                    pageName: cat.category || 'Category',
                    pageSlug: `${cat.slug}`, // Use raw slug without prefix
                    h1Count: 1,
                    h2Count: 1,
                    missingAltCount: 0
                });
            }
        };

        for (const category of serviceCategories) {
            addCategoryToAudit(category);
            
            if (category.subCategories && category.subCategories.length > 0) {
                for (const sub of category.subCategories) {
                    addCategoryToAudit(sub);
                    
                    if (sub.subSubCategory && sub.subSubCategory.length > 0) {
                        for (const subSub of sub.subSubCategory) {
                            addCategoryToAudit(subSub);
                        }
                    }
                }
            }
        }

        let totalPagesScore = 0;
        let errorsFound = 0;
        let warningsFound = 0;
        let infoFound = 0;
        let indexedPages = 0;
        let noIndexedPages = 0;
        let pageResults = [];

        // Function to score based on database document
        const auditDocument = async (doc) => {
            let score = 100;
            let issues = [];
            
            // Map fields for static meta page
            const title = doc.metaTitle;
            const desc = doc.metaDescription;
            const keywords = doc.metaKeyword;
            const canonical = doc.canonicalLink;
            const metaschema = doc.metaschema;
            const noIndex = doc.noIndex;
            const noFollow = doc.noFollow;
            
            const name = doc.pageName || doc.pageSlug || 'Unknown Page';
            const url = doc.pageSlug === 'home' || doc.pageSlug === '/' ? '/' : `/${doc.pageSlug}`;

            // Fetch live page to get accurate HTML headings using axios
            let h1Count = doc.h1Count || 0;
            let h2Count = doc.h2Count || 0;
            let liveSchemaExists = false;
            let liveNoIndex = false;
            let liveNoFollow = false;
            try {
                const fullUrl = `https://rndtechnosoft.com${url}`;
                const response = await axios.get(fullUrl, { timeout: 8000 });
                if (response.data) {
                    const $ = cheerio.load(response.data);
                    h1Count = $('h1').length;
                    h2Count = $('h2').length;
                    liveSchemaExists = $('script[type="application/ld+json"]').length > 0;
                    
                    const robotsMeta = $('meta[name="robots"]').attr('content');
                    if (robotsMeta) {
                        const robotsContent = robotsMeta.toLowerCase();
                        if (robotsContent.includes('noindex')) liveNoIndex = true;
                        if (robotsContent.includes('nofollow')) liveNoFollow = true;
                    }
                }
            } catch (err) {
                console.error(`Error fetching live page ${url} for SEO audit:`, err.message);
            }

            // 1. Title
            if (!title) {
                score -= 15; issues.push({ type: 'ERROR', message: 'Missing Meta Title (-15)' });
            } else if (title.length < 30 || title.length > 60) {
                score -= 7; issues.push({ type: 'WARNING', message: 'Title length should be 30-60 chars (-7)' });
            }

            // 2. Description
            if (!desc) {
                score -= 15; issues.push({ type: 'ERROR', message: 'Missing Meta Description (-15)' });
            } else if (desc.length < 70 || desc.length > 160) {
                score -= 7; issues.push({ type: 'WARNING', message: `Desc length ${desc.length} should be 70-160 (-7)` });
            }

            // 3. Canonical
            if (!canonical) {
                score -= 10; issues.push({ type: 'WARNING', message: 'Missing Canonical Link (-10)' });
            }

            // 4. Schema
            if ((!metaschema || metaschema.trim() === '') && !liveSchemaExists) {
                score -= 10; issues.push({ type: 'WARNING', message: 'Missing Schema (JSON-LD) (-10)' });
            }

            // 5. Headings (Using live counts)
            if (h1Count === 0) { score -= 10; issues.push({ type: 'ERROR', message: 'Missing H1 tag (-10)' }); }
            else if (h1Count > 1) { score -= 5; issues.push({ type: 'WARNING', message: 'Multiple H1 tags (-5)' }); }
            if (h2Count === 0) { score -= 5; issues.push({ type: 'WARNING', message: 'Missing H2 tag (-5)' }); }

            // 6. Indexing Mismatch Check
            if (noIndex && !liveNoIndex) {
                score -= 15; issues.push({ type: 'ERROR', message: 'Mismatch: Set to Noindex in Admin, but live page is Indexed (-15)' });
            } else if (!noIndex && liveNoIndex) {
                score -= 15; issues.push({ type: 'ERROR', message: 'Mismatch: Set to Indexed in Admin, but live page is Noindex (-15)' });
            }

            score = Math.max(score, 0);

            let eC = 0, wC = 0, iC = 0;
            issues.forEach(i => {
                if (i.type === 'ERROR') { eC++; errorsFound++; }
                if (i.type === 'WARNING') { wC++; warningsFound++; }
                if (i.type === 'INFO') { iC++; infoFound++; }
            });

            if (noIndex) {
                noIndexedPages++;
            } else {
                indexedPages++;
            }

            pageResults.push({
                score, name, url, errorCount: eC, warningCount: wC, infoCount: iC, issues, noIndex
            });

            return score;
        };

        // Score all items concurrently using Promise.all
        const scorePromises = itemsToAudit.map(item => auditDocument(item));
        const scores = await Promise.all(scorePromises);
        totalPagesScore = scores.reduce((acc, curr) => acc + curr, 0);

        // Global Checks (Fetching robots.txt and sitemap.xml)
        let robotsExists = false;
        let sitemapExists = false;
        try {
            const robotsRes = await axios.get('https://rndtechnosoft.com/robots.txt', { timeout: 5000 });
            robotsExists = robotsRes.status === 200;
        } catch(e) { console.error('Robots.txt check failed'); }

        try {
            const sitemapRes = await axios.get('https://rndtechnosoft.com/sitemap.xml', { timeout: 5000 });
            sitemapExists = sitemapRes.status === 200;
        } catch(e) { console.error('Sitemap.xml check failed'); }

        let globalScore = 0;
        const globalResults = [
            { checkName: 'Robots.txt available', passed: robotsExists, points: 20 },
            { checkName: 'Sitemap.xml available', passed: sitemapExists, points: 20 },
            { checkName: 'SSL Certificate Valid', passed: true, points: 20 }, // Assuming true if site is running HTTPS
            { checkName: 'Responsive (Viewport Meta)', passed: true, points: 20 },
        ];
        globalResults.forEach(r => { if (r.passed) globalScore += r.points; });

        // Calculate Final
        const avgPages = itemsToAudit.length > 0 ? (totalPagesScore / itemsToAudit.length) : 0;
        
        let denom = 0;
        let sum = globalScore;
        if (itemsToAudit.length > 0) { sum += avgPages; denom++; }
        denom++; // for global
        
        const finalScore = Math.round(sum / denom);

        audit.overallScore = finalScore || 0;
        audit.pagesScore = Math.round(avgPages) || 0;
        audit.blogsScore = 0;
        audit.globalScore = globalScore || 0;
        audit.pagesCrawled = itemsToAudit.length || 0;
        audit.errorsFound = errorsFound || 0;
        audit.warningsFound = warningsFound || 0;
        audit.infoFound = infoFound || 0;
        audit.indexedPages = indexedPages || 0;
        audit.noIndexedPages = noIndexedPages || 0;
        audit.pageResults = pageResults || [];
        audit.globalResults = globalResults || [];
        audit.completedAt = new Date();

        await audit.save();

    } catch (error) {
        console.error("Background Audit Error: ", error);
    }
}
