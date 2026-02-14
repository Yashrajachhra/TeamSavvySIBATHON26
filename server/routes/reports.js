const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateReport, listReports, downloadReport, previewReport, deleteReport } = require('../controllers/reportsController');

router.use(protect);

router.post('/generate', generateReport);
router.get('/list', listReports);
router.get('/:id/preview', previewReport);
router.get('/:id/download', downloadReport);
router.delete('/:id', deleteReport);

module.exports = router;
