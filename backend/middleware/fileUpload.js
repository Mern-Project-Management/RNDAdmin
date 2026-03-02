const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Define the directories
const catalogueDir = path.join(__dirname, '../catalogues');
const photoDir = path.join(__dirname, '../uploads/images');
const resumeDir = path.join(__dirname, '../resumes');
const tempDir = path.join(__dirname, '../temp');

// Ensure the directories exist
[photoDir, catalogueDir, resumeDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'catalogue') {
      cb(null, catalogueDir);
    } else if (file.fieldname === 'resume') {
      cb(null, resumeDir);
    } else if (file.fieldname === 'photo' || file.fieldname.startsWith('cards[')) {
      // Accept both 'photo' and any 'cards[x][photo]'
      cb(null, tempDir); // Save temporarily
    } else {
      cb(new Error('Unexpected field'));
    }
  },
  filename: function (req, file, cb) {
    let fileName;
    if (file.fieldname === 'catalogue') {
      fileName = file.originalname;
      req.fileName = fileName;
    } else if (file.fieldname === 'resume') {
      fileName = `resume_${Date.now()}${path.extname(file.originalname)}`;
    } else {
      // For both 'photo' and 'cards[x][photo]'
      fileName = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    }
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB
  fileFilter: function (req, file, cb) {
    cb(null, true); // Accept all file types
  }
});

const filesToCleanup = new Set();

// Schedule cleanup every 5 minutes
setInterval(() => {
  if (filesToCleanup.size === 0) return;
  
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  for (const item of filesToCleanup) {
    if (now - item.timestamp > maxAge) {
      fs.unlink(item.path, (err) => {
        if (!err || err.code === 'ENOENT') {
          filesToCleanup.delete(item);
        }
      });
    }
  }
}, 5 * 60 * 1000);

const processLogoImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.webp') {
    return filePath;
  }

  const webpPath = filePath.replace(/\.[^/.]+$/, '.webp');
  
  try {
    await sharp(filePath)
      .resize(5000, 5000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ 
        quality: 80,
        effort: 6
      })
      .toFile(webpPath);

    filesToCleanup.add({
      path: filePath,
      timestamp: Date.now()
    });

    return webpPath;
  } catch (error) {
    console.error(`Error processing image at ${filePath}:`, error);
    return filePath;
  }
};

// Middleware to handle all photo uploads (both 'photo' and 'cards[x][photo]')
const uploadPhoto = (req, res, next) => {
  upload.fields([
    { name: 'catalogue', maxCount: 1 },
    { name: 'photo', maxCount: 10 },           // increased a bit for flexibility
    { name: 'resume', maxCount: 1 },
    // Allow dynamic card photo fields — Multer supports wildcards via regex or multiple definitions
    // But easier: just let any field starting with 'cards[' go to temp and process later
  ])(req, res, async function (err) {
    if (err) {
      return res.status(400).send({ error: err.message });
    }

    // Collect all photo files: both from 'photo' field and any 'cards[x][photo]'
    const photoFiles = [];

    if (req.files['photo']) {
      photoFiles.push(...req.files['photo']);
    }

    // Find all fields that start with 'cards[' and end with '[photo]'
    Object.keys(req.files).forEach(fieldName => {
      if (fieldName.startsWith('cards[') && fieldName.endsWith('][photo]')) {
        photoFiles.push(...req.files[fieldName]);
      }
    });

    if (photoFiles.length === 0) {
      return next();
    }

    try {
      await Promise.all(photoFiles.map(async (photo) => {
        const tempPath = path.join(tempDir, photo.filename);
        if (!fs.existsSync(tempPath)) {
          throw new Error(`Temporary file not found: ${photo.filename}`);
        }

        const newPath = await processLogoImage(tempPath);
        const finalFilename = path.basename(photo.filename, path.extname(photo.filename)) + '.webp';
        const finalPath = path.join(photoDir, finalFilename);

        await fs.promises.mkdir(path.dirname(finalPath), { recursive: true });
        await fs.promises.copyFile(newPath, finalPath);

        // Update the file object so downstream code sees the final filename
        photo.filename = finalFilename;
        photo.path = finalPath;           // optional: full path
        photo.destination = photoDir;     // optional

        // Schedule processed intermediate file for cleanup
        if (newPath !== tempPath) {
          filesToCleanup.add({
            path: newPath,
            timestamp: Date.now()
          });
        }
      }));

      // Optional: make all processed photos available under a consistent key if needed
      // req.processedPhotos = photoFiles;

      next();
    } catch (error) {
      console.error('Error in upload middleware:', error);
      res.status(500).send({ 
        error: 'Error processing uploaded files',
        details: error.message 
      });
    }
  });
};

module.exports = { uploadPhoto };