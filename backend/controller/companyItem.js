const CompanyItem = require('../model/companyItem');

// Create new company item
exports.createCompanyItem = async (req, res) => {
    try {
        const image = req.files['image'] ? req.files['image'][0].filename : null;

        const companyItem = new CompanyItem({
            name: req.body.name,
            link: req.body.link,
            image: image,
            order: req.body.order || 0,
        });

        const savedCompanyItem = await companyItem.save();
        res.status(201).json({ message: 'Company item created successfully', companyItem: savedCompanyItem });
    } catch (err) {
        console.error('Error creating company item:', err);
        res.status(400).json({ message: err.message });
    }
};

// Get all company items
exports.getAllCompanyItems = async (req, res) => {
    try {
        const companyItems = await CompanyItem.find().sort({ order: 1, createdAt: -1 });
        res.status(200).json(companyItems);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get company item by ID
exports.getCompanyItemById = async (req, res) => {
    try {
        const companyItem = await CompanyItem.findById(req.query.id);
        if (!companyItem) return res.status(404).json({ message: 'Company item not found' });
        res.status(200).json(companyItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update company item
exports.updateCompanyItem = async (req, res) => {
    try {
        const { id } = req.query;
        const existingCompanyItem = await CompanyItem.findById(id);

        if (!existingCompanyItem) {
            return res.status(404).json({ message: 'Company item not found' });
        }

        const updateData = {
            ...req.body
        };

        // Handle image update if new image is uploaded
        if (req.files && req.files['image']) {
            updateData.image = req.files['image'][0].filename;
        }

        const updatedCompanyItem = await CompanyItem.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json(updatedCompanyItem);
    } catch (err) {
        console.error('Error updating company item:', err);
        res.status(400).json({ message: err.message });
    }
};

// Delete company item
exports.deleteCompanyItem = async (req, res) => {
    try {
        const { id } = req.query;
        const companyItem = await CompanyItem.findById(id);

        if (!companyItem) {
            return res.status(404).json({ message: "Company item not found" });
        }

        await CompanyItem.findByIdAndDelete(id);
        res.status(200).json({ message: "Company item deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while deleting the company item" });
    }
};
