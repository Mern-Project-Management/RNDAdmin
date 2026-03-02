const PageHeading = require('../models/PageHeading');
const fs = require('fs');
const path = require('path');

// Get heading by pageType
exports.getHeading = async (req, res) => {
  try {
    const { pageType } = req.query;
    if (!pageType) {
      return res.status(400).json({ message: "Page type is required" });
    }

    let pageHeading = await PageHeading.findOne({ pageType });

    if (!pageHeading) {
      // Return empty structure if not found
      return res.status(200).json({ 
        heading: '', 
        subheading: '', 
        photo: '', 
        alt: '', 
        imgTitle: '' 
      });
    }

    res.status(200).json(pageHeading);
  } catch (error) {
    console.error("Error fetching page heading:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update heading
exports.updateHeading = async (req, res) => {
  try {
    const { pageType } = req.query;
    const { heading, subheading, alt, imgTitle } = req.body;
    
    if (!pageType) {
      return res.status(400).json({ message: "Page type is required" });
    }

    let pageHeading = await PageHeading.findOne({ pageType });

    if (!pageHeading) {
      pageHeading = new PageHeading({ pageType });
    }

    pageHeading.heading = heading;
    pageHeading.subheading = subheading;
    pageHeading.alt = alt;
    pageHeading.imgTitle = imgTitle;

    // Handle photo upload
    if (req.files && req.files['photo'] && req.files['photo'].length > 0) {
      const file = req.files['photo'][0];
      
      // Delete old photo if it exists and is different
      if (pageHeading.photo && pageHeading.photo !== file.filename) {
        const oldPhotoPath = path.join(__dirname, '../uploads/images', pageHeading.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlink(oldPhotoPath, (err) => {
            if (err) console.error("Error deleting old photo:", err);
          });
        }
      }
      
      pageHeading.photo = file.filename;
    }

    await pageHeading.save();

    res.status(200).json({ 
      message: "Page heading updated successfully", 
      data: pageHeading 
    });

  } catch (error) {
    console.error("Error updating page heading:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};