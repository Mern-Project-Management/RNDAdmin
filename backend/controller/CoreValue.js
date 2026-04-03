const CoreValue = require('../model/CoreValue');

// Create new core value
exports.createCoreValue = async (req, res) => {
    try {
        const image = req.files['image'] ? 'uploads/images/' + req.files['image'][0].filename : null;

        const coreValue = new CoreValue({
            image: image,
            imgName: req.body.imgName,
            altName: req.body.altName,
            title: req.body.title,
            details: req.body.details,
        });

        const savedCoreValue = await coreValue.save();
        res.status(201).json({ message: 'Core value created successfully', coreValue: savedCoreValue });
    } catch (err) {
        console.error('Error creating core value:', err);
        res.status(400).json({ message: err.message });
    }
}; 

// Get all core values
exports.getAllCoreValues = async (req, res) => {
    try {
        const coreValues = await CoreValue.find().sort({ createdAt: -1 });
        res.status(200).json(coreValues);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get core value by ID
exports.getCoreValueById = async (req, res) => {
    try {
        const coreValue = await CoreValue.findById(req.query.id);
        if (!coreValue) return res.status(404).json({ message: 'Core value not found' });
        res.status(200).json(coreValue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get core value by pageSlug 
exports.getCoreValueByPageSlug = async (req, res) => {
    try {
        const coreValue = await CoreValue.find({ pageSlug: req.query.pageSlug });
        if (!coreValue) return res.status(404).json({ message: 'Core value not found' });
        res.status(200).json(coreValue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update core value
exports.updateCoreValue = async (req, res) => {
    try {
        const { id } = req.query;
        const existingCoreValue = await CoreValue.findById(id);

        if (!existingCoreValue) {
            return res.status(404).json({ message: 'Core value not found' });
        }

        const updateData = {
            ...req.body
        };

        // Handle image update if new image is uploaded
        if (req.files && req.files['image']) {
            updateData.image = 'uploads/images/' + req.files['image'][0].filename;
        }

        const updatedCoreValue = await CoreValue.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json(updatedCoreValue);
    } catch (err) {
        console.error('Error updating core value    :', err);
        res.status(400).json({ message: err.message });
    }
};

// Delete core value
exports.deleteCoreValue = async (req, res) => {
    try {
        const { id } = req.query;
        const coreValue = await CoreValue.findById(id);
        
        if (!coreValue) {
            return res.status(404).json({ message: "Core value not found" });
        }

        await CoreValue.findByIdAndDelete(id);
        res.status(200).json({ message: "Core value deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while deleting the core value" });
    }
};
