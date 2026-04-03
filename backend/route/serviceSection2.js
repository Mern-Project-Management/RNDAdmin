// routes/serviceSec2Routes.js
const express = require('express');
const router = express.Router();
const {
  createSec2,
  updateSec2,
  getSec2,
  deleteSec2,
  getSec2ById,
  getAllServiceSec2,
  deleteSec2ById
} = require('../controller/serviceSection2');
const { uploadPhoto } = require('../middleware/fileUpload'); // your multer middleware

// CREATE or UPDATE ServiceSec2 (with up to 5 photos)
router.post('/', uploadPhoto, createSec2);

// GET ServiceSec2 by category/subcategory/subsubcategory
router.get('/', getSec2);

// GET all ServiceSec2 entries
router.get('/all', getAllServiceSec2);

// GET ServiceSec2 by ID
router.get('/:id', getSec2ById);

// UPDATE ServiceSec2
router.put('/:id', uploadPhoto, updateSec2);

// DELETE ServiceSec2
router.delete('/', deleteSec2);

// DELETE ServiceSec2 by ID
router.delete('/:id', deleteSec2ById);

module.exports = router;