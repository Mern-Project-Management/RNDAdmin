const Redirect = require('../model/redirect');

exports.getAllRedirects = async (req, res) => {
    try {
        const redirects = await Redirect.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: redirects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createRedirect = async (req, res) => {
    try {
        const redirect = await Redirect.create(req.body);
        res.status(201).json({ success: true, data: redirect });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRedirect = async (req, res) => {
    try {
        const redirect = await Redirect.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!redirect) return res.status(404).json({ success: false, message: 'Redirect not found' });
        res.status(200).json({ success: true, data: redirect });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteRedirect = async (req, res) => {
    try {
        const redirect = await Redirect.findByIdAndDelete(req.params.id);
        if (!redirect) return res.status(404).json({ success: false, message: 'Redirect not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
