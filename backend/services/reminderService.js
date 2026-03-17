const cron = require('node-cron');
const Message = require('../model/followUp');
const Inquiry = require('../model/inquiry');
const axios = require('axios');
const nodemailer = require('nodemailer');

const startReminderService = () => {
  // Schedule a task to run every day at 10:00 AM
  // 0 10 * * *
  cron.schedule('0 10 * * *', async () => {
    console.log('Running daily follow-up email reminder job...');
    await sendTodayReminders();
  });
  
  // Also run once on startup to check for today's reminders if needed
  // For safety, let's just keep it on schedule unless requested otherwise.
  console.log('Reminder service initialized. Scheduled to run daily at 9:00 AM.');
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

        // Fetch SMTP and Template (assuming we reuse the logic from controller/followup.js)
        const { data: smtpResponse } = await axios.get("https://www.admin.rndtechnosoft.com/api/smtp/get");
        const smtpConfig = smtpResponse.data?.[0];

        const { data: emailTemplateResponse } = await axios.get("https://www.admin.rndtechnosoft.com/api/template/get");
        const emailTemplates = emailTemplateResponse.data;
        const followUpTemplate = emailTemplates?.find(t => t.name === "Follow Up");

        if (!smtpConfig || !followUpTemplate) {
            console.error('SMTP or Follow Up template not found. Skipping reminders.');
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
        const logoImageUrl = "https://rndtechnosoft.com/api/logo/download/rndlogo.png";

        for (const followUp of followUps) {
            const inquiry = followUp.inquiryId;
            if (!inquiry || !inquiry.email) continue;

            try {
                const rawBody = followUpTemplate.body
                    .replace("[First Name]", inquiry.firstName || "Customer")
                    .replace("[Message]", followUp.message.replace(/\n/g, '<br/>'));

                const emailBody = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #ff573c;">
                            <img src="${logoImageUrl}" alt="RND Technosoft Logo" style="height: 50px; width: auto;">
                        </div>
                        <div style="padding: 30px; line-height: 1.6; color: #333;">
                            <p><strong>Reminder:</strong> Your follow-up is scheduled for today.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            ${rawBody}
                        </div>
                        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee;">
                            &copy; ${new Date().getFullYear()} RND Technosoft. All rights reserved.
                        </div>
                    </div>
                `;

                await transporter.sendMail({
                    from: `"RND Technosoft" <${smtpConfig.name}>`,
                    to: inquiry.email,
                    subject: followUpTemplate.subject || "Reminder Regarding Your Inquiry - RND Technosoft",
                    html: emailBody,
                });

                console.log(`Reminder email sent successfully to: ${inquiry.email}`);
            } catch (err) {
                console.error(`Failed to send reminder for inquiry ${inquiry._id}:`, err.message);
            }
        }
    } catch (error) {
        console.error('Error in sendTodayReminders:', error.message);
    }
};

module.exports = { startReminderService, sendTodayReminders };
