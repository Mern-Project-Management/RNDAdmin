const Contact = require('../model/contactForm');
const nodemailer = require('nodemailer');
const axios = require('axios');

exports.submitContact = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      organisation,
      department,
      address,
      country,
      phone,
      email,
      message,
      needCallback,
      verification,
    } = req.body;

    // Verify the captcha
    if (verification.toUpperCase() !== 'EDLED') {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Create contact entry
    const contact = await Contact.create({
      firstName,
      lastName,
      organisation,
      department,
      address,
      country,
      phone,
      email,
      message,
      needCallback,
    });

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

    const logoImageUrl = "https://rndtechnosoft.com/api/logo/download/rndlogo.png";

    // Send email notification to Admin (Owner)
    const ownerEmail = smtpConfig.name; // Fallback to SMTP user email
    if (ownerEmail) {
        const ownerMailOptions = {
            from: `"RND Technosoft" <${smtpConfig.name}>`,
            to: ownerEmail,
            subject: 'New Contact Form Submission',
            replyTo: email,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              <div style="background-color: #f7d400; padding: 40px 25px; text-align: center;">
                <img src="https://www.admin.rndtechnosoft.com/api/logo/download/headerLogo_1744447985780.webp" alt="RND Technosoft Logo" style="height: 65px; margin-bottom: 5px;">
              </div>
              <div style="padding: 30px; line-height: 1.6; color: #333; background-color: #ffffff;">
                <h2 style="color: #222; margin: 0 0 10px 0; font-size: 22px; font-weight: 700;">New Contact Form Submission</h2>
                <div style="width: 120px; height: 3px; background-color: #f7d400; margin-bottom: 25px;"></div>
                <p style="margin-top: 0; color: #666;">A new contact form was submitted. Details:</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; font-weight: bold; width: 35%;">Name:</td><td>${firstName} ${lastName}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Organisation:</td><td>${organisation || '—'}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Department:</td><td>${department || '—'}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Address:</td><td>${address || '—'}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${phone || '—'}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${email}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Callback Required:</td><td>${needCallback ? 'Yes' : 'No'}</td></tr>
                </table>
                <p style="margin-top: 20px; font-weight: bold;">Message:</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #ff573c; font-style: italic;">
                    ${message ? message.replace(/\n/g, '<br>') : '—'}
                </div>
              </div>
              <div style="background-color: #ffffff; padding: 25px 20px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #f0f0f0;">
                &copy; ${new Date().getFullYear()} RND Technosoft. All rights reserved.
              </div>
            </div>
            `,
        };
        await transporter.sendMail(ownerMailOptions);
    }

    // Send email notification to Customer
    if (email) {
        const rawBody = customerTemplate.body.replace("[First Name]", firstName || "Customer");
        const customerMailOptions = {
            from: `"RND Technosoft" <${smtpConfig.name}>`,
            to: email,
            subject: customerTemplate.subject,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #f7c600;">
                <img src="${logoImageUrl}" alt="RND Technosoft Logo" style="height: 50px; width: auto;">
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
    }

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Error submitting contact form' });
  }
};