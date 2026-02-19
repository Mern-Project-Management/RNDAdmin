const express = require('express');
const router = express.Router();
const { getFAQBySlug,replaceSlugWithId, insertFAQ, getFAQ, updateFAQ, deleteFAQ, getFAQById, countFaq, getFAQWebsite } = require('../controller/FAQ')
const { requireAuth } = require('../middleware/authmiddleware');
const { uploadPhoto } = require('../middleware/fileUpload.js')


router.post('/insertFAQ', requireAuth, uploadPhoto, insertFAQ);
router.get('/replaceSlugWithId', replaceSlugWithId);
router.get('/getFaq', requireAuth, getFAQ);
router.get('/getFAQByServiceSlug', getFAQBySlug);
router.put('/updateFaq', requireAuth, uploadPhoto, updateFAQ);
router.delete('/deleteFAQ', requireAuth, deleteFAQ)
router.get('/getFAQById', requireAuth, getFAQById);
router.get('/countFaq', requireAuth, countFaq);


router.get('/getFAQWebsite', getFAQWebsite)

module.exports = router;