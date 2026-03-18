const Message = require('../model/followUp');
const Inquiry = require('../model/inquiry');
const Career = require('../model/career');

// Get all notifications for today
const getTodayNotifications = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dateFilter = {
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
      isNotificationDismissed: { $ne: true }
    };

    // 1. Fetch Follow-Ups
    const messages = await Message.find(dateFilter).populate('inquiryId').lean();
    
    // 2. Fetch Inquiries
    const inquiries = await Inquiry.find(dateFilter).lean();

    // 3. Fetch Career Applications
    const careers = await Career.find(dateFilter).lean();

    // Map into a unified format
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      type: 'followup',
      title: msg.inquiryId?.firstName ? `Follow Up: ${msg.inquiryId.firstName}` : 'Follow Up Update',
      message: msg.message,
      createdAt: msg.createdAt,
      isRead: msg.isRead || false,
      inquiryEmail: msg.inquiryId?.email || null,
      sourceData: msg
    }));

    const formattedInquiries = inquiries.map(inq => ({
      _id: inq._id,
      type: 'inquiry',
      title: inq.name ? `New Inquiry: ${inq.name}` : 'New Inquiry',
      message: inq.message || `Source: ${inq.source || 'Website'}`,
      createdAt: inq.createdAt,
      isRead: inq.isRead || false,
      inquiryEmail: inq.email || null,
      sourceData: inq
    }));

    const formattedCareers = careers.map(car => ({
      _id: car._id,
      type: 'career',
      title: car.name ? `New Career App: ${car.name}` : 'New Career Application',
      message: `Post Applied For: ${car.postAppliedFor || 'Unknown'}`,
      createdAt: car.createdAt,
      isRead: car.isRead || false,
      inquiryEmail: car.email || null,
      sourceData: car
    }));

    // Combine and sort by createdAt descending
    const allNotifications = [...formattedMessages, ...formattedInquiries, ...formattedCareers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      data: allNotifications
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id, type } = req.body;
    let updated;

    switch (type) {
      case 'followup':
        updated = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
        break;
      case 'inquiry':
        updated = await Inquiry.findByIdAndUpdate(id, { isRead: true }, { new: true });
        break;
      case 'career':
        updated = await Career.findByIdAndUpdate(id, { isRead: true }, { new: true });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid notification type' });
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification source not found' });
    }

    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id, type } = req.body; 

    let updated;
    switch (type) {
      case 'followup':
        updated = await Message.findByIdAndUpdate(id, { isNotificationDismissed: true }, { new: true });
        break;
      case 'inquiry':
        updated = await Inquiry.findByIdAndUpdate(id, { isNotificationDismissed: true }, { new: true });
        break;
      case 'career':
        updated = await Career.findByIdAndUpdate(id, { isNotificationDismissed: true }, { new: true });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid notification type' });
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification source not found' });
    }

    res.status(200).json({ success: true, message: 'Dismissed from notifications' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTodayNotifications,
  markAsRead,
  deleteNotification
};
