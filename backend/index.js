const express = require('express');
const fs = require('fs');
const path = require('path');
const admin = require("./route/admin");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const sharp = require('sharp');
const compression = require('compression');
const app = express();
require('dotenv').config();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const { generateAllSitemaps } = require('./route/sitemap');

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(compression({ threshold: 1024 }));

// Custom image optimization route
app.get('/images/:filename', async (req, res) => {
  const { filename } = req.params;
  const { w = 1200, q = 80, device = 'desktop' } = req.query;
  
  let imagePath = path.join(__dirname, 'uploads', 'images', filename);

  // Fallback chain for different directory naming conventions
  if (!fs.existsSync(imagePath)) {
    // Check singular 'image' directory
    const singularPath = path.join(__dirname, 'uploads', 'image', filename);
    if (fs.existsSync(singularPath)) {
      imagePath = singularPath;
    } else {
      // Check nested 'images/images' directory
      const nestedPath = path.join(__dirname, 'uploads', 'images', 'images', filename);
      if (fs.existsSync(nestedPath)) {
        imagePath = nestedPath;
      } else {
        // Check legacy root 'uploads' (not recommended but for safety)
        const rootPath = path.join(__dirname, 'uploads', filename);
        if (fs.existsSync(rootPath)) {
          imagePath = rootPath;
        }
      }
    }
  }

  try {
    if (!fs.existsSync(imagePath)) return res.status(404).send('Image not found');

    const ua = req.headers['user-agent'] || '';
    let targetWidth = parseInt(w, 10);
    if (ua.includes('Mobile') || device === 'mobile') {
      targetWidth = Math.min(targetWidth, 600);
    }

    const optimizedImage = await sharp(imagePath)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: parseInt(q, 10) })
      .toBuffer();

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.type('image/webp').send(optimizedImage);
  } catch (err) {
    console.error('Image processing error:', err);
    res.status(500).send('Image processing failed');
  }
});

// Static file serving
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  },
}));

// API Routes with caching
const apiRoutes = [
  ['/api/thank-you', require('./route/thankYou')],
  ['/api/admin', admin],
  ['/api/supplier', require('./route/supplier')],
  ['/api/services', require('./routes/services')],
  ['/api/faq', require('./route/FAQ')],
  ['/api/portfolio', require('./route/portfolio')],
  ['/api/pageHeading', require('./route/pageHeading.js')],
  ['/api/chemicalCategory', require('./route/chemicalCategory')],
  ['/api/chemical', require('./route/chemical')],
  ['/api/customer', require('./route/customer')],
  ['/api/chemicalType', require('./route/chemicalType')],
  ['/api/unit', require('./route/unit')],
  ['/api/smtp', require('./route/smtp_setting')],
  ['/api/inquiry', require('./route/inquiry')],
  ['/api/followUp', require('./route/followUp')],
  ['/api/status', require('./route/statusMaster')],
  ['/api/source', require('./route/sourceMaster')],
  ['/api/logo', require('./route/logo')],
  ['/api/count', require('./route/dashboard')],
  ['/api/image', require('./route/image')],
  ['/api/blogCategory', require('./route/blogCategory')],
  ['/api/blog', require('./route/blog')],
  ['/api/email', require('./route/email')],
  ['/api/template', require('./route/emailTemplate')],
  ['/api/productInquiry', require('./route/productInquiry')],
  ['/api/sitemap', require('./route/sitemapRoute')],
  ['/api/banner', require('./route/banner')],
  ['/api/aboutus', require('./route/aboutUs')],
  ['/api/contactForm', require('./route/contactForm')],
  ['/api/chemicalMail', require('./route/chemicalMail')],
  ['/api/career', require('./route/carrer')],
  ['/api/worldwide', require('./route/worldwide')],
  ['/api/contactinfo', require('./route/contactinfo')],
  ['/api/emailCategory', require('./route/emailCategory')],
  ['/api/companyLogo', require('./route/companyLogo')],
  ['/api/meta', require('./route/staticMeta')],

  ['/api/slideshow', require('./route/slideShow')],
  ['/api/whatsup', require('./route/whatsUpInfo')],
  ['/api/events', require('./route/events')],
  ['/api/lifeAtRndCategory', require('./route/lifeAtRndCategory')],
  ['/api/lifeAtRndGallery', require('./route/lifeAtRndGallery')],
  ['/api/catalogue', require('./route/catalogue')],
  ['/api/privacy', require('./route/privacy')],
  ['/api/terms', require('./route/termscondition')],
  ['/api/policy', require('./route/policy')],
  ['/api/cookies', require('./route/cookies')],
  ['/api/careerInfo', require('./route/careerInfo')],
  ['/api/staff', require('./routes/ourStaff')],
  ['/api/coreValue', require('./route/CoreValue')],
  ['/api/clients', require('./route/clients')],
  ['/api/serviceSec1', require('./route/serviceSec1')],
  ['/api/serviceSec2', require('./route/serviceSection2')],
  ['/api/serviceSec3', require('./route/serviceSec3.js')],
  ['/api/testimonial', require('./route/testimonial')],
  ['/api/why-choose-us', require('./route/whyChooseUs')],
  ['/api/career-option', require('./route/careerOption')],
  ['/api/counter', require('./route/counter')],
  ['/api/video', require('./route/video')],
  ['/api/footer', require('./route/footer')],
  ['/api/text-slider', require('./route/textSliderRoutes')],
  ['/api/socialMedia', require('./route/socialMedia')],
  ['/api/tracking', require('./route/tracking')],
  ['/api/companyItem', require('./route/companyItem')],
  ['/api/notification', require('./route/notification')],
  ['/api/alertBar', require('./route/AlertBar')],
  ['/api/global-settings', require('./route/globalSettings')],
  ['/api/redirect', require('./route/redirect')],
  ['/api/seo-audit', require('./route/seoAudit')]
];

// Apply cache middleware to all API routes
apiRoutes.forEach(([route, handler]) => {
  app.use(route, handler);
});


// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

// Server startup
const PORT = process.env.PORT || 3028;
const { startReminderService } = require('./services/reminderService');

app.listen(PORT, () => {
  console.log(`Environment Variables:`, {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not Set',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not Set',
  });
  console.log(`Server running on port ${PORT}`);
  startReminderService(); // Initialize the daily reminder job
  // generateAllSitemaps(); // Generate sitemaps on startup
});

// SMTP Connection Test (assuming you have nodemailer setup)
// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // or your email service
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// transporter.verify((error, success) => {
//   if (error) {
//     console.error('SMTP connection failed:', error);
//   } else {
//     console.log('SMTP connection successful');
//   }
// });
