const express = require('express');
const router = express.Router();
const metaController = require('../controller/staticMeta');

router.post('/add-meta', metaController.createMeta);
router.get('/get-meta', metaController.getAllMetas);
router.get('/get-meta-by-slug/:slug', metaController.getMetaBySlug);
router.get('/get-meta/:id', metaController.getMetaById);
router.put('/update-meta/:id', metaController.updateMeta);
router.delete('/delete-meta/:id', metaController.deleteMeta);
router.post('/audit-meta/:id', metaController.auditMeta);

module.exports = router;