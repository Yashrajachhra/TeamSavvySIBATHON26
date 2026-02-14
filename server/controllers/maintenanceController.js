const CleaningLog = require('../models/CleaningLog');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// GET /api/maintenance/dust-status?lat=...&lng=...
exports.getDustStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const property = user.properties[0];
    // Allow client to override location via query params
    const lat = parseFloat(req.query.lat) || property?.address?.coordinates?.lat || 28.6139;
    const lng = parseFloat(req.query.lng) || property?.address?.coordinates?.lng || 77.2090;

    // Calculate actual days since last cleaning from database
    const lastCleaning = await CleaningLog.findOne({ userId: req.user._id }).sort({ date: -1 });
    const daysSinceClean = lastCleaning
        ? Math.floor((Date.now() - new Date(lastCleaning.date).getTime()) / 86400000)
        : 30;

    let dustData;
    try {
        const response = await axios.get(
            `${AI_SERVICE_URL}/ai/dust/current/${lat}/${lng}`,
            { params: { days_since_cleaning: daysSinceClean }, timeout: 15000 }
        );
        dustData = response.data.data;
    } catch (err) {
        console.error('AI dust-status error:', err.message);
        // Deterministic formula-based fallback (no Math.random)
        // Uses a simplified version of the physics model when the AI service is down
        const baseSoilingRate = 0.15; // %/day, urban default
        const maxLoss = 40;
        const effLoss = +(maxLoss * (1 - Math.exp(-baseSoilingRate * daysSinceClean / maxLoss))).toFixed(1);
        const dustLevel = +Math.min(100, effLoss * 2.5).toFixed(1);
        const urgency = effLoss > 15 ? Math.min(100, 70 + effLoss) :
                        effLoss > 8  ? Math.min(100, 40 + effLoss * 2) :
                        effLoss > 3  ? Math.min(100, 10 + effLoss * 4) :
                        Math.max(0, effLoss * 3);

        dustData = {
            currentDustLevel: dustLevel,
            efficiencyLoss: effLoss,
            cleaningUrgency: +urgency.toFixed(1),
            dailySoilingRate: baseSoilingRate,
            weather: {
                temperature: null,
                humidity: null,
                windSpeed: null,
                aqi: null,
                pm25: null,
                pm10: null,
                description: 'unavailable',
                source: 'estimated',
            },
            daysSinceClean,
            dataSource: 'estimated',
        };
    }

    // Include location info for the client
    dustData.location = {
        lat,
        lng,
        city: property?.address?.city || 'Unknown',
        country: property?.address?.country || 'Unknown',
    };

    res.json({ success: true, data: dustData });
});

// GET /api/maintenance/cleaning-schedule?lat=...&lng=...
exports.getCleaningSchedule = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    // Allow client to override location via query params
    const lat = parseFloat(req.query.lat) || user.properties[0]?.address?.coordinates?.lat || 28.6139;
    const lng = parseFloat(req.query.lng) || user.properties[0]?.address?.coordinates?.lng || 77.2090;
    const capacityKw = user.solarSystems?.[0]?.capacity || 5.0;

    // Calculate actual days since last cleaning
    const lastCleaning = await CleaningLog.findOne({ userId: req.user._id }).sort({ date: -1 });
    const daysSinceClean = lastCleaning
        ? Math.floor((Date.now() - new Date(lastCleaning.date).getTime()) / 86400000)
        : 30;

    let schedule;
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/ai/dust/cleaning-schedule`, {
            lat, lng,
            user_id: req.user._id.toString(),
            days_since_cleaning: daysSinceClean,
            capacity_kw: capacityKw,
        }, { timeout: 20000 });
        schedule = response.data.data;
    } catch (err) {
        console.error('AI cleaning-schedule error:', err.message);
        // Deterministic formula-based fallback (no Math.random)
        const baseSoilingRate = 0.15;
        const maxLoss = 40;
        const effLoss = +(maxLoss * (1 - Math.exp(-baseSoilingRate * daysSinceClean / maxLoss))).toFixed(1);
        const urgency = daysSinceClean > 45 || effLoss > 12 ? 'high' :
                        daysSinceClean > 25 || effLoss > 5  ? 'medium' : 'low';

        const peakSunHours = Math.max(3, Math.min(7, 5.5 - Math.abs(Math.abs(lat) - 25) * 0.08));
        const dailyProduction = capacityKw * peakSunHours;
        const electricityRate = 55; // PKR default
        const cleaningCost = 1500;
        const dailyLossCost = dailyProduction * (effLoss / 100) * electricityRate;
        const daysUntilBreakeven = Math.max(1, cleaningCost / Math.max(dailyLossCost, 0.01));
        const nextCleanDays = Math.max(1, Math.min(7, Math.round(daysUntilBreakeven)));

        // Build deterministic 7-day forecast using increasing soiling
        const forecast = Array.from({ length: 7 }, (_, i) => {
            const futureDays = daysSinceClean + i;
            const futureEffLoss = +(maxLoss * (1 - Math.exp(-baseSoilingRate * futureDays / maxLoss))).toFixed(1);
            const futureDust = +Math.min(100, futureEffLoss * 2.5).toFixed(1);
            return {
                date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
                dustLevel: futureDust,
                efficiencyLoss: futureEffLoss,
                rain: false,
                rainProbability: 0,
                windMax: null,
                tempMax: null,
                aqi: null,
                recommendation: i === nextCleanDays - 1 ? 'good_day_to_clean' : 'wait',
            };
        });

        schedule = {
            recommendedDate: new Date(Date.now() + nextCleanDays * 86400000).toISOString().split('T')[0],
            urgency,
            estimatedRecovery: effLoss,
            currentEfficiencyLoss: effLoss,
            costBenefitRatio: +(dailyLossCost * 30 / Math.max(cleaningCost, 1)).toFixed(2),
            dailyLossCost: +dailyLossCost.toFixed(2),
            cleaningCost,
            electricityRate,
            currency: 'PKR',
            daysUntilBreakeven: +daysUntilBreakeven.toFixed(1),
            recommendation: `Clean panels within ${nextCleanDays} day(s) to recover ${effLoss}% efficiency`,
            forecast,
            calendarEvents: Array.from({ length: 6 }, (_, i) => ({
                date: new Date(Date.now() + (i + 1) * 30 * 86400000).toISOString().split('T')[0],
                type: 'recommended_cleaning',
                urgency: 'scheduled',
            })),
            dataSource: 'estimated',
        };
    }

    res.json({ success: true, data: schedule });
});

// POST /api/maintenance/log-cleaning
exports.logCleaning = asyncHandler(async (req, res) => {
    const { date, method, cost, efficiencyBefore, efficiencyAfter, notes, performedBy } = req.body;

    const log = await CleaningLog.create({
        userId: req.user._id,
        propertyIndex: req.body.propertyIndex || 0,
        date: date || new Date(),
        method: method || 'water_wash',
        cost: cost || 0,
        efficiencyBefore,
        efficiencyAfter,
        notes,
        performedBy: performedBy || 'self',
    });

    res.status(201).json({ success: true, data: { log } });
});

// GET /api/maintenance/history
exports.getMaintenanceHistory = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        CleaningLog.find({ userId: req.user._id }).sort({ date: -1 }).skip(skip).limit(limit),
        CleaningLog.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
        success: true,
        data: {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        },
    });
});

// PUT /api/maintenance/alert-preferences
exports.updateAlertPreferences = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { 'preferences.notifications': req.body },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: { preferences: user.preferences.notifications },
    });
});
