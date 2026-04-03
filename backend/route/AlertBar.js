const express = require('express');
const router = express.Router();
const { getAlertBar, updateAlertBar } = require('../controller/AlertBar');

// Route to get alert bar details
router.get('/', getAlertBar);

// Route to update alert bar details
router.post('/update', updateAlertBar);

module.exports = router;
