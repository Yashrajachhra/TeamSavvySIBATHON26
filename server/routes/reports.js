const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateReport, listReports, downloadReport } = require('../controllers/reportsController');

router.use(protect);

router.post('/generate', generateReport);
router.get('/list', listReports);
router.get('/:id/download', downloadReport);

module.exports = router;
