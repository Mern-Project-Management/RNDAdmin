const express = require('express');
const router = express.Router();
const policyController = require('../controller/policy');

// Create policy
router.post('/add', policyController.createPolicy);

// Get all policies (optional: ?policyType=cookies|terms|privacy)
router.get('/getAll', policyController.getAllPolicies);

// Get policy by id (query param)
router.get('/getById', policyController.getPolicyById);

// Update policy (query param id)
router.put('/update', policyController.updatePolicy);

// Delete policy (query param id)
router.delete('/delete', policyController.deletePolicy);

module.exports = router;

