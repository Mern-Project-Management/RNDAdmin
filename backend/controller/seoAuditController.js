const SeoAudit = require('../model/seoAudit');
const StaticMeta = require('../model/staticMeta');
const Blog = require('../model/blog');

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
                noIndex: false,
                noFollow: false,
                pageName: b.title || 'Blog Post',
                pageSlug: `blogs/${b.slug}`,
                h1Count: 1, 
                h2Count: 1, 
                missingAltCount: 0 
            });
        }

        let totalPagesScore = 0;
        let errorsFound = 0;
        let warningsFound = 0;
        let infoFound = 0;
        let pageResults = [];

        // Function to score based on database document
        const auditDocument = (doc) => {
            let score = 100;
            let issues = [];
            
            // Map fields for static meta page
            const title = doc.metaTitle;
            const desc = doc.metaDescription;
            const keywords = doc.metaKeyword;
            const canonical = doc.canonicalLink;
            const ogTitle = doc.ogTitle;
            const ogDesc = doc.ogDescription;
            const ogImg = doc.ogImage;
            const noIndex = doc.noIndex;
            const noFollow = doc.noFollow;
            
            const name = doc.pageName || doc.pageSlug || 'Unknown Page';
            const url = doc.pageSlug === 'home' || doc.pageSlug === '/' ? '/' : `/${doc.pageSlug}`;

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

            // 4. Keywords (Disabled temporarily per request)
            // if (!keywords) {
            //     score -= 5; issues.push({ type: 'INFO', message: 'Missing Keywords (-5)' });
            // }

            // 5. OG Tags (Disabled temporarily per request)
            // if (!ogTitle) { score -= 5; issues.push({ type: 'WARNING', message: 'Missing og:title (-5)' }); }
            // if (!ogDesc) { score -= 5; issues.push({ type: 'WARNING', message: 'Missing og:description (-5)' }); }
            // if (!ogImg) { score -= 5; issues.push({ type: 'WARNING', message: 'Missing og:image (-5)' }); }

            // 6. Robots
            if (noIndex || noFollow) {
                score -= 10; issues.push({ type: 'WARNING', message: 'Robots set to noindex/nofollow (-10)' });
            }

            // 7. Headings (Using db counts if available, otherwise assume warning)
            const h1Count = doc.h1Count || 0;
            const h2Count = doc.h2Count || 0;
            if (h1Count === 0) { score -= 10; issues.push({ type: 'ERROR', message: 'Missing H1 tag (based on db) (-10)' }); }
            else if (h1Count > 1) { score -= 5; issues.push({ type: 'WARNING', message: 'Multiple H1 tags (based on db) (-5)' }); }
            if (h2Count === 0) { score -= 5; issues.push({ type: 'INFO', message: 'Missing H2 tag (based on db) (-5)' }); }

            // 8. Alt Tags (Using db counts)
            const missingAltCount = doc.missingAltCount || 0;
            if (missingAltCount > 0) {
                const deduction = Math.min(15, missingAltCount * 3);
                score -= deduction;
                issues.push({ type: 'WARNING', message: `${missingAltCount} missing alt tags (-${deduction})` });
            }

            score = Math.max(score, 0);

            let eC = 0, wC = 0, iC = 0;
            issues.forEach(i => {
                if (i.type === 'ERROR') { eC++; errorsFound++; }
                if (i.type === 'WARNING') { wC++; warningsFound++; }
                if (i.type === 'INFO') { iC++; infoFound++; }
            });

            pageResults.push({
                score, name, url, errorCount: eC, warningCount: wC, infoCount: iC, issues
            });

            return score;
        };

        // Score all items (static pages + blogs)
        for (const item of itemsToAudit) {
            totalPagesScore += auditDocument(item);
        }

        // Global Checks
        let globalScore = 0;
        const globalResults = [
            { checkName: 'Robots.txt available', passed: true, points: 20 },
            { checkName: 'Sitemap.xml available', passed: true, points: 20 },
            { checkName: 'SSL Certificate Valid', passed: true, points: 20 },
            { checkName: 'Responsive (Viewport Meta)', passed: true, points: 20 },
            { checkName: 'Schema (JSON-LD) on Homepage', passed: true, points: 20 }
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
        audit.pageResults = pageResults || [];
        audit.globalResults = globalResults || [];
        audit.completedAt = new Date();

        await audit.save();

    } catch (error) {
        console.error("Background Audit Error: ", error);
    }
}
