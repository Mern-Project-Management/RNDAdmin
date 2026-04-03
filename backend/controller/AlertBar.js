const AlertBar = require('../model/AlertBar');

// Get current alert bar status and text
const getAlertBar = async (req, res) => {
    try {
        let alertBar = await AlertBar.findOne();
        if (!alertBar) {
            // Create default if not exists
            alertBar = await AlertBar.create({
                text: "Our website is currently under construction. Please check back later.",
                status: 'active',
                link: "#",
                linkText: "Know More"
            });
        }
        res.status(200).json(alertBar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update alert bar settings
const updateAlertBar = async (req, res) => {
    try {
        const { text, status, link, linkText } = req.body;
        let alertBar = await AlertBar.findOne();
        if (alertBar) {
            alertBar.text = text !== undefined ? text : alertBar.text;
            alertBar.status = status !== undefined ? status : alertBar.status;
            alertBar.link = link !== undefined ? link : alertBar.link;
            alertBar.linkText = linkText !== undefined ? linkText : alertBar.linkText;
            await alertBar.save();
        } else {
            alertBar = await AlertBar.create({ text, status, link, linkText });
        }
        res.status(200).json(alertBar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAlertBar,
    updateAlertBar
};
