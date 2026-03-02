const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const logoPath = path.join(__dirname, '../logos', filename);
  const tempPath = path.join(__dirname, '../temp', filename);

  const serveFile = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'File serve failed' });
        }
      }
    });
  };

  // Check if the file exists in the logos directory
  if (fs.existsSync(logoPath)) {
    serveFile(logoPath);
  } else if (fs.existsSync(tempPath)) {
    // Check if the file exists in the temp directory
    serveFile(tempPath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});


module.exports = router;