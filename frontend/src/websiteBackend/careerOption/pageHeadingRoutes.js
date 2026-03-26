const express = require('express');
const router = express.Router();
const pageHeadingController = require('../controllers/pageHeadingController');
const { uploadPhoto } = require('../middleware/fileUpload');

router.get('/heading', pageHeadingController.getHeading);
router.put('/updateHeading', uploadPhoto, pageHeadingController.updateHeading);

module.exports = router;
