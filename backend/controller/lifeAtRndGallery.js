const LifeAtRndGallery = require('../model/LifeAtRndGallery');
const LifeAtRndCategory = require('../model/LifeAtRndCategory');

// Create new gallery item(s)
exports.createGalleryItem = async (req, res) => {
    try {
        console.log('Creating gallery item body:', req.body);
        
        const { category_id, title, titles, status, subtitle, category_title, description } = req.body;
        
        // Update category if metadata is provided
        if (category_id && (subtitle || category_title || description)) {
            await LifeAtRndCategory.findByIdAndUpdate(category_id, {
                subtitle,
                title: category_title, // Use category_title to avoid conflict with image title
                description
            });
        }
        
        if (!req.files || (!req.files['image'] && !req.files['photo'])) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const uploadedFiles = req.files['image'] || req.files['photo'];
        const galleryItems = [];
        
        // Handle titles (could be a single string or an array of strings)
        const titleList = Array.isArray(titles) ? titles : [title];

        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const newItem = new LifeAtRndGallery({
                category_id,
                image: file.filename,
                title: titleList[i] || title || '',
                status: status !== undefined ? (status === 'false' ? false : true) : true
            });
            const savedItem = await newItem.save();
            galleryItems.push(savedItem);
        }

        res.status(201).json({ message: 'Gallery items created successfully', items: galleryItems });
    } catch (err) {
        console.error('Error creating gallery items:', err);
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
            updateData.image = file.filename;
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
        const deletedItem = await LifeAtRndGallery.findByIdAndDelete(id);
        if (!deletedItem) return res.status(404).json({ message: 'Gallery item not found' });
        res.status(200).json({ message: 'Gallery item deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
