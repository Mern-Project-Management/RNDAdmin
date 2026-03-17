const express = require('express');
const router = express.Router();
const companyItemController = require('../controller/companyItem');
const upload = require('../middleware/imgUpload');

// Create new company item
router.post('/add', upload, companyItemController.createCompanyItem);

// Get all company items
router.get('/getAll', companyItemController.getAllCompanyItems);

// Get company item by ID
router.get('/get', companyItemController.getCompanyItemById);

// Update company item
router.put('/update', upload, companyItemController.updateCompanyItem);

// Delete company item
router.delete('/delete', companyItemController.deleteCompanyItem);

module.exports = router;
