const User = require('../models/User');
const FinancingOption = require('../models/FinancingOption');
const DesignConfig = require('../models/DesignConfig');
const CleaningLog = require('../models/CleaningLog');
const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/dashboard
exports.getAdminDashboard = asyncHandler(async (req, res) => {
    const [
        totalUsers, roleDistribution, totalProperties,
        totalDesigns, totalCleanings, recentUsers,
    ] = await Promise.all([
        User.countDocuments(),
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        User.aggregate([{ $project: { propCount: { $size: '$properties' } } }, { $group: { _id: null, total: { $sum: '$propCount' } } }]),
        DesignConfig.countDocuments(),
        CleaningLog.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(10).select('fullName email role createdAt isActive'),
    ]);

    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 86400000) } });

    // Monthly user growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const userGrowth = await User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                count: { $sum: 1 },
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const roles = {};
    roleDistribution.forEach(r => { roles[r._id] = r.count; });

    res.json({
        success: true,
        data: {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            roles,
            totalProperties: totalProperties[0]?.total || 0,
            totalDesigns,
            totalCleanings,
            userGrowth,
            recentUsers,
        },
    });
});

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const filter = {};
    if (search) {
        filter.$or = [
            { fullName: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') },
        ];
    }
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'suspended') filter.isActive = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
        User.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: {
            users,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
        },
    });
});

// GET /api/admin/users/:id
exports.getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('User not found');

    const designs = await DesignConfig.find({ userId: user._id }).select('name status createdAt');
    const cleanings = await CleaningLog.find({ userId: user._id }).sort({ date: -1 }).limit(10);

    res.json({ success: true, data: { user, designs, cleanings } });
});

// PUT /api/admin/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
    const { role, fullName, email } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) throw ApiError.notFound('User not found');
    res.json({ success: true, data: { user } });
});

// PUT /api/admin/users/:id/suspend
exports.suspendUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('User not found');
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: { user }, message: user.isActive ? 'User activated' : 'User suspended' });
});

// GET /api/admin/financing
exports.getFinancingAdmin = asyncHandler(async (req, res) => {
    const options = await FinancingOption.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { options } });
});

// POST /api/admin/financing
exports.createFinancingOption = asyncHandler(async (req, res) => {
    const option = await FinancingOption.create(req.body);
    res.status(201).json({ success: true, data: { option } });
});

// PUT /api/admin/financing/:id
exports.updateFinancingOption = asyncHandler(async (req, res) => {
    const option = await FinancingOption.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!option) throw ApiError.notFound('Financing option not found');
    res.json({ success: true, data: { option } });
});

// DELETE /api/admin/financing/:id
exports.deleteFinancingOption = asyncHandler(async (req, res) => {
    const option = await FinancingOption.findByIdAndDelete(req.params.id);
    if (!option) throw ApiError.notFound('Financing option not found');
    res.json({ success: true, message: 'Financing option deleted' });
});

// GET /api/admin/system-health
exports.getSystemHealth = asyncHandler(async (req, res) => {
    const dbStatus = require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected';

    res.json({
        success: true,
        data: {
            api: { status: 'healthy', uptime: process.uptime() },
            database: { status: dbStatus },
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            timestamp: new Date().toISOString(),
        },
    });
});
