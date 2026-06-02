const express = require('express');
const router = express.Router();
const auditController = require('../controller/seoAuditController');

router.get('/', auditController.getAudits);
router.post('/run', auditController.runAudit);
router.delete('/clear', auditController.clearHistory);

module.exports = router;
