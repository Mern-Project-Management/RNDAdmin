const express = require('express');
const router = express.Router();
const menuListingController = require('../controller/menuListing');
const { uploadPhoto } = require('../middleware/fileUpload');

router.post('/add-menu', uploadPhoto, menuListingController.createMenuListing);
router.get('/get-menu', menuListingController.getAllMenuListings);
router.get('/get-menu/:id', menuListingController.getMenuListingById);
router.put('/update-menu/:id', uploadPhoto, menuListingController.updateMenuListing);
router.delete('/delete-menu/:id', menuListingController.deleteMenuListing);

module.exports = router;