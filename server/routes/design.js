const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const {
    analyzeRoof, getPanelPlacement, getDesigns,
    getDesign, updateDesign, deleteDesign,
} = require('../controllers/designController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

router.use(protect);

// Accept both JSON and multipart (file upload) requests
router.post('/roof-analysis', (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        upload.single('file')(req, res, next);
    } else {
        next();
    }
}, analyzeRoof);
router.post('/panel-placement', getPanelPlacement);
router.get('/', getDesigns);
router.get('/:id', getDesign);
router.put('/:id', updateDesign);
router.delete('/:id', deleteDesign);

module.exports = router;
