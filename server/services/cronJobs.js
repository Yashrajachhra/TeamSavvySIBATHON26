const cron = require('node-cron');
const axios = require('axios');
const User = require('../models/User');
const { sendCleaningAlert } = require('./notificationService');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Daily dust check at 8 AM
const startDustMonitoringJob = () => {
    cron.schedule('0 8 * * *', async () => {
        logger.info('Running daily dust monitoring job');
        try {
            const users = await User.find({
                isActive: true,
                onboardingCompleted: true,
                'preferences.notifications.cleaningAlerts': true,
                'properties.0': { $exists: true },
            });

            for (const user of users) {
                try {
                    const property = user.properties[0];
                    const lat = property.address?.coordinates?.lat;
                    const lng = property.address?.coordinates?.lng;
                    if (!lat || !lng) continue;

                    let dustData;
                    try {
                        const response = await axios.get(`${AI_SERVICE_URL}/ai/dust/current/${lat}/${lng}`, { timeout: 5000 });
                        dustData = response.data.data;
                    } catch {
                        continue; // Skip if AI service is down
                    }

                    // Send alert if urgency > 60
                    if (dustData.cleaningUrgency > 60) {
                        await sendCleaningAlert(user, dustData);
                        logger.info('Sent cleaning alert', { userId: user._id, urgency: dustData.cleaningUrgency });
                    }
                } catch (err) {
                    logger.error('Error processing user for dust monitoring', { userId: user._id, error: err.message });
                }
            }
        } catch (err) {
            logger.error('Dust monitoring job failed', { error: err.message });
        }
    });

    logger.info('Dust monitoring cron job scheduled (daily at 8 AM)');
};

// Monthly report generation on 1st of each month
const startMonthlyReportJob = () => {
    cron.schedule('0 9 1 * *', async () => {
        logger.info('Running monthly report generation job');
        // Report generation logic would go here
    });

    logger.info('Monthly report cron job scheduled (1st of month at 9 AM)');
};

const startAllJobs = () => {
    startDustMonitoringJob();
    startMonthlyReportJob();
};

module.exports = { startAllJobs };
