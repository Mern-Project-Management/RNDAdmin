// controllers/msdsController.js
import nodemailer from 'nodemailer';
import axios from 'axios';

export const handleMsdsRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message = '',
      subject = '',
      docType = '  ',
      productName = '',
      path = '',
      url = '',
      
      from,
      adminEmail: adminEmailFromBody
    } = req.body || {};

    // Basic validation
    if (!name || !email || !phone || !url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, phone, and url are required.'
      });
    }

    // Prepare email content for admin
    const fullSubject = subject || `New inquiry${productName ? `: ${productName}` : ''}`;
    const plainText = `
New Request Received

Name: ${name}
Email: ${email}
Phone: ${phone}
Product: ${productName}
Path: ${path}
Message: ${message || '—'}
    `.trim();

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #f8f9fa;
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h2 {
            margin: 0;
            font-size: 26px;
            font-weight: 600;
            letter-spacing: 1px;
        }
        .subheader {
            background-color: #f8f9fa;
            padding: 20px;
            border-bottom: 3px solid #f5f5f5;
        }
        .subheader h3 {
            margin: 0;
            color: #f7c600;
            font-size: 20px;
            font-weight: 600;
        }
        .content {
            padding: 30px 40px;
            background-color: #ffffff;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .info-table tr {
            border-bottom: 1px solid #e9ecef;
        }
        .info-table tr:last-child {
            border-bottom: none;
        }
        .info-table td {
            padding: 15px 10px;
            font-size: 15px;
            line-height: 1.6;
        }
        .info-table td:first-child {
            font-weight: 600;
            color: #6c757d;
            width: 35%;
        }
        .info-table td:last-child {
            color: #212529;
        }
        .request-type {
            background-color: #fffdf0;
            border-left: 4px solid #f5f5f5;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .request-type p {
            margin: 0;
            color: #f7c600;
            font-weight: 600;
            font-size: 14px;
        }
        .divider {
            height: 2px;
            background: #f5f5f5;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #dee2e6;
        }
        .footer p {
            margin: 0;
            color: #6c757d;
            font-size: 13px;
        }
        .timestamp {
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            padding: 10px;
            background-color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <!-- <img src="https://www.admin.rndtechnosoft.com/api/logo/download/headerLogo_1764672964886.webp" alt="RND Technosoft" style="height: 50px; margin-bottom: 10px;"> -->
            <h2>RND Technosoft</h2>
        </div>
        
        <div class="subheader">
            <h3>📄 Document Request Received</h3>
        </div>
        
        <div class="content">
            <p style="color: #495057; margin-bottom: 20px;">A customer has requested product documentation. Please find the request details below:</p>
            
            <div class="request-type">
                <p>🔔 Request Type: MSDS / Product Specification Document</p>
            </div>
            
            <table class="info-table">
                <tr>
                    <td>Requested By:</td>
                    <td>${name}</td>
                </tr>
                <tr>
                    <td>Email Address:</td>
                    <td>${email}</td>
                </tr>
                <tr>
                    <td>Phone Number:</td>
                    <td>${phone}</td>
                </tr>
                <tr>
                    <td>Product Name:</td>
                    <td>${productName}</td>
                </tr>
                <tr>
                    <td>Request Source:</td>
                    <td>${path}</td>
                </tr>
            </table>
            
            <div class="divider"></div>
            
            <p style="color: #495057; font-size: 14px; margin-top: 20px;">
                <strong>Action Required:</strong> Please send the requested MSDS file and/or product specification document to the customer's email address.
            </p>
        </div>
        
        <div class="timestamp">
            <p>Request received on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="footer">
            <p>This is an automated notification from RND Technosoft.</p>
            <p style="margin-top: 5px;">Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Fetch SMTP Configuration
    let smtpConfig;
    try {
      const { data: smtpResponse } = await axios.get("https://www.admin.rndtechnosoft.com/api/smtp/get");
      smtpConfig = smtpResponse.data?.[0];
    } catch (err) {
      console.error("Failed to fetch SMTP config from API", err);
    }

    if (!smtpConfig || !smtpConfig.host) {
      console.warn("Falling back to environment variables for SMTP");
      smtpConfig = {
        host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtppro.zoho.in',
        port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '465', 10),
        isSSL: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE || 'true') === 'true',
        name: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS
      };
    }

    // Fetch Email Templates
    let emailTemplates = [];
    try {
      const { data: emailTemplateResponse } = await axios.get("https://www.admin.rndtechnosoft.com/api/template/get");
      emailTemplates = emailTemplateResponse.data || [];
    } catch (err) {
      console.error("Failed to fetch Email templates from API", err);
    }

    const customerTemplate = emailTemplates.find(template => template.name === "Auto Thank You");

    // Prefer admin email from body, then env vars
    const adminEmail = adminEmailFromBody || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const fromAddress = from || (process.env.SMTP_FROM || smtpConfig.name) || 'no-reply@example.com';

    const smtpConfigured = Boolean(smtpConfig.host && smtpConfig.name && smtpConfig.password);

    if (smtpConfigured) {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port || 465,
        secure: smtpConfig.isSSL !== undefined ? smtpConfig.isSSL : true,
        auth: {
          user: smtpConfig.name,
          pass: smtpConfig.password
        }
      });

      // Send admin notification (if admin email resolved)
      if (adminEmail) {
        try {
          await transporter.sendMail({
            from: fromAddress,
            to: adminEmail,
            subject: fullSubject,
            text: plainText,
            html: htmlBody
          });
        } catch (err) {
          console.error('Failed to send admin notification email:', err);
        }
      } else {
        console.warn('Admin email not configured; skipping admin notification.');
      }

      // Send acknowledgement to the requester
      if (customerTemplate && email) {
        try {
          await transporter.sendMail({
            from: `"RND Technosoft" <${smtpConfig.name}>`,
            to: email,
            subject: customerTemplate.subject,
            html: customerTemplate.body.replace("[First Name]", name || "Customer")
          });
        } catch (err) {
          console.error('Failed to send acknowledgement email to user:', err);
        }
      } else if (email) {
          console.warn('Customer template not found, using fallback string template');
          // Prepare acknowledgement email to user
          const companyName = process.env.COMPANY_NAME || 'Our Team';
          const ackSubject = `We received your request${productName ? ` — ${productName}` : ''}`;
          const ackPlain = `
Dear ${name},

Thank you for your request regarding "${productName || 'your inquiry'}".
We have received your request successfully and will contact you as soon as possible.

Summary of your request:
Name: ${name}
Email: ${email}
Phone: ${phone}
Product: ${productName}
Message: ${message || '—'}
Page: ${path || '—'}

Kind regards,
${companyName}
          `.trim();

          const ackHtml = `
            <div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #ffffff; padding: 30px;">
                <p>Dear ${name},</p>
                <p>Thank you for reaching out to us! We appreciate your inquiry and are excited to assist you. Our team has received your request and will get back to you within 24–48 hours with the information you need.</p>
                <p>In the meantime, if you have any specific questions or require further details, feel free to reply to this email or contact us at <a href="mailto:info@rndtechnosoft.com" style="color: #f7c600; text-decoration: none;">info@rndtechnosoft.com</a>. You can also visit our Help Center for quick answers.</p>
                <p>We look forward to assisting you!</p>
                <p style="margin-top: 30px; margin-bottom: 0;">Best regards,</p>
                <p style="margin-top: 5px; font-weight: 600;">Customer Support Team</p>
                <p style="margin-top: 0; color: #555;">RND Technosoft</p>
                <div style="margin-top: 20px; font-size: 14px; color: #555;">
                    <p style="margin: 5px 0;">📧 <a href="mailto:info@rndtechnosoft.com" style="color: #555; text-decoration: none;">info@rndtechnosoft.com</a></p>
                    <p style="margin: 5px 0;">📞 +91-730 494 5823</p>
                    <p style="margin: 5px 0;">🌐 <a href="https://www.rndtechnosoft.com" style="color: #f7c600; text-decoration: none;">www.rndtechnosoft.com</a></p>
                </div>
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 13px; border-top: 1px solid #dee2e6;">
                <p style="margin: 0;">This is an automated notification from RND Technosoft.</p>
                <p style="margin-top: 5px;">Please do not reply to this email.</p>
              </div>
            </div>
          `;
          try {
            await transporter.sendMail({
              from: fromAddress,
              to: email,
              subject: ackSubject,
              text: ackPlain,
              html: ackHtml
            });
          } catch (err) {
            console.error('Failed to send fallback acknowledgment:', err);
          }
      }
    } else {
      // Best-effort fallback: log payload when email not configured
      console.warn('Skipping all email sends - SMTP not configured. Resolved adminEmail:', adminEmail, 'Inquiry:', { name, email, phone, productName, path, message, from: fromAddress });
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you, I will contact you soon'
    });
  } catch (err) {
    console.error('Error in MSDS request handler:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};