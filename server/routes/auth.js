const express = require('express');
const router = express.Router();
const {
    register, login, googleAuth, getMe,
    updateProfile, refreshToken, forgotPassword,
    deleteAccount, completeOnboarding,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    registerSchema, loginSchema, googleAuthSchema,
    updateProfileSchema, onboardingSchema,
} = require('../validators/authValidators');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, validate(googleAuthSchema), googleAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.post('/onboarding', protect, validate(onboardingSchema), completeOnboarding);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;
