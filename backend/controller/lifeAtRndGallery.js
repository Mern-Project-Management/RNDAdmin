const LifeAtRndGallery = require('../model/LifeAtRndGallery');
const LifeAtRndCategory = require('../model/LifeAtRndCategory');
const fs = require('fs');
const path = require('path');

// Create new gallery item(s)
exports.createGalleryItem = async (req, res) => {
    try {
        console.log('--- Bulk Gallery Upload Started ---');
        console.log('Request Body:', req.body);
        
        // Multer puts files in req.files[fieldName]
        const uploadedFiles = req.files?.['image'] || req.files?.['photo'] || [];
        console.log('Number of files received:', uploadedFiles.length);

        const { category_id, title, titles, status, subtitle, category_title, description } = req.body;
        
        // 1. Update Category metadata if provided
        if (category_id && (subtitle || category_title || description)) {
            console.log('Updating category metadata for:', category_id);
            await LifeAtRndCategory.findByIdAndUpdate(category_id, {
                subtitle,
                title: category_title,
                description
            });
        }
        
        // 2. If no files, just return success (meta update only)
        if (uploadedFiles.length === 0) {
            console.log('No images to process.');
            return res.status(200).json({ message: 'Category settings updated successfully' });
        }

        // 3. Prepare items for bulk saving
        const galleryItems = [];
        let titleList = [];
        if (titles) {
            titleList = Array.isArray(titles) ? titles : [titles];
        }

        console.log('Parsing files and titles...');
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const itemTitle = titleList[i] || title || ''; // Fallback to single title if array is short
            
            galleryItems.push({
                category_id,
                image: 'uploads/images/' + file.filename,
                title: itemTitle,
                status: status !== undefined ? (status === 'false' ? false : true) : true
            });
        }

        // 4. Save to database
        console.log(`Saving ${galleryItems.length} documents to MongoDB...`);
        const savedItems = await LifeAtRndGallery.insertMany(galleryItems);

        console.log('--- Bulk Gallery Upload Finished Successfully ---');
        res.status(201).json({ 
            message: 'Gallery items created successfully', 
            count: savedItems.length,
            items: savedItems 
        });

    } catch (err) {
        console.error('CRITICAL ERROR in createGalleryItem:', err);
        res.status(400).json({ message: err.message, error: err });
    }
};

// Get gallery item by ID
exports.getGalleryById = async (req, res) => {
    try {
        const { id } = req.query;
        const item = await LifeAtRndGallery.findById(id).populate('category_id');
        if (!item) return res.status(404).json({ message: 'Gallery item not found' });
        res.status(200).json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all gallery items
exports.getAllGalleryItems = async (req, res) => {
    try {
        const items = await LifeAtRndGallery.find().populate('category_id').sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get gallery items by category
exports.getGalleryByCategoryId = async (req, res) => {
    try {
        const { category_id } = req.query;
        const items = await LifeAtRndGallery.find({ category_id }).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update gallery item
exports.updateGalleryItem = async (req, res) => {
    try {
        const { id } = req.query;
        const { subtitle, category_title, description, category_id } = req.body;
        const updateData = { ...req.body };

        // If category metadata is provided, update the category
        if (category_id && (subtitle || category_title || description)) {
            await LifeAtRndCategory.findByIdAndUpdate(category_id, {
                subtitle,
                title: category_title,
                description
            });
        }

        if (req.files && (req.files['image'] || req.files['photo'])) {
            const file = (req.files['image'] || req.files['photo'])[0];
            updateData.image = 'uploads/images/' + file.filename;
        }

        const updatedItem = await LifeAtRndGallery.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Gallery item not found' });
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete gallery item
exports.deleteGalleryItem = async (req, res) => {
    try {
        const { id } = req.query;
        const item = await LifeAtRndGallery.findById(id);
        
        if (!item) return res.status(404).json({ message: 'Gallery item not found' });

        // Delete the physical file
        if (item.image) {
            const filePath = path.join(__dirname, '..', item.image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await LifeAtRndGallery.findByIdAndDelete(id);
        res.status(200).json({ message: 'Gallery item deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
