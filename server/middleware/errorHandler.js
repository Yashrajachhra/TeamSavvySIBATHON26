const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, _next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = ApiError.conflict(`${field} already exists`);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        error = ApiError.badRequest('Validation failed', errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = ApiError.unauthorized('Token expired');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};

module.exports = errorHandler;
