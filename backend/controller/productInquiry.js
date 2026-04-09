require('dotenv').config();
const Inquiry = require('../model/productInquiry');
const { sendEmail } = require('./emailService'); // Import the centralized email service

exports.createInquiry = async (req, res) => {
 
  try {
    // Verify email configuration first
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration is missing');
    }

    const newInquiry = new Inquiry(req.body); 
    await newInquiry.save();
console.log('New Inquiry Saved:', newInquiry);
    // HTML Email Template
    const emailHTML = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry - RND Technosoft</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', 'Helvetica', sans-serif;
            background-color: #f5f5f5;
        }
        .email-container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: #e3e6e4;
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
        }
        .header img {
            height: 60px;
            /*margin-bottom: 12px;*/
        }
        .header h1 {
            margin: 0;
            font-size: 30px;
            font-weight: 700;
            letter-spacing: 0.8px;
        }
        .subheader {
            background-color: #fffdf0;
            padding: 22px;
            text-align: center;
            border-bottom: 3px solid #fff4b3;
        }
        .subheader h3 {
            margin: 0;
            color: #f7c600;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 35px 40px;
            background-color: #ffffff;
        }
        .intro-text {
            color: #444;
            font-size: 16px;
            margin-bottom: 28px;
            line-height: 1.6;
            text-align: center;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
        }
        .info-table tr {
            border-bottom: 1px solid #eee;
        }
        .info-table tr:last-child {
            border-bottom: none;
        }
        .info-table td {
            padding: 15px 10px;
            font-size: 15.5px;
            vertical-align: top;
        }
        .info-table td:first-child {
            font-weight: 600;
            color: #666;
            width: 32%;
        }
        .info-table td:last-child {
            color: #222;
        }
        .message-box {
            background-color: #f9f9f9;
            border-left: 5px solid #f7c600;
            padding: 20px;
            border-radius: 6px;
            margin: 25px 0;
            font-size: 15.5px;
            line-height: 1.8;
            color: #333;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #ddd, transparent);
            margin: 32px 0;
        }
        .action-text {
            background-color: #fffdf0;
            border-left: 5px solid #f7c600;
            padding: 18px;
            border-radius: 6px;
            color: #f7c600;
            font-weight: 600;
            font-size: 15px;
        }
        .timestamp {
            text-align: center;
            background-color: #fafafa;
            padding: 14px;
            color: #777;
            font-size: 13px;
            border-top: 1px solid #eaeaea;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px 20px;
            text-align: center;
            color: #6c757d;
            font-size: 13px;
            border-top: 1px solid #dee2e6;
        }
        .footer a {
            color: #f7c600;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">

        <!-- Branded Header -->
        <div class="header">
            <!-- <img src="https://www.admin.rndtechnosoft.com/api/logo/download/headerLogo_1764672964886.webp" alt="RND Technosoft"> -->
           <h1>RND Technosoft</h1>
        </div>

        <!-- Subheader -->
        <div class="subheader">
             <h3>New Product Inquiry Received</h3>
        </div>

        <!-- Main Content -->
        <div class="content">
            <p class="intro-text">
                A new customer inquiry has been submitted through the RND Technosoft website. Please review and respond at the earliest.
            </p>

            <!-- Customer Details Table -->
            <table class="info-table">
                <tr>
                    <td>Name:</td>
                    <td>${newInquiry.name || '—'}</td>
                </tr>
                <tr>
                    <td>Email:</td>
                    <td><a href="mailto:${newInquiry.email}" style="color:#f7c600; text-decoration:none;">${newInquiry.email || '—'}</a></td>
                </tr>
                <tr>
                    <td>Phone:</td>
                    <td>${newInquiry.phone || '—'}</td>
                </tr>
                 <tr>
                    <td>product Name:</td>
                    <td>${newInquiry.productName || '—'}</td>
                </tr>
            </table>

            <div class="divider"></div>

            <!-- Message Section -->
            <p style="margin: 0 0 12px 0; color:#555; font-weight:600; font-size:16px;">Customer Message:</p>
            <div class="message-box">
                ${newInquiry.message ? newInquiry.message.replace(/\n/g, '<br>') : '<em>No message provided</em>'}
            </div>

            <!-- Action Required -->
            <div class="action-text">
                Action Required: Please contact the customer and address their inquiry promptly.
            </div>
        </div>

        <!-- Timestamp -->
        <div class="timestamp">
            Inquiry received on: ${new Date().toLocaleString()}
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is an automated notification from RND Technosoft Contact System.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `;

const mailOptions = {
  from: `"Website Inquiry" <${process.env.EMAIL_USER}>`,  // Safe & verified sender
  to: process.env.EMAIL_FROM || process.env.EMAIL_USER, // Send to admin, fallback to user
  replyTo: newInquiry.email,   // User gets replies
  subject: `New Inquiry from ${newInquiry.name}`,
  html: emailHTML
};
        

    // Send email to Admin
    await sendEmail(mailOptions);

    // Send Thank You email to Customer
    if (newInquiry.email && newInquiry.email !== (process.env.EMAIL_FROM || process.env.EMAIL_USER)) {
        const customerMailOptions = {
            from: `"RND Technosoft" <${process.env.EMAIL_USER}>`,
            to: newInquiry.email,
            subject: "Thank you for your inquiry - RND Technosoft",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #f7c600;">
                <img src="https://rndtechnosoft.com/api/logo/download/rndlogo.png" alt="RND Technosoft Logo" style="height: 50px; width: auto;">
              </div>
              <div style="padding: 30px; line-height: 1.6; color: #333;">
                <p>Dear ${newInquiry.name || 'Customer'},</p>
                <p>Thank you for reaching out to RND Technosoft regarding <strong>${newInquiry.productName || 'our products'}</strong>.</p>
                <p>We have received your inquiry and our team will get back to you shortly.</p>
                <p>Best Regards,<br>RND Technosoft Team</p>
              </div>
              <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 11px; color: #888;">
                &copy; ${new Date().getFullYear()} RND Technosoft. All rights reserved.
              </div>
            </div>
            `
        };
        await sendEmail(customerMailOptions);
    }

    // Respond to the client
    res.status(201).json({ success: true, data: newInquiry });
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get counts and data based on field presence
exports.getCountsAndData = async (req, res) => {
  try {
    const totalCount = await Inquiry.countDocuments();

    const countWithFields = await Inquiry.countDocuments({
      $or: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const countWithoutFields = await Inquiry.countDocuments({
      $nor: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const dataWithFields = await Inquiry.find({
      $or: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });
  
    const dataWithoutFields = await Inquiry.find({
      $nor: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const inquiries = await Inquiry.find();

    res.status(200).json({  
      totalCount,
      countWithFields,
      countWithoutFields,
      dataWithFields,
      dataWithoutFields,
      inquiries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  const { id } = req.query;
  try {
    const deletedInquiry = await Inquiry.findByIdAndDelete(id);
    if (!deletedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.status(200).json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
