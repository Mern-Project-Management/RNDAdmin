const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const multer = require('multer');
const upload = require("../middleware/imgUpload");
const { getThankYou, updateThankYou } = require('../controller/thankYou');

// Create a local multer instance for this route to be more flexible if needed
// but we will stick to the 'image' middleware which is the exported function from imgUpload.js
router.get('/get', getThankYou);
router.post('/update', upload, updateThankYou);

module.exports = router;
