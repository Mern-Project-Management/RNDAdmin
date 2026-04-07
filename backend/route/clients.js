const express = require('express');
const router = express.Router();
const { uploadPhoto } = require('../middleware/fileUpload');
const { requireAuth } = require('../middleware/authmiddleware');
const {
  getAllClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  deleteClientImage,
  downloadClientImage
} = require('../controller/clients');

// Get all clients
router.get('/', getAllClients);

// Get client by ID
router.get('/getClientById', requireAuth, getClientById);

// Add a new client
router.post('/', requireAuth, uploadPhoto, addClient);

// Update client
router.put('/updateClient', requireAuth, uploadPhoto, updateClient);

// Delete client
router.delete('/deleteClient', requireAuth, deleteClient);

// Delete single image from client
router.delete('/:id/image/:imageFilename(*)/:index', requireAuth, deleteClientImage);

// Download client image
router.get('/download/:filename', requireAuth, downloadClientImage);

module.exports = router;