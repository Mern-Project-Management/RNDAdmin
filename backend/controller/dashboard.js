const Blog = require("../model/blog");
const Clients = require("../model/client");
const JobApplication = require("../model/career");
const Inquiry = require("../model/inquiry")
const getDataCount = async (req, res) => {
  try {
    // Count the number of documents in each collection
    const blogCount = await Blog.countDocuments({});
    const clientCount = await Clients.countDocuments({});
    const jobCount = await JobApplication.countDocuments({});
    const inquiryCount = await Inquiry.countDocuments({});
    const FollowUp = require("../model/followUp");
    const pendingFollowUpCount = await FollowUp.countDocuments({ status: { $ne: "Completed" } });
    const completedFollowUpCount = await FollowUp.countDocuments({ status: "Completed" });

    // Return the counts in a structured response
    return res.status(200).json({
      blogCount,
      clientCount,
      jobCount,
      inquiryCount,
      pendingFollowUpCount,
      completedFollowUpCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error counting data", error: error.message });
  }
};

module.exports = {
  getDataCount,
};
