const Message = require('../model/followUp');
const Inquiry = require('../model/inquiry');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Create a new message
const createMessage = async (req, res) => {
  try {
    const { message, date, status, inquiryId } = req.body;

    // Ensure the inquiryId is provided
    if (!inquiryId) {
      return res.status(400).json({
        success: false,
        message: 'inquiryId is required',
      });
    }

    const newMessage = new Message({
      message,
      date: date || Date.now(), // Use provided date or default to now
      inquiryId, // Store the inquiryId reference
      status
    });

    await newMessage.save();

    // --- Email Sending Logic Start ---
    try {
      // 1. Fetch the associated Inquiry details
      const inquiry = await Inquiry.findById(inquiryId);
      if (inquiry && inquiry.email) {
        
        // 2. Fetch SMTP Configuration from Dashboard
        const { data: smtpResponse } = await axios.get("https://www.admin.rndtechnosoft.com/api/smtp/get");
        const smtpConfig = smtpResponse.data?.[0];

        if (smtpConfig && smtpConfig.host) {
          const isSSL = smtpConfig.isSSL === true || smtpConfig.isSSL === 'true';
          // Prioritize .env credentials, fallback to dashboard
          const smtpUser = process.env.EMAIL_USER || smtpConfig.name;
          const smtpPass = process.env.EMAIL_PASS || smtpConfig.password;
          const smtpHost = process.env.EMAIL_HOST || smtpConfig.host;
          
          const transportConfig = {
            auth: { user: smtpUser, pass: smtpPass },
          };

          if (smtpHost.includes('gmail.com') || (smtpUser && smtpUser.includes('@gmail.com'))) {
            transportConfig.service = 'gmail';
          } else {
            transportConfig.host = smtpHost;
            transportConfig.port = smtpConfig.port ? parseInt(smtpConfig.port) : (isSSL ? 465 : 587);
            transportConfig.secure = isSSL;
          }

          // 3. Create Transporter
          const transporter = nodemailer.createTransport(transportConfig);

          const logoImageUrl = "https://rndtechnosoft.com/api/logo/download/rndlogo.png";

          // 4. Fetch Email Templates from Dashboard
          const { data: emailTemplateResponse } = await axios.get("https://www.admin.rndtechnosoft.com/api/template/get");
          const emailTemplates = emailTemplateResponse.data;

          const followUpTemplate = emailTemplates?.find(t => t.name === "Follow Up");
          
          if (!followUpTemplate) {
            throw new Error("Follow Up email template not found in dashboard.");
          }

          // 5. Replace Placeholders in Template and wrap in branded container
          const rawBody = followUpTemplate.body
            .replace("[First Name]", inquiry.firstName || "Customer")
            .replace("[Message]", message.replace(/\n/g, '<br/>'));

          const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #f7c600;">
                <img src="${logoImageUrl}" alt="RND Technosoft Logo" style="height: 50px; width: auto;">
              </div>
              <div style="padding: 30px; line-height: 1.6; color: #333;">
                ${rawBody}
              </div>
              <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee;">
                &copy; ${new Date().getFullYear()} RND Technosoft. All rights reserved.
              </div>
            </div>
          `;

          // 6. Send Email
          await transporter.sendMail({
            from: `"RND Technosoft" <${smtpConfig.name}>`,
            to: inquiry.email,
            subject: followUpTemplate.subject || "Update Regarding Your Inquiry - RND Technosoft",
            html: emailBody,
          });

          console.log("Follow-up email sent successfully to:", inquiry.email);
        }
      }
    } catch (emailErr) {
      console.error("Error sending follow-up email:", emailErr.message);
      // We don't fail the response if email fails, as the follow-up log is already saved.
    }
    // --- Email Sending Logic End ---

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).populate('inquiryId'); // Populate inquiryId reference

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single message by ID
const getMessageById = async (req, res) => {
  try {
    const { id } = req.query;
    const message = await Message.findById(id).populate('inquiryId'); // Populate inquiryId reference

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a message by ID
const updateMessage = async (req, res) => {
  try {
    const { id } = req.query;
    const { message, date ,status } = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { message, date ,status },
      { new: true } // Return the updated document
    ).populate('inquiryId'); // Populate inquiryId reference

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a message by ID
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.query;

    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessagesByInquiryId = async (req, res) => {
  try {
    const { id } = req.query; // Get the inquiryId from the URL parameters
    const messageCount = await Message.countDocuments({ inquiryId: id });

    // Find messages that match the inquiryId, and populate any references if needed
    const messages = await Message.find({ inquiryId :id }).populate('inquiryId'); 

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No messages found for this inquiryId',
      });
    }

    res.status(200).json({
      success: true,
      data: messages,
      count:messageCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessagesCountByInquiryId = async (req, res) => {
  try {
    const { id } = req.query; // Get the inquiryId from the query parameters
    
    // Count messages that match the inquiryId
    const messageCount = await Message.countDocuments({ inquiryId: id });

    if (messageCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No messages found for this inquiryId',
      });
    }

    res.status(200).json({
      success: true,
      count: messageCount, // Return the count of messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTodayMessages = async (req, res) => {
  try {
    // Get the start and end of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set to 12:00:00 AM
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // Set to 11:59:59 PM

    // Fetch messages created today
    const todayMessages = await Message.find({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
      .sort({ createdAt: -1 }) // Sort in descending order by creation time
      .populate('inquiryId'); // Populate the inquiryId reference

    res.status(200).json({
      success: true,
      data: todayMessages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getMessagesByInquiryId ,
  getMessagesCountByInquiryId,
  getTodayMessages
};
