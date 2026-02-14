const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getFinancingOptions, compareOptions, getSubsidies,
    applyForFinancing, simulateROI,
} = require('../controllers/financingController');

router.use(protect);

router.get('/options', getFinancingOptions);
router.post('/compare', compareOptions);
router.get('/subsidies', getSubsidies);
router.post('/apply', applyForFinancing);
router.post('/roi-simulation', simulateROI);

module.exports = router;
