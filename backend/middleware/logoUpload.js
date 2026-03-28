const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const multer = require('multer');

// Specify the directory for logos
const uploadDir = path.join(__dirname, '../logos');

// Create logos directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define storage for uploaded photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store directly in logos directory
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Preserve GIF extension so animations are not broken
    const isGif = file.mimetype === 'image/gif';
    const ext = isGif ? '.gif' : '.webp';
    const fileName = `${file.fieldname}_${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

// Initialize multer with defined storage options and file size limits
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Process the image in place to ensure WebP format (skip GIFs to preserve animations)
const processLogoImage = async (filePath, mimetype) => {
  try {
    // Skip GIFs — preserve animation
    if (mimetype === 'image/gif') {
      return;
    }
    // If the file is already a .webp, skip processing
    if (mimetype === 'image/webp') {
      return;
    }
    // Otherwise, convert to WebP
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(filePath + '.temp');
    await fs.promises.rename(filePath + '.temp', filePath);
  } catch (err) {
    throw new Error(`Failed to process image: ${err.message}`);
  }
};

// Middleware to handle the logo file upload and process the image
const uploadLogo = async (req, res, next) => {
  try {
    await upload.fields([
      { name: 'photo', maxCount: 1 },
      { name: 'dropdownPhoto', maxCount: 1 },
      { name: 'headerLogo', maxCount: 1 },
      { name: 'favIcon', maxCount: 1 }
    ])(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: err.message || 'Error uploading file'
        });
      }

      // Process uploaded files
      const processFile = async (file) => {
        if (!file) return;
        const filePath = file.path;
        console.log('File saved to:', filePath);
        await processLogoImage(filePath, file.mimetype);
      };

      try {
        if (req.files) {
          if (req.files.photo) {
            await processFile(req.files.photo[0]);
          }
          if (req.files.dropdownPhoto) {
            await processFile(req.files.dropdownPhoto[0]);
          }
          if (req.files.headerLogo) {
            await processFile(req.files.headerLogo[0]);
          }
          if (req.files.favIcon) {
            await processFile(req.files.favIcon[0]);
          }
        }
        next();
      } catch (processError) {
        console.error('Processing error:', processError);
        return res.status(500).json({
          error: 'Error processing the image',
          details: processError.message
        });
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      error: 'Server error during upload'
    });
  }
};

module.exports = { uploadLogo };