const GlobalSettings = require('../model/globalSettings');

exports.getSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            // Create default if not exists
            settings = await GlobalSettings.create({});
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = await GlobalSettings.create(req.body);
        } else {
            settings = await GlobalSettings.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
