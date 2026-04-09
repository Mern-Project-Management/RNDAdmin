const Inquiry = require('../model/inquiry');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Get all inquiries
exports.getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find();
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get inquiry by ID
exports.getInquiryById = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.query.id);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.status(200).json(inquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new inquiry
exports.createInquiry = async (req, res) => {
    try {
        const firstName = req.body.firstName || "";
        const lastName = req.body.lastName || "";
        const name = req.body.name || (firstName || lastName ? `${firstName} ${lastName}`.trim() : "Anonymous");
        const service = req.body.service || req.body.department || "";

        const inquiryData = {
            ...req.body,
            name,
            service,
            needCallback: req.body.needCallback || false,
            status: req.body.status || "New Inquiry",
            source: req.body.source || "",
        };
console.log("Inquiry Data:", inquiryData);
        // Save Inquiry to Database
        const inquiry = new Inquiry(inquiryData);
        await inquiry.save();

        console.log("Owner Email:", inquiryData.ownerEmail || "Not provided");

        // Fetch SMTP Configuration
        const { data: smtpResponse } = await axios.get("https://www.admin.rndtechnosoft.com/api/smtp/get");
        const smtpConfig = smtpResponse.data?.[0];

        if (!smtpConfig || !smtpConfig.host) {
            throw new Error("SMTP configuration is missing.");
        }

        // Fetch Email Templates
        const { data: emailTemplateResponse } = await axios.get("https://www.admin.rndtechnosoft.com/api/template/get");
        const emailTemplates = emailTemplateResponse.data;

        if (!emailTemplates || emailTemplates.length === 0) {
            throw new Error("Email templates are missing.");
        }

        // Get Customer Email Template
        const customerTemplate = emailTemplates.find(template => template.name === "Auto Thank You");
        if (!customerTemplate) {
            throw new Error("Customer email template not found.");
        }

        // **Set Default Owner Email if Not Provided**
        const ownerEmail = inquiryData.ownerEmail || smtpConfig.name; // Fallback to SMTP user email

        // **Create Email Transporter**
        const isSSL = smtpConfig.isSSL === true || smtpConfig.isSSL === 'true';
        const port = smtpConfig.port ? parseInt(smtpConfig.port) : (isSSL ? 465 : 587);

        // Prioritize .env credentials, fallback to dashboard
        const smtpUser = process.env.EMAIL_USER || smtpConfig.name;
        const smtpPass = process.env.EMAIL_PASS || smtpConfig.password;
        const smtpHost = process.env.EMAIL_HOST || smtpConfig.host;

        const transportConfig = {
            host: smtpHost,
            port: port,
            secure: isSSL,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        };

        if (smtpHost.includes('gmail.com') || (smtpUser && smtpUser.includes('@gmail.com'))) {
            transportConfig.service = 'gmail';
        }

        const transporter = nodemailer.createTransport(transportConfig);

        // **Owner Email Template**
        const ownerEmailBody = `
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
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            border: 1px solid #eeeeee;
        }
        .header {
            background: #fff8f5;
            padding: 40px 20px;
            text-align: center;
        }
        .header img {
            height: 60px;
        }
        .content {
            padding: 0 40px;
            background-color: #ffffff;
        }
        .intro-text {
            color: #444;
            font-size: 16px;
            margin: 28px 0;
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
            width: 35%;
        }
        .info-table td:last-child {
            color: #222;
        }
        .message-box {
            background-color: #f9f9f9;
            border-left: 5px solid #ff8c67;
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
            background-color: #fff2ed;
            border-left: 5px solid #ff573c;
            padding: 18px;
            border-radius: 6px;
            color: #d84315;
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
            background-color: #ffffff;
            padding: 25px 20px;
            text-align: center;
            color: #999999;
            font-size: 13px;
            border-top: 1px solid #f0f0f0;
        }
        .footer a {
            color: #ff573c;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Prominent Yellow Header -->
        <div style="background-color: #f7d400; padding: 40px 25px; text-align: center;">
            <img src="https://www.admin.rndtechnosoft.com/api/logo/download/headerLogo_1744447985780.webp" alt="RND Technosoft" style="height: 65px; margin-bottom: 5px;">
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2 style="color: #222; margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">New Inquiry Received</h2>
            <div style="width: 150px; height: 3px; background-color: #f7d400; margin-bottom: 30px;"></div>
            
            <p class="intro-text" style="color: #666; font-size: 16px; margin: 25px 0; text-align: left;">
                A new customer inquiry has been submitted through the website. Please review and respond at the earliest.
            </p>

            <!-- Customer Details Table -->
            <table class="info-table">
                <tr>
                    <td>Full Name:</td>
                    <td>${inquiryData.firstName || ''} ${inquiryData.lastName || '—'}</td>
                </tr>
                <tr>
                    <td>Organisation:</td>
                    <td>${inquiryData.organisation || "—"}</td>
                </tr>
                <tr>
                    <td>Service:</td>
                    <td>${inquiryData.service || inquiryData.department || "—"}</td>
                </tr>
                <tr>
                    <td>Address:</td>
                    <td>${inquiryData.address || '—'}</td>
                </tr>
                <tr>
                    <td>Country:</td>
                    <td>${inquiryData.country || '—'}</td>
                </tr>
                <tr>
                    <td>Phone:</td>
                    <td>${inquiryData.phone || '—'}</td>
                </tr>
                <tr>
                    <td>Email:</td>
                    <td><a href="mailto:${inquiryData.email}" style="color:#ff573c; text-decoration:none;">${inquiryData.email || '—'}</a></td>
                </tr>
                <tr>
                    <td>Callback Required:</td>
                    <td>${inquiryData.needCallback ? 'Yes' : 'No'}</td>
                </tr>
            </table>

            <div class="divider"></div>

            <!-- Message Section -->
            <p style="margin: 0 0 12px 0; color:#555; font-weight:600; font-size:16px;">Customer Message:</p>
            <div class="message-box">
                ${inquiryData.message ? inquiryData.message.replace(/\n/g, '<br>') : '<em>No message provided</em>'}
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
            <p>&copy; ${new Date().getFullYear()} RND Technosoft. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        // **Send Email to Owner**
        if (ownerEmail) {
            const ownerMailOptions = {
                from: `"Your Business Name" <${smtpConfig.name}>`,
                to: ownerEmail,
                subject: "New Inquiry Received",
                html: ownerEmailBody,
                replyTo: inquiryData.email || smtpConfig.name, // Allow owner to reply
            };

            await transporter.sendMail(ownerMailOptions);
            console.log("Owner Email Sent Successfully to:", ownerEmail);
        } else {
            console.warn("Owner email is missing, skipping owner email notification.");
        }

        // **Send Email to Customer** (Strictly only to user)
        if (inquiryData.email && inquiryData.email !== ownerEmail) {
            const rawBody = customerTemplate.body.replace("[First Name]", inquiryData.firstName || "Customer");
            const customerMailOptions = {
                from: `"RND Technosoft" <${smtpConfig.name}>`,
                to: inquiryData.email,
                subject: customerTemplate.subject,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                  <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #f7c600;">
                    <img src="https://rndtechnosoft.com/api/logo/download/rndlogo.png" alt="RND Technosoft Logo" style="height: 50px; width: auto;">
                  </div>
                  <div style="padding: 30px; line-height: 1.6; color: #333;">
                    ${rawBody}
                  </div>
                  <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 11px; color: #888;">
                    &copy; ${new Date().getFullYear()} RND Technosoft. All rights reserved.
                  </div>
                </div>
                `,
            };

            await transporter.sendMail(customerMailOptions);
            console.log("Customer Email Sent Successfully to:", inquiryData.email);
        } else {
            console.warn("Customer email is missing, skipping customer email notification.");
        }

        res.status(201).json({ message: "Inquiry created and emails sent successfully", inquiry });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};


// Update inquiry by ID
exports.updateInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(req.query.id, req.body, { new: true });
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.status(200).json(inquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete inquiry by ID
exports.deleteInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.query.id);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.status(200).json({ message: "Inquiry deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTodayInquiries = async (req, res) => {
    try {
        // Get the start and end of the current day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set to 12:00:00 AM
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Set to 11:59:59 PM
        console.log(startOfDay , endOfDay)
        // Fetch inquiries created today
        const todayInquiries = await Inquiry.find({
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        res.status(200).json(todayInquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete multiple inquiries
exports.deleteMultipleInquiries = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No IDs provided for deletion" });
        }

        const result = await Inquiry.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ 
            message: `${result.deletedCount} inquiries deleted successfully`,
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
