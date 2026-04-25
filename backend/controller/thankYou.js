const ThankYou = require('../model/ThankYou.js');

const getThankYou = async (req, res) => {
  try {
    const thankYou = await ThankYou.findOne();
    if (thankYou) {
      res.status(200).json(thankYou);
    } else {
      res.status(404).json({ message: 'Thank You content not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving Thank You content' });
  }
};

const updateThankYou = async (req, res) => {
  try {
    // Log what we received (will show in server console)
    console.log('--- Thank You Update Request Received ---');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? Object.keys(req.files) : 'None');

    // Extract fields, handling cases where they might be nested or missing
    const alt = req.body.alt || '';
    const description = req.body.description || '';
    const btnTitle = req.body.btnTitle || '';
    const btnLink = req.body.btnLink || '';

    let updateData = { alt, description, btnTitle, btnLink };

    // Handle uploaded file
    if (req.files && req.files.photo && req.files.photo[0]) {
      updateData.photo = req.files.photo[0].filename;
      console.log('New photo detected:', updateData.photo);
    }

    // Forcefully update or create the singleton record
    const thankYou = await ThankYou.findOneAndUpdate(
      {}, 
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    console.log('Save result:', thankYou);
    
    res.status(200).json({ 
      success: true,
      message: 'Thank You content updated successfully', 
      data: thankYou,
      // Include debug info for the user to see in Network tab if needed
      debug: {
        received_fields: Object.keys(req.body),
        received_files: req.files ? Object.keys(req.files) : []
      }
    });
  } catch (err) {
    console.error('Error updating Thank You content:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error updating Thank You content', 
      error: err.message 
    });
  }
};

module.exports = { getThankYou, updateThankYou };
