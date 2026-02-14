const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getDustStatus, getCleaningSchedule, logCleaning,
    getMaintenanceHistory, updateAlertPreferences,
} = require('../controllers/maintenanceController');

router.use(protect);

router.get('/dust-status', getDustStatus);
router.get('/cleaning-schedule', getCleaningSchedule);
router.post('/log-cleaning', logCleaning);
router.get('/history', getMaintenanceHistory);
router.put('/alert-preferences', updateAlertPreferences);

module.exports = router;
