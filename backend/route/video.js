const express = require('express');
const router = express.Router();
const videoController = require('../controller/video');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Define fields for upload (video and image)
const uploadFields = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

router.post('/createVideo', uploadFields, videoController.createVideo);
router.get('/getVideos', videoController.getVideos);
router.get('/getVideoById', videoController.getVideoById);
router.get('/getVideoBySlug', videoController.getVideoBySlug);
router.put('/updateVideo', uploadFields, videoController.updateVideo);
router.delete('/deleteVideo', videoController.deleteVideo);

router.get('/download/:filename(*)', (req, res) => {
  const { filename } = req.params;
  let filePath = path.join(__dirname, '..', filename);
  
  // Legacy fallback
  if (!filename.startsWith('uploads/') && !fs.existsSync(filePath)) {
    const legacyPath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(legacyPath)) {
      filePath = legacyPath;
    }
  }

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = 'video/mp4';
    if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.ogg') contentType = 'video/ogg';
    else if (ext === '.mov') contentType = 'video/quicktime';
    else if (ext === '.avi') contentType = 'video/x-msvideo';

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error('Error serving video:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Video stream failed' });
    }
  }
});

module.exports = router;
