const fs = require('fs');
const Career = require('../model/career');
const { default: axios } = require('axios');
const nodemailer = require('nodemailer');

const submitApplication = async (req, res) => {
  try {
    const { name, address, email, contactNo, postAppliedFor, url } = req.body;

    // Validate inputs
    if (!name || !address || !email || !contactNo || !postAppliedFor || !url) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(contactNo)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Check if resume file exists in the request
    if (!req.files || !req.files.resumeFile || !req.files.resumeFile[0]) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    // Get just the filename instead of the full path
    const resumePath = req.files.resumeFile[0].filename;

    // Create new application
    const application = new Career({
      name,
      address,
      email,
      contactNo,
      postAppliedFor,
      resumeFile: resumePath,
      url
    });

    await application.save();

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

    // Get Applicant Email Template
    const applicantTemplate = emailTemplates.find(template => template.name === "Careers Inquiry");
    if (!applicantTemplate) {
      throw new Error("Applicant email template not found.");
    }

    // **Set Default Owner Email if Not Provided**
    const ownerEmail = smtpConfig.name; // Fallback to SMTP user email

    // **Create Email Transporter**
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port || 465,
      secure: smtpConfig.isSSL,
      auth: {
        user: smtpConfig.name,
        pass: smtpConfig.password,
      },
    });

    // **Owner Email Template**
    const ownerEmailBody = `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Application - RND Technosoft</title>
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
        }
        .header h1 {
            margin: 0;
            font-size: 30px;
            font-weight: 700;
            letter-spacing: 0.8px;
        }
        .subheader {
            background-color: #fff8f5;
            padding: 22px;
            text-align: center;
            border-bottom: 3px solid #ffe8e0;
        }
        .subheader h3 {
            margin: 0;
            color: #e64a19;
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
            background-color: #f8f9fa;
            padding: 25px 20px;
            text-align: center;
            color: #6c757d;
            font-size: 13px;
            border-top: 1px solid #dee2e6;
        }
        .footer a {
            color: #ff573c;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">

        <!-- Branded Header -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #ff573c;">
            <img src="https://rndtechnosoft.com/api/logo/download/rndlogo.png" alt="RND Technosoft" style="height: 50px;">
        </div>

        <!-- Subheader -->
        <div class="subheader">
            <h3>New Job Application Received</h3>
        </div>

        <!-- Main Content -->
        <div class="content">
            <p class="intro-text">
                A new job application has been submitted through the careers portal. Please review the candidate details below.
            </p>

            <!-- Applicant Details Table -->
            <table class="info-table">
                <tr>
                    <td>Name:</td>
                    <td>${name || '—'}</td>
                </tr>
                <tr>
                    <td>Email:</td>
                    <td><a href="mailto:${email}" style="color:#ff573c; text-decoration:none;">${email || '—'}</a></td>
                </tr>
                <tr>
                    <td>Contact No:</td>
                    <td>${contactNo || '—'}</td>
                </tr>
                <tr>
                    <td>Address:</td>
                    <td>${address || '—'}</td>
                </tr>
                <tr>
                    <td>Post Applied For:</td>
                    <td><strong>${postAppliedFor || '—'}</strong></td>
                </tr>
            </table>

            <div class="divider"></div>

            <!-- Additional Information Section -->
            <p style="margin: 0 0 12px 0; color:#555; font-weight:600; font-size:16px;">Application Details:</p>
            <div class="message-box">
                The candidate has applied for the position of <strong>${postAppliedFor || 'Not specified'}</strong>. Please review their qualifications and contact them to schedule an interview if appropriate.
            </div>

            <!-- Action Required -->
            <div class="action-text">
                Action Required: Review the application and contact the candidate for next steps.
            </div>
        </div>

        <!-- Timestamp -->
        <div class="timestamp">
            Application received on: ${new Date().toLocaleString()}
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is an automated notification from RND Technosoft HR System.</p>
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
        from: `"RND Technosoft" <${smtpConfig.name}>`,
        to: ownerEmail,
        subject: "New Application Received",
        html: ownerEmailBody,
        replyTo: email || smtpConfig.name, // Allow owner to reply
      };

      await transporter.sendMail(ownerMailOptions);
      console.log("Owner Email Sent Successfully to:", ownerEmail);
    } else {
      console.warn("Owner email is missing, skipping owner email notification.");
    }

    // **Send Email to Applicant**
    if (email) {
      const rawBody = applicantTemplate.body.replace("[Applicant's Name]", name)
        .replace("[Job/Position Name]", postAppliedFor)
        .replace("[Company Name]", "RND Technosoft")
        .replace("[Contact Email]", "vbrs@gmail.com");

      const applicantMailOptions = {
        from: `"RND Technosoft" <${smtpConfig.name}>`,
        to: email,
        subject: applicantTemplate.subject,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #ff573c;">
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

      await transporter.sendMail(applicantMailOptions);
      console.log("Applicant Email Sent Successfully to:", email);
    } else {
      console.warn("Applicant email is missing, skipping applicant email notification.");
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully and emails sent',
      data: application
    });

  } catch (error) {
    console.error('Error in submitApplication:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await Career.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await Career.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

const updateApplication = async (req, res) => {
  try {
    const { id } = req.query;
    const { name, address, email, contactNo, postAppliedFor, url } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      updateData.email = email;
    }
    if (contactNo) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(contactNo)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      updateData.contactNo = contactNo;
    }
    if (postAppliedFor) updateData.postAppliedFor = postAppliedFor;
    if (url) updateData.url = url;

    // Handle resume file update
    if (req.files && req.files.resumeFile && req.files.resumeFile[0]) {
      const application = await Career.findById(id);
      if (application && application.resumeFile) {
        try {
          // Correctly construct the path to the old resume file
          const oldResumePath = path.join(__dirname, '../uploads/documents', application.resumeFile);
          if (fs.existsSync(oldResumePath)) {
            fs.unlinkSync(oldResumePath);
          }
        } catch (err) {
          console.error('Error deleting old resume:', err);
        }
      }
      // Get just the filename instead of the full path
      updateData.resumeFile = req.files.resumeFile[0].filename;
    }


    const updatedApplication = await Career.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const application = await Career.findById(req.query.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Delete resume file from storage
    if (application.resumeFile) {
      try {
        const resumePath = path.join(__dirname, '../uploads/documents', application.resumeFile);
        if (fs.existsSync(resumePath)) {
          fs.unlinkSync(resumePath);
        }
      } catch (err) {
        console.error('Error deleting resume file:', err);
      }
    }

    await Career.findByIdAndDelete(req.query.id);

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
};

const deleteMultipleApplications = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No IDs provided for deletion'
      });
    }

    // Find all applications to delete their resume files
    const applications = await Career.find({ _id: { $in: ids } });

    for (const application of applications) {
      if (application.resumeFile) {
        try {
          const resumePath = path.join(__dirname, '../uploads/documents', application.resumeFile);
          if (fs.existsSync(resumePath)) {
            fs.unlinkSync(resumePath);
          }
        } catch (err) {
          console.error(`Error deleting resume file for app ${application._id}:`, err);
        }
      }
    }

    const result = await Career.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} applications deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting multiple applications',
      error: error.message
    });
  }
};

module.exports = {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  deleteMultipleApplications
};
