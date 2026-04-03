// routes/serviceSec2Routes.js
const express = require('express');
const router = express.Router();
const {
  createSec3,
  updateSec3,
  getSec3,
  deleteSec3,
  getSec3ById,
  getAllServiceSec3,
  deleteSec3ById
} = require('../controller/serviceSec3');
const { uploadPhoto } = require('../middleware/fileUpload'); // your multer middleware

// CREATE or UPDATE ServiceSec2 (with up to 5 photos)
router.post('/', uploadPhoto, createSec3);

// GET ServiceSec3 by category/subcategory/subsubcategory
router.get('/', getSec3);

// GET all ServiceSec3 entries
router.get('/all', getAllServiceSec3);

// GET ServiceSec3 by ID
router.get('/:id', getSec3ById);

// UPDATE ServiceSec3
router.put('/:id', uploadPhoto, updateSec3);

// DELETE ServiceSec3
router.delete('/', deleteSec3);

// DELETE ServiceSec3 by ID
router.delete('/:id', deleteSec3ById);

module.exports = router;