const Logo = require('../model/Logo');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
// Add new logo
const addLogo = async (req, res) => {
    try {
        if (!req.files || !req.files.headerLogo || !req.files.favIcon) {
            return res.status(400).json({ success: false, message: 'Both headerLogo and favIcon are required' });
        }

        // Check if a logo already exists
        const existingLogo = await Logo.findOne();
        if (existingLogo) {
            return res.status(400).json({ success: false, message: 'Logo already exists. Use update instead.' });
        }

        // Create a new logo record
        const logo = await Logo.create({
            headerLogo: 'logos/' + req.files.headerLogo[0].filename,
            headerLogoName: req.body.headerLogoName || '',
            headerLogoAltName: req.body.headerLogoAltName || '',
            favIcon: 'logos/' + req.files.favIcon[0].filename,
            favIconName: req.body.favIconName || '',
            favIconAltName: req.body.favIconAltName || ''
        });

        res.status(201).json({ success: true, data: logo, message: 'Logo added successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update logo
const updateLogo = async (req, res) => {
    try {
        let logo = await Logo.findOne();
        const isNew = !logo;

        if (!logo) {
            // If no logo exists, create a new one
            logo = new Logo({});
        }

        if (!isNew) {
            const oldHeaderLogo = logo.headerLogo;
            const oldFavIcon = logo.favIcon;


            const deleteFile = (filePath) => {
                if (!filePath) return;
                const fullPath = path.join(__dirname, '..', filePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlink(fullPath, (err) => {
                        if (err) console.error(`Error deleting old file: ${fullPath}`, err);
                    });
                }
            };

            // If a new file is uploaded, delete the old one.
            if (req.files?.headerLogo) deleteFile(oldHeaderLogo);
            if (req.files?.favIcon) deleteFile(oldFavIcon);
        }

        // Assign new values from the request, falling back to existing values
        logo.headerLogo = req.files?.headerLogo ? 'logos/' + req.files.headerLogo[0].filename : logo.headerLogo;
        logo.favIcon = req.files?.favIcon ? 'logos/' + req.files.favIcon[0].filename : logo.favIcon;
        logo.headerLogoName = req.body.headerLogoName ?? logo.headerLogoName;
        logo.headerLogoAltName = req.body.headerLogoAltName ?? logo.headerLogoAltName;
        logo.favIconName = req.body.favIconName ?? logo.favIconName;
        logo.favIconAltName = req.body.favIconAltName ?? logo.favIconAltName;

        await logo.save();

        const statusCode = isNew ? 201 : 200;
        const message = isNew ? 'Logo added successfully' : 'Logo updated successfully';

        res.status(statusCode).json({ success: true, data: logo, message });

    } catch (error) {
        console.error("Error updating logo:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



// Get logo
const getLogo = async (req, res) => {
    try {
        const logo = await Logo.findOne();
        if (!logo) return res.status(404).json({ success: false, message: 'Logo not found' });

        res.status(200).json({ success: true, data: logo });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete logo
const deleteLogo = async (req, res) => {
    try {
        const logo = await Logo.findOneAndDelete();
        if (!logo) return res.status(404).json({ success: false, message: 'Logo not found' });

        // Delete associated files
        const deleteFile = (filePath) => {
            const fullPath = path.join(__dirname, '..', filePath);
            if (fs.existsSync(fullPath)) fs.unlink(fullPath, (err) => console.error(`Error deleting file:`, err));
        };

        deleteFile(logo.headerLogo);
        deleteFile(logo.favIcon);
        res.status(200).json({ success: true, message: 'Logo deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addLogo,
    updateLogo,
    getLogo,

    deleteLogo

};