const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const NodeCache = require('node-cache');
// Initialize NodeCache locally in this file
const cache = new NodeCache({
  stdTTL: 86400, // 1 day TTL for images
  checkperiod: 600,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 1000,
});

router.get('/download/:filename', async (req, res) => {
  const { filename } = req.params;
  const { w = 1200, q = 80 } = req.query;
  const originalPath = path.join(__dirname, '../uploads/images', filename);
  const ext = path.extname(filename).toLowerCase();

  const startTime = Date.now();

  try {
    // Serve GIFs directly — do NOT convert, preserve animation
    if (ext === '.gif') {
      if (!fs.existsSync(originalPath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.sendFile(originalPath);
    }

    const filePath = path.join(__dirname, '../uploads/images', `${filename.split('.')[0]}-${w}.webp`);

    // Serve pre-generated file if it exists
    if (fs.existsSync(filePath)) {
      console.log(`Pre-generated file served in ${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.type('image/webp').sendFile(filePath);
      return;
    }

    // Fallback to dynamic processing
    if (!fs.existsSync(originalPath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const cacheKey = `image_${filename}_${w}_${q}`;
    const cachedImage = cache.get(cacheKey);
    if (cachedImage) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.type('image/webp').send(cachedImage);
      return;
    }

    const optimizedImage = await sharp(originalPath)
      .resize({ width: parseInt(w, 10), withoutEnlargement: true })
      .webp({ quality: parseInt(q, 10) })
      .toBuffer();

    cache.set(cacheKey, optimizedImage);
    // console.log(`Processed in ${Date.now() - startTime}ms`);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.type('image/webp').send(optimizedImage);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'File download failed' });
  }
});
router.get('/view/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads/images', filename);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline'); // Set to 'inline' to view in browser

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'File display failed' });
    }
  });
});

// Add PDF download route
router.get('/pdf/download/:filename', (req, res) => {
  const { filename } = req.params;
  let filePath = path.join(__dirname, '../uploads/images', filename);

  // Verify file exists
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '../uploads/documents', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'PDF download failed' });
    }
  });
});

// Add PDF view route
router.get('/pdf/view/:filename', (req, res) => {
  const { filename } = req.params;
  let filePath = path.join(__dirname, '../uploads/images', filename);

  // Check if file exists in images directory
  if (!fs.existsSync(filePath)) {
    // If not, check in catalogs directory
    filePath = path.join(__dirname, '../uploads/catalogs', filename);
    if (!fs.existsSync(filePath)) {
      // Check in documents directory
      filePath = path.join(__dirname, '../uploads/documents', filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
    }
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'PDF display failed' });
    }
  });
});

// Combined route for both MSDS and Specs viewing
router.get('/:docType/view/:filename', (req, res) => {
  const { docType, filename } = req.params;

  // Validate document type
  if (!['msds', 'specs'].includes(docType)) {
    return res.status(400).json({ message: 'Invalid document type' });
  }

  const filePath = path.join(__dirname, `../uploads/${docType}`, filename);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'File display failed' });
    }
  });
});

module.exports = router; 