const express = require('express');
const router = express.Router();
const lifeAtRndGalleryController = require('../controller/lifeAtRndGallery');
const upload = require('../middleware/imgUpload');

router.post('/add', upload, lifeAtRndGalleryController.createGalleryItem);
router.get('/getAll', lifeAtRndGalleryController.getAllGalleryItems);
router.get('/getById', lifeAtRndGalleryController.getGalleryById);
router.get('/getByCategory', lifeAtRndGalleryController.getGalleryByCategoryId);
router.put('/update', upload, lifeAtRndGalleryController.updateGalleryItem);
router.delete('/delete', lifeAtRndGalleryController.deleteGalleryItem);

module.exports = router;
