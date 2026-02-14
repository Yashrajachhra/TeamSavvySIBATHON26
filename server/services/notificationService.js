const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

const getTransporter = () => {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transport = getTransporter();
        const info = await transport.sendMail({
            from: `"SmartSolar" <${process.env.FROM_EMAIL || 'noreply@smartsolar.com'}>`,
            to,
            subject,
            html,
            text,
        });
        logger.info('Email sent', { messageId: info.messageId, to });
        return info;
    } catch (error) {
        logger.error('Email send failed', { error: error.message, to });
        // Don't throw — email failure shouldn't break the app
        return null;
    }
};

const sendCleaningAlert = async (user, dustData) => {
    const urgencyColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
    const urgency = dustData.cleaningUrgency > 70 ? 'high' : dustData.cleaningUrgency > 40 ? 'medium' : 'low';

    return sendEmail({
        to: user.email,
        subject: `🧹 SmartSolar: ${urgency === 'high' ? 'Urgent' : 'Recommended'} Panel Cleaning Alert`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #eab308); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">☀️ SmartSolar</h1>
        </div>
        <div style="padding: 24px; background: white;">
          <h2>Panel Cleaning ${urgency === 'high' ? 'Required' : 'Recommended'}</h2>
          <div style="background: ${urgencyColors[urgency]}15; border-left: 4px solid ${urgencyColors[urgency]}; padding: 12px; border-radius: 4px; margin: 16px 0;">
            <strong style="color: ${urgencyColors[urgency]}">Urgency: ${urgency.toUpperCase()}</strong>
            <p>Efficiency loss: <strong>${dustData.efficiencyLoss}%</strong></p>
          </div>
          <p>Dear ${user.fullName},</p>
          <p>Our AI monitoring system has detected dust accumulation on your solar panels that is affecting energy production.</p>
          <ul>
            <li>Current dust level: <strong>${dustData.currentDustLevel?.toFixed(0)}%</strong></li>
            <li>Energy efficiency loss: <strong>${dustData.efficiencyLoss}%</strong></li>
            <li>Estimated recovery after cleaning: <strong>${dustData.efficiencyLoss}% gain</strong></li>
          </ul>
          <a href="${process.env.CLIENT_URL}/dashboard/maintenance" 
             style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            View Details & Schedule Cleaning
          </a>
        </div>
        <div style="padding: 12px; text-align: center; color: #9ca3af; font-size: 12px;">
          SmartSolar — AI-Powered Solar Intelligence
        </div>
      </div>
    `,
    });
};

const sendReportEmail = async (user, report) => {
    return sendEmail({
        to: user.email,
        subject: `📊 SmartSolar: Your ${report.title} is Ready`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #eab308); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">☀️ SmartSolar</h1>
        </div>
        <div style="padding: 24px; background: white;">
          <h2>${report.title}</h2>
          <p>Your solar performance report has been generated and is ready for download.</p>
          <a href="${process.env.CLIENT_URL}/dashboard/reports" 
             style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Download Report
          </a>
        </div>
      </div>
    `,
    });
};

module.exports = { sendEmail, sendCleaningAlert, sendReportEmail };
