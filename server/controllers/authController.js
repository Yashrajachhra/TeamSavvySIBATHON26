const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const { getFirebaseAuth, initializeFirebase } = require('../config/firebase');

initializeFirebase();

const sendTokenResponse = async (user, statusCode, res) => {
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(statusCode).json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar,
                onboardingCompleted: user.onboardingCompleted,
                properties: user.properties,
                preferences: user.preferences,
            },
            token,
            refreshToken,
        },
    });
};

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
    const { email, password, fullName, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw ApiError.conflict('Email already registered');
    }

    const user = await User.create({
        email,
        password,
        fullName,
        phone,
        role,
    });

    await sendTokenResponse(user, 201, res);
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
        throw ApiError.forbidden('Account is suspended');
    }

    await sendTokenResponse(user, 200, res);
});

// POST /api/auth/google
exports.googleAuth = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    const firebaseAuth = getFirebaseAuth();

    let firebaseUser;
    if (firebaseAuth) {
        try {
            firebaseUser = await firebaseAuth.verifyIdToken(idToken);
        } catch {
            throw ApiError.unauthorized('Invalid Google token');
        }
    } else {
        // Demo mode — decode token without verification
        const decoded = jwt.decode(idToken);
        if (!decoded || !decoded.email) {
            throw ApiError.unauthorized('Invalid token format');
        }
        firebaseUser = {
            uid: decoded.sub || decoded.uid || `demo_${Date.now()}`,
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0],
            picture: decoded.picture || null,
        };
    }

    let user = await User.findOne({
        $or: [
            { firebaseUid: firebaseUser.uid },
            { email: firebaseUser.email },
        ],
    });

    if (!user) {
        user = await User.create({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.name || firebaseUser.email.split('@')[0],
            avatar: firebaseUser.picture,
            role: 'homeowner',
        });
    } else if (!user.firebaseUid) {
        user.firebaseUid = firebaseUser.uid;
        if (firebaseUser.picture && !user.avatar) {
            user.avatar = firebaseUser.picture;
        }
        await user.save();
    }

    await sendTokenResponse(user, 200, res);
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({
        success: true,
        data: { user },
    });
});

// PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
    const allowedUpdates = ['fullName', 'phone', 'avatar', 'address', 'preferences'];
    const updates = {};

    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
    });

    res.json({
        success: true,
        data: { user },
    });
});

// POST /api/auth/onboarding
exports.completeOnboarding = asyncHandler(async (req, res) => {
    const { fullName, phone, role, address, property, solarInterest, budgetRange } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) throw ApiError.notFound('User not found');

    user.fullName = fullName;
    user.phone = phone;
    user.role = role;
    user.address = address;

    const propertyData = {
        name: property.name || 'My Property',
        address: address,
        roofArea: property.roofArea,
        roofType: property.roofType,
        roofAngle: property.roofAngle,
        roofOrientation: property.roofOrientation,
        currentEnergyBill: property.currentEnergyBill,
        monthlyConsumption: property.monthlyConsumption,
    };

    if (user.properties.length === 0) {
        user.properties.push(propertyData);
    } else {
        user.properties[0] = { ...user.properties[0].toObject(), ...propertyData };
    }

    user.onboardingCompleted = true;
    await user.save();

    res.json({
        success: true,
        data: { user },
        message: 'Onboarding completed successfully',
    });
});

// POST /api/auth/refresh-token
exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw ApiError.badRequest('Refresh token is required');
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
        throw ApiError.unauthorized('Invalid refresh token');
    }

    await sendTokenResponse(user, 200, res);
});

// POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw ApiError.badRequest('Email is required');

    const user = await User.findOne({ email });
    if (!user) {
        // Don't reveal if user exists
        return res.json({
            success: true,
            message: 'If the email exists, a reset link has been sent',
        });
    }

    // In production, send actual reset email via nodemailer/SendGrid
    // For now, return success message
    res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
    });
});

// DELETE /api/auth/account
exports.deleteAccount = asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.user._id);

    res.json({
        success: true,
        message: 'Account deleted successfully',
    });
});
