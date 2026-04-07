const Clients = require('../model/client');
const path = require('path');
const fs = require('fs');

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const clients = await Clients.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  const { id } = req.query;
  try {
    const client = await Clients.findById(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ data: client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a new client
const addClient = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const photo = req.files['photo'] ? req.files['photo'].map(file => 'uploads/images/' + file.filename) : [];
    const { title, alt, color, altName, imgTitle } = req.body;

    const newClient = new Clients({ 
      photo, 
      title, 
      alt,
      color,
      altName,
      imgTitle
    });
    
    await newClient.save();

    res.status(200).json({ 
      message: 'Client added successfully', 
      data: newClient 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update client
const updateClient = async (req, res) => {
  const { id } = req.query;
  const updateFields = req.body;

  try {
    const existingClient = await Clients.findById(id);

    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Process new uploaded photos
    if (req.files && req.files['photo'] && req.files['photo'].length > 0) {
      const newPhotoPaths = req.files['photo'].map(file => 'uploads/images/' + file.filename);
      updateFields.photo = [...existingClient.photo, ...newPhotoPaths];
    } else {
      updateFields.photo = existingClient.photo;
    }

    const updatedClient = await Clients.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  const { id } = req.query;

  try {
    const client = await Clients.findById(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete all associated images
    if (client.photo && Array.isArray(client.photo)) {
      client.photo.forEach(filename => {
        if (filename) {
          const filePath = path.join(__dirname, '..', filename);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (unlinkErr) {
              console.error(`Error deleting file: ${filePath}`, unlinkErr);
            }
          }
        }
      });
    }

    await Clients.findByIdAndDelete(id);

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error in deleteClient:', error);
    res.status(500).json({ message: 'Error deleting client', error: error.message });
  }
};

// Delete single image from client
const deleteClientImage = async (req, res) => {
  const { id, imageFilename, index } = req.params;

  try {
    const client = await Clients.findById(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Remove the photo
    client.photo = client.photo.filter(photo => photo !== imageFilename);
    
    // Remove the alt text safely
    if (client.alt && Array.isArray(client.alt) && index >= 0 && index < client.alt.length) {
      client.alt.splice(index, 1);
    }

    const filePath = path.join(__dirname, '..', imageFilename);

    // Check if the file exists and delete it safely
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error(`Error deleting file: ${filePath}`, unlinkErr);
      }
    }

    await client.save();

    res.json({ message: 'Photo and alt text deleted successfully' });
  } catch (error) {
    console.error('Error in deleteClientImage:', error);
    res.status(500).json({ message: error.message });
  }
};

// Download client image
const downloadClientImage = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'File download failed' });
    }
  });
};

module.exports = {
  getAllClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  deleteClientImage,
  downloadClientImage
};