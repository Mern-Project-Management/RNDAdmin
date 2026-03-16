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
    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port || 465,
        secure: smtpConfig.isSSL,
        auth: {
        user: smtpConfig.name,
        pass: smtpConfig.password,
        },
    });

    // Send email notification to Admin (Owner)
    const ownerEmail = smtpConfig.name; // Fallback to SMTP user email
    if (ownerEmail) {
        const ownerMailOptions = {
            from: `"Your Business Name" <${smtpConfig.name}>`,
            to: ownerEmail,
            subject: 'New Contact Form Submission',
            replyTo: email,
            html: `
            <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px;">
                <h2>New Contact Form Submission</h2>
                <p>A new contact form was submitted. Details:</p>
                <ul>
                    <li>Name: ${firstName} ${lastName}</li>
                    <li>Organisation: ${organisation || '—'}</li>
                    <li>Department: ${department || '—'}</li>
                    <li>Address: ${address || '—'}</li>
                    <li>Phone: ${phone || '—'}</li>
                    <li>Email: ${email}</li>
                    <li>Callback Required: ${needCallback ? 'Yes' : 'No'}</li>
                </ul>
                <p>Message: <br/>${message ? message.replace(/\n/g, '<br>') : '—'}</p>
            </div>
            `,
        };
        await transporter.sendMail(ownerMailOptions);
    }

    // Send email notification to Customer
    if (email) {
        const customerMailOptions = {
            from: `"RND Technosoft" <${smtpConfig.name}>`,
            to: email,
            subject: customerTemplate.subject,
            html: customerTemplate.body.replace("[First Name]", firstName || "Customer"),
        };
        await transporter.sendMail(customerMailOptions);
    }

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Error submitting contact form' });
  }
};