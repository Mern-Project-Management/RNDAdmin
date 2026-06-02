const express = require('express');
const router = express.Router();
const redirectController = require('../controller/redirect');

router.get('/', redirectController.getAllRedirects);
router.post('/', redirectController.createRedirect);
router.put('/:id', redirectController.updateRedirect);
router.delete('/:id', redirectController.deleteRedirect);

module.exports = router;
