const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getDashboardSummary, getEnergyData, getSavingsData,
    getEnvironmentalImpact,
} = require('../controllers/dashboardController');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/energy', getEnergyData);
router.get('/savings', getSavingsData);
router.get('/environmental-impact', getEnvironmentalImpact);

module.exports = router;
