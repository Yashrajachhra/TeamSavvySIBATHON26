const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw ApiError.unauthorized('Not authorized — no token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-__v');
        if (!user) {
            throw ApiError.unauthorized('User no longer exists');
        }
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.unauthorized('Not authorized — invalid token');
    }
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw ApiError.unauthorized('Not authorized');
        }
        if (!roles.includes(req.user.role)) {
            throw ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource`);
        }
        next();
    };
};

module.exports = { protect, authorize };
