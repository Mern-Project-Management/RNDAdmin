const express = require('express');
const router = express.Router();
const lifeAtRndCategoryController = require('../controller/lifeAtRndCategory');

router.post('/add', lifeAtRndCategoryController.createCategory);
router.get('/getAll', lifeAtRndCategoryController.getAllCategories);
router.get('/getById', lifeAtRndCategoryController.getCategoryById);
router.get('/website/getData', lifeAtRndCategoryController.getWebsiteData);
router.put('/update', lifeAtRndCategoryController.updateCategory);
router.delete('/delete', lifeAtRndCategoryController.deleteCategory);

module.exports = router;
