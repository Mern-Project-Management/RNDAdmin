const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Message = require('../model/followUp');
const Inquiry = require('../model/inquiry');
const EmailTemplate = require('../model/emailTemplate');
const SmtpSetting = require('../model/smtp_setting');
const ContactInfo = require('../model/contactinfo');

const startReminderService = () => {
  // Schedule a task for rapid testing: Every 60 seconds
  cron.schedule('0 10 * * *', async () => {
    console.log('Running daily follow-up email reminder job at 10:00 AM...');
    await sendTodayReminders();
  });
  
  console.log('Reminder service initialized. Scheduled to run daily at 10:00 AM.');
};

const sendTodayReminders = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Find follow-ups where the scheduled date is today
        const followUps = await Message.find({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('inquiryId');

        if (followUps.length === 0) {
            console.log('No follow-up reminders due today.');
            return;
        }

        console.log(`Found ${followUps.length} follow-up(s) for today. Sending emails...`);

        // Fetch SMTP and Template DIRECTLY from DB
        const smtpConfig = await SmtpSetting.findOne({ isDefault: true }) || await SmtpSetting.findOne();
        const followUpTemplate = await EmailTemplate.findOne({ name: "Follow Up" });

        if (!smtpConfig || !followUpTemplate) {
            console.error('SMTP or Follow Up template not found in DB. Skipping reminders.');
            return;
        }

        const isSSL = smtpConfig.isSSL === true || smtpConfig.isSSL === 'true';
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

        const transporter = nodemailer.createTransport(transportConfig);

        // Fetch Office Email from Contact Info as secondary fallback
        let officeEmail = 'info@rndtechnosoft.com';
        try {
            const contactRes = await ContactInfo.findOne();
            if (contactRes?.emails?.[0]) {
                officeEmail = contactRes.emails[0];
            }
        } catch (err) {
            // Silently fallback to info@rndtechnosoft.com
        }

        // --- Recipient Priority ---
        // 1. Template's toEmail (Specific setting)
        // 2. SMTP Name/Email (General account)
        // 3. Fallback to office email / info@rndtechnosoft.com
        const targetRecipient = followUpTemplate.toEmail || smtpConfig.name || officeEmail || 'info@rndtechnosoft.com';

        for (const followUp of followUps) {
            const inquiry = followUp.inquiryId;
            if (!inquiry) continue;

            try {
                const rawBody = followUpTemplate.body
                    .replace(/\[First Name\]/g, inquiry.firstName || inquiry.name || "Customer")
                    .replace(/\[Message\]/g, followUp.message.replace(/\n/g, '<br/>'));

                const emailBody = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8">
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet">
                    <style>
                      body { font-family: 'Instrument Sans', sans-serif; background-color: #ffffff; padding: 20px 0; margin: 0; }
                      .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #eeeeee; }
                      .header-brand { background-color: #111111; padding: 30px 20px; text-align: center; border-bottom: 4px solid #ffd333; }
                      .logo-img { max-width: 180px; height: auto; display: block; margin: 0 auto; }
                      .content-body { padding: 40px; color: #333333; font-size: 16px; line-height: 1.8; }
                      .h2-title { color: #111111; margin-top: 0; margin-bottom: 25px; border-left: 5px solid #ffd333; padding-left: 15px; font-size: 24px; font-weight: bold; }
                      .footer { padding: 25px 40px; background-color: #ffd333; text-align: center; font-size: 14px; color: #111111; }
                      .footer a { color: #111111; text-decoration: underline; font-weight: 700; }
                    </style>
                  </head>
                  <body>
                    <div class="email-container">
                      <div class="header-brand">
                        <img src="https://rndtechnosoft.com/assets/imgs/logo/logo-1.png" class="logo-img" alt="RND Technosoft Logo"/>
                      </div>
                      <div class="content-body">
                        ${rawBody}
                      </div>
                      <div class="footer">
                        &copy; ${new Date().getFullYear()} <a href="https://rndtechnosoft.com">RND Technosoft</a>. All rights reserved.
                      </div>
                    </div>
                  </body>
                  </html>
                `;

                await transporter.sendMail({
                    from: `"RND Technosoft" <${smtpUser}>`,
                    to: targetRecipient,
                    subject: followUpTemplate.subject || `Follow-up: ${inquiry.name}`,
                    html: emailBody,
                });

                console.log(`Reminder email sent successfully to: ${targetRecipient}`);
            } catch (err) {
                console.error(`Failed to send reminder for inquiry ${inquiry._id}:`, err.message);
            }
        }
    } catch (error) {
        console.error('Error in sendTodayReminders:', error.message);
    }
};

module.exports = { startReminderService, sendTodayReminders };
