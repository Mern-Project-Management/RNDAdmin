const LifeAtRndCategory = require('../model/LifeAtRndCategory');
const LifeAtRndGallery = require('../model/LifeAtRndGallery');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        console.log('Creating category with body:', req.body);
        const category = new LifeAtRndCategory(req.body);
        const savedCategory = await category.save();
        res.status(201).json({ message: 'Category created successfully', category: savedCategory });
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(400).json({ message: err.message, error: err });
    }
};

// Get all categories sorted by priority
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await LifeAtRndCategory.find().sort({ priority: 1 });
        res.status(200).json(categories);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.query;
        const category = await LifeAtRndCategory.findById(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.query;
        const updatedCategory = await LifeAtRndCategory.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.query;
        const deletedCategory = await LifeAtRndCategory.findByIdAndDelete(id);
        if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// --- Website Get Method ---
// Get all active Categories with their Gallery images (for public view)
exports.getWebsiteData = async (req, res) => {
    try {
        // 1. Get all published categories sorted by priority
        const categories = await LifeAtRndCategory.find({ status: true }).sort({ priority: 1 }).lean();

        // 2. Map and fetch images for each category in parallel
        const finalData = await Promise.all(
            categories.map(async (category) => {
                const galleryItems = await LifeAtRndGallery.find({ 
                    category_id: category._id,
                    status: true 
                }).sort({ createdAt: -1 });
                
                return {
                    ...category,
                    gallery_images: galleryItems
                };
            })
        );

        res.status(200).json(finalData);
    } catch (err) {
        console.error('Website data fetch error:', err);
        res.status(500).json({ message: 'Error fetching Life At RND data for website', error: err.message });
    }
};
