const User = require('../models/User');
const DesignConfig = require('../models/DesignConfig');
const CleaningLog = require('../models/CleaningLog');
const asyncHandler = require('../utils/asyncHandler');

/* ============================================================
   SOLAR PHYSICS HELPERS — deterministic, location-aware
   ============================================================ */

/**
 * Calculate Peak Sun Hours (PSH) for a given latitude & month.
 * Uses solar geometry (declination, day length, atmospheric extinction).
 * Returns realistic PSH values matching NASA/NREL data within ~10%.
 */
function monthlyPeakSunHours(latDeg) {
    const lat = Math.abs(latDeg);
    const RAD = Math.PI / 180;

    // Day-of-year for the 15th of each month
    const midMonthDOY = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349];

    return midMonthDOY.map(doy => {
        // Solar declination (Cooper's equation)
        const decl = 23.45 * Math.sin(RAD * (360 / 365) * (doy + 284));
        const declRad = decl * RAD;
        const latRad = lat * RAD;

        // Sunset hour angle
        const cosOmega = -Math.tan(latRad) * Math.tan(declRad);
        const omega = Math.acos(Math.max(-1, Math.min(1, cosOmega)));

        // Day length in hours
        const dayLength = (2 * omega) / (15 * RAD);

        // Extraterrestrial irradiation factor
        const Gon = 1367 * (1 + 0.033 * Math.cos(RAD * 360 * doy / 365)); // W/m²

        // Daily extraterrestrial radiation on horizontal (Ho) in kWh/m²
        const Ho = (24 / Math.PI) * (Gon / 1000) *
            (Math.cos(latRad) * Math.cos(declRad) * Math.sin(omega) +
             omega * Math.sin(latRad) * Math.sin(declRad));

        // Clearness index (Kt) — varies by climate
        // Tropical/arid: 0.55-0.65, Temperate: 0.45-0.55, High lat: 0.35-0.45
        let Kt;
        if (lat < 20) Kt = 0.58;
        else if (lat < 35) Kt = 0.52;
        else if (lat < 50) Kt = 0.45;
        else Kt = 0.38;

        // Global Horizontal Irradiation = Ho * Kt
        const GHI = Ho * Kt;

        // PSH ≈ GHI (since 1 PSH = 1 kWh/m²)
        // Adjust for tilted surface (panels tilted at latitude angle): ~10-15% gain in winter, slight loss in summer
        const tiltGain = 1 + 0.08 * (1 - dayLength / 12);
        const PSH = Math.max(1.5, Math.min(8.5, GHI * tiltGain));

        return Math.round(PSH * 100) / 100;
    });
}

/**
 * Get current month's PSH and today's estimated production.
 */
/**
 * Calculate sunrise and sunset hours from latitude and day-of-year
 * using solar geometry (hour angle method).
 */
function getSunriseSunset(latDeg) {
    const RAD = Math.PI / 180;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const doy = Math.floor((now - start) / 86400000);

    // Solar declination
    const decl = 23.45 * Math.sin(RAD * (360 / 365) * (doy + 284));
    const declRad = decl * RAD;
    const latRad = Math.abs(latDeg) * RAD;

    // Sunset hour angle
    const cosOmega = -Math.tan(latRad) * Math.tan(declRad);
    const omega = Math.acos(Math.max(-1, Math.min(1, cosOmega)));
    const halfDayHours = (omega / RAD) / 15;

    // Solar noon is ~12:00 (ignoring longitude-based equation of time for simplicity)
    const sunrise = Math.max(4, 12 - halfDayHours);
    const sunset = Math.min(20, 12 + halfDayHours);

    return { sunrise: Math.round(sunrise * 100) / 100, sunset: Math.round(sunset * 100) / 100 };
}

function getTodayEstimate(latDeg, capacityKw, systemLosses, soilingLoss) {
    const monthlyPSH = monthlyPeakSunHours(latDeg);
    const currentMonth = new Date().getMonth(); // 0-based
    const psh = monthlyPSH[currentMonth];

    // Hour-of-day solar curve (bell curve peaking at solar noon)
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    const { sunrise, sunset } = getSunriseSunset(latDeg);

    let todaySoFar = 0;
    let fullDay = 0;
    for (let h = sunrise; h <= sunset; h += 0.5) {
        // Solar intensity follows a sinusoidal curve
        const dayFraction = (h - sunrise) / (sunset - sunrise);
        const intensity = Math.sin(dayFraction * Math.PI);
        const hourlyProd = capacityKw * intensity * (psh / 5.0) * (1 - systemLosses) * (1 - soilingLoss) * 0.5; // 0.5 for half-hour step
        fullDay += hourlyProd;
        if (h <= hour) {
            todaySoFar += hourlyProd;
        }
    }

    return {
        todaySoFar: Math.round(todaySoFar * 10) / 10,
        fullDayEstimate: Math.round(fullDay * 10) / 10,
        currentPSH: psh,
        sunrise: Math.round(sunrise * 10) / 10,
        sunset: Math.round(sunset * 10) / 10,
    };
}

/**
 * Calculate monthly production for the full year.
 */
function yearlyProductionBreakdown(latDeg, capacityKw, systemLosses, soilingLoss) {
    const monthlyPSH = monthlyPeakSunHours(latDeg);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    return monthNames.map((name, i) => {
        const produced = Math.round(capacityKw * monthlyPSH[i] * daysInMonth[i] * (1 - systemLosses) * (1 - soilingLoss));
        const consumed = Math.round(produced * (0.65 + 0.1 * Math.sin(i * Math.PI / 6))); // Self-consumption ~65-75%
        const exported = produced - consumed;
        return { month: name, produced, consumed, exported: Math.max(0, exported) };
    });
}

/**
 * Generate hourly production curve for today.
 */
function todayHourlyCurve(latDeg, capacityKw, systemLosses, soilingLoss) {
    const monthlyPSH = monthlyPeakSunHours(latDeg);
    const currentMonth = new Date().getMonth();
    const psh = monthlyPSH[currentMonth];
    const { sunrise, sunset } = getSunriseSunset(latDeg);
    const startHour = Math.floor(sunrise);
    const endHour = Math.ceil(sunset);

    const hours = [];
    for (let h = startHour; h <= endHour; h++) {
        const dayFraction = Math.max(0, Math.min(1, (h - sunrise) / (sunset - sunrise)));
        const intensity = Math.sin(dayFraction * Math.PI);
        const production = Math.round(capacityKw * intensity * (psh / 5.0) * (1 - systemLosses) * (1 - soilingLoss) * 100) / 100;
        hours.push({
            hour: `${h}:00`,
            production: Math.max(0, production),
        });
    }
    return hours;
}

/**
 * Generate weekly production data.
 */
function weeklyProductionData(latDeg, capacityKw, systemLosses, soilingLoss, electricityRate = 55) {
    const monthlyPSH = monthlyPeakSunHours(latDeg);
    const currentMonth = new Date().getMonth();
    const psh = monthlyPSH[currentMonth];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay(); // 0=Sun

    // Slight daily variation (cloud cover etc) — deterministic based on day-of-year
    const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

    return days.map((day, i) => {
        // Use a deterministic "weather" factor based on day-of-year
        const seed = (doy - today + i + 1) * 7 + currentMonth;
        const weatherFactor = 0.75 + 0.25 * Math.abs(Math.sin(seed * 1.37));
        const dailyProd = Math.round(capacityKw * psh * weatherFactor * (1 - systemLosses) * (1 - soilingLoss) * 10) / 10;
        return {
            day,
            production: dailyProd,
            savings: Math.round(dailyProd * electricityRate),
        };
    });
}

/**
 * Electricity rate and CO2 factor by region.
 */
function getRegionFactors(lat, lng) {
    // Pakistan
    if (23 <= lat && lat <= 37 && 60 <= lng && lng <= 78) {
        return { electricityRate: 55, currency: 'PKR', co2Factor: 0.38, country: 'Pakistan' };
    }
    // India
    if (8 <= lat && lat <= 35 && 68 <= lng && lng <= 97) {
        return { electricityRate: 8, currency: 'INR', co2Factor: 0.82, country: 'India' };
    }
    // UAE / Gulf
    if (20 <= lat && lat <= 30 && 50 <= lng && lng <= 60) {
        return { electricityRate: 0.35, currency: 'AED', co2Factor: 0.45, country: 'UAE' };
    }
    // Europe
    if (35 <= lat && lat <= 65 && -10 <= lng && lng <= 40) {
        return { electricityRate: 0.3, currency: 'EUR', co2Factor: 0.30, country: 'Europe' };
    }
    // USA
    if (25 <= lat && lat <= 50 && -130 <= lng && lng <= -60) {
        return { electricityRate: 0.15, currency: 'USD', co2Factor: 0.42, country: 'USA' };
    }
    // Default (Pakistan)
    return { electricityRate: 55, currency: 'PKR', co2Factor: 0.5, country: 'Unknown' };
}


/* ============================================================
   API ENDPOINTS
   ============================================================ */

// GET /api/dashboard/summary
exports.getDashboardSummary = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const designs = await DesignConfig.find({ userId: req.user._id, status: { $ne: 'draft' } }).sort({ updatedAt: -1 });
    const cleanings = await CleaningLog.find({ userId: req.user._id }).sort({ date: -1 }).limit(5);

    const property = user.properties?.[0];
    const activeSystem = user.solarSystems?.find(s => s.status === 'active');
    const latestDesign = designs[0];

    // Location priority: Design location > query params > user profile > defaults
    const lat = latestDesign?.location?.lat
        || parseFloat(req.query.lat)
        || property?.address?.coordinates?.lat
        || 28.6139;
    const lng = latestDesign?.location?.lng
        || parseFloat(req.query.lng)
        || property?.address?.coordinates?.lng
        || 77.2090;
    const designPanel = latestDesign?.panelPlacement;
    const designIrradiance = latestDesign?.solarIrradiance;
    const designShadow = latestDesign?.shadowAnalysis;
    const designFinancial = latestDesign?.financialEstimate;
    const designRoof = latestDesign?.roofAnalysis;

    // ---- Data source priority: Design > Active System > Defaults ----
    const dataSource = latestDesign ? 'design' : activeSystem ? 'system' : 'default';

    // System parameters — prefer design data
    const capacityKw = designPanel?.totalCapacity || activeSystem?.capacity || 5;
    const panelCount = designPanel?.panelCount || activeSystem?.panelCount || Math.round(capacityKw / 0.4);
    // Calculate actual wattage from capacity/count, or use design, or default
    const panelWattage = designPanel?.panelWattage
        || (capacityKw > 0 && panelCount > 0 ? Math.round(capacityKw * 1000 / panelCount) : 400);
    const panelModel = designPanel?.panelModel || activeSystem?.panelModel || `Standard ${panelWattage}W`;
    const tiltAngle = designPanel?.tiltAngle || property?.roofAngle || Math.round(Math.abs(lat) * 0.9);
    const azimuthAngle = designPanel?.azimuthAngle || (lat >= 0 ? 180 : 0); // south in N hemisphere

    // System losses — from design or default 15%
    const designSystemLossPct = designPanel?.systemLosses; // may be stored as 20 (percent)
    const systemLosses = designSystemLossPct ? designSystemLossPct / 100 : 0.15;

    // Shadow losses — from design analysis
    const shadowLoss = designShadow?.annualShadowLoss ? designShadow.annualShadowLoss / 100 : 0;

    // Age & degradation
    const yearsActive = activeSystem?.installedDate
        ? (Date.now() - new Date(activeSystem.installedDate).getTime()) / (365.25 * 24 * 3600 * 1000)
        : 0.5;
    const degradation = 1 - 0.005 * yearsActive; // 0.5% per year

    // Dust/soiling from cleaning history
    const lastCleaning = cleanings[0];
    const daysSinceClean = lastCleaning
        ? Math.floor((Date.now() - new Date(lastCleaning.date).getTime()) / 86400000)
        : 30;
    const soilingLoss = Math.min(0.30, daysSinceClean * 0.003); // ~0.3% per day, max 30%

    // Combined losses: system + soiling + shadow
    const effectiveLosses = Math.min(0.80, systemLosses + soilingLoss * (1 - systemLosses) + shadowLoss * (1 - systemLosses));

    // Effective capacity after degradation
    const effectiveCapacity = capacityKw * degradation;

    // ---- Monthly PSH: prefer design irradiance data ----
    // designIrradiance.monthlyValues stores 12 monthly PSH values from NASA POWER API
    const hasDesignIrradiance = designIrradiance?.monthlyValues?.length === 12;
    const monthlyPSH = hasDesignIrradiance
        ? designIrradiance.monthlyValues
        : monthlyPeakSunHours(lat);
    const currentMonth = new Date().getMonth();
    const currentPSH = designIrradiance?.peakSunHours || monthlyPSH[currentMonth];

    // ---- Energy calculations ----
    const today = getTodayEstimate(lat, effectiveCapacity, effectiveLosses, 0);
    // Override PSH with design data if available
    if (hasDesignIrradiance) {
        const pshRatio = monthlyPSH[currentMonth] / (monthlyPeakSunHours(lat)[currentMonth] || 4);
        today.todaySoFar = Math.round(today.todaySoFar * pshRatio * 10) / 10;
        today.fullDayEstimate = Math.round(today.fullDayEstimate * pshRatio * 10) / 10;
        today.currentPSH = monthlyPSH[currentMonth];
    }

    // Monthly breakdown — use design irradiance if available
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let monthlyBreakdown;

    if (hasDesignIrradiance) {
        // Use actual design irradiance values for each month
        monthlyBreakdown = monthNames.map((name, i) => {
            const produced = Math.round(effectiveCapacity * monthlyPSH[i] * daysInMonth[i] * (1 - effectiveLosses));
            const consumed = Math.round(produced * (0.65 + 0.1 * Math.sin(i * Math.PI / 6)));
            const exported = Math.max(0, produced - consumed);
            return { month: name, produced, consumed, exported };
        });
    } else {
        monthlyBreakdown = yearlyProductionBreakdown(lat, effectiveCapacity, effectiveLosses, 0);
    }

    // If design has estimatedAnnualProduction, cross-check and scale
    const designAnnualProd = designPanel?.estimatedAnnualProduction;
    let yearlyTotal = monthlyBreakdown.reduce((sum, m) => sum + m.produced, 0);

    if (designAnnualProd && designAnnualProd > 0) {
        // Scale production to match design estimate (adjusted for current soiling + degradation)
        // Design estimate is for clean panels at full capacity; adjust for current conditions
        const cleanYearlyEstimate = designAnnualProd;
        const currentConditionFactor = degradation * (1 - soilingLoss) / (1 - systemLosses - shadowLoss);
        const adjustedDesignEstimate = Math.round(cleanYearlyEstimate * Math.min(1, currentConditionFactor));

        // Use the design estimate if it's reasonably close (within 50%), otherwise keep physics calc
        if (adjustedDesignEstimate > yearlyTotal * 0.5 && adjustedDesignEstimate < yearlyTotal * 2) {
            const scaleFactor = adjustedDesignEstimate / yearlyTotal;
            monthlyBreakdown.forEach(m => {
                m.produced = Math.round(m.produced * scaleFactor);
                m.consumed = Math.round(m.consumed * scaleFactor);
                m.exported = Math.max(0, m.produced - m.consumed);
            });
            yearlyTotal = adjustedDesignEstimate;
        }
    }

    const monthlyTotal = monthlyBreakdown[currentMonth].produced;
    const dailyAvg = Math.round(yearlyTotal / 365 * 10) / 10;

    // ---- Financial (design > region defaults) ----
    const region = getRegionFactors(lat, lng);

    // ---- Weekly data ----
    const weeklyData = weeklyProductionData(lat, effectiveCapacity, effectiveLosses, 0, region.electricityRate);

    const monthlySavings = Math.round(monthlyTotal * region.electricityRate);
    const lifetimeSavings = Math.round(monthlySavings * Math.max(yearsActive * 12, 1));

    // System cost — prefer design financial data
    const costPerKw = region.currency === 'PKR' ? 150000 :
                      region.currency === 'INR' ? 50000 :
                      region.currency === 'AED' ? 3500 :
                      region.currency === 'EUR' ? 1200 :
                      region.currency === 'USD' ? 1000 : 150000;
    const systemCost = designFinancial?.systemCost || capacityKw * costPerKw;
    const annualSavings = designFinancial?.annualSavings || monthlySavings * 12;
    const breakEvenYears = designFinancial?.breakEvenYears || (annualSavings > 0 ? systemCost / annualSavings : 99);

    // ---- Energy distribution ----
    // Use user's monthly consumption if available for more accurate self-consumption estimate
    const monthlyConsumption = property?.monthlyConsumption || 0;
    let selfConsumedPct, exportedPct, gridImportPct;
    if (monthlyConsumption > 0 && monthlyTotal > 0) {
        // Real self-consumption: how much of production the house uses
        const selfConsumedKwh = Math.min(monthlyTotal, monthlyConsumption * 0.75); // ~75% temporal overlap
        selfConsumedPct = Math.round((selfConsumedKwh / monthlyTotal) * 100);
        exportedPct = 100 - selfConsumedPct;
        gridImportPct = Math.max(0, Math.round(((monthlyConsumption - selfConsumedKwh) / monthlyConsumption) * 100));
        // Normalize to 100%
        const total = selfConsumedPct + exportedPct + gridImportPct;
        if (total > 0 && total !== 100) {
            const scale = 100 / total;
            selfConsumedPct = Math.round(selfConsumedPct * scale);
            exportedPct = Math.round(exportedPct * scale);
            gridImportPct = 100 - selfConsumedPct - exportedPct;
        }
    } else {
        selfConsumedPct = Math.round(65 + Math.min(15, daysSinceClean * 0.3));
        exportedPct = Math.max(0, 100 - selfConsumedPct - 8);
        gridImportPct = 100 - selfConsumedPct - exportedPct;
    }

    // ---- System health ----
    const overallEfficiency = Math.round((1 - effectiveLosses) * degradation * 1000) / 10;

    // ---- Environmental ----
    const co2PerYear = (yearlyTotal * region.co2Factor) / 1000; // tons
    const totalCo2 = designFinancial?.co2Offset || co2PerYear * Math.max(yearsActive, 1);

    res.json({
        success: true,
        data: {
            energy: {
                todaySoFar: today.todaySoFar,
                todayEstimate: today.fullDayEstimate,
                currentPSH: today.currentPSH,
                monthlyTotal,
                yearlyTotal,
                dailyAvg,
                capacity: capacityKw,
                monthlyBreakdown,
                weeklyData,
                hourlyToday: todayHourlyCurve(lat, effectiveCapacity, effectiveLosses, 0),
            },
            financial: {
                monthlySavings,
                annualSavings,
                lifetimeSavings: designFinancial?.lifetimeSavings || lifetimeSavings,
                systemCost,
                breakEvenYears: Math.round(breakEvenYears * 10) / 10,
                breakEvenProgress: Math.min(100, Math.round(yearsActive / breakEvenYears * 1000) / 10),
                electricityRate: region.electricityRate,
                currency: region.currency,
                country: region.country,
            },
            distribution: {
                selfConsumed: selfConsumedPct,
                exported: exportedPct,
                gridImport: gridImportPct,
            },
            systemHealth: {
                efficiency: overallEfficiency,
                dustLevel: daysSinceClean > 25 ? 'high' : daysSinceClean > 12 ? 'medium' : 'low',
                daysSinceClean,
                nextCleaningDate: new Date(Date.now() + Math.max(1, 30 - daysSinceClean) * 86400000).toISOString(),
                panelCount,
                panelWattage,
                panelModel,
                tiltAngle,
                azimuthAngle,
                soilingLoss: Math.round(soilingLoss * 1000) / 10,
                shadowLoss: Math.round(shadowLoss * 1000) / 10,
                degradation: Math.round((1 - degradation) * 1000) / 10,
                systemLosses: Math.round(systemLosses * 100),
            },
            environmental: {
                co2Offset: Math.round(totalCo2 * 100) / 100,
                co2PerYear: Math.round(co2PerYear * 100) / 100,
                treesEquivalent: Math.round(totalCo2 * 45),
                milesNotDriven: Math.round(totalCo2 * 2481),
            },
            location: {
                lat, lng,
                city: property?.address?.city || 'Unknown',
                country: region.country,
            },
            design: latestDesign ? {
                id: latestDesign._id,
                name: latestDesign.name,
                status: latestDesign.status,
                roofType: latestDesign.roofType,
                roofArea: designRoof?.totalArea,
                usableArea: designRoof?.usableArea,
                location: latestDesign.location,
                hasIrradiance: hasDesignIrradiance,
                hasShadowAnalysis: !!designShadow?.annualShadowLoss,
                hasFinancials: !!designFinancial?.systemCost,
                updatedAt: latestDesign.updatedAt,
            } : null,
            dataSource,
            recentCleanings: cleanings,
        },
    });
});

// GET /api/dashboard/energy?range=daily|weekly|monthly|yearly
exports.getEnergyData = asyncHandler(async (req, res) => {
    const { range = 'monthly' } = req.query;
    const user = await User.findById(req.user._id);
    const latestDesign = await DesignConfig.findOne({ userId: req.user._id, status: { $ne: 'draft' } }).sort({ updatedAt: -1 });
    const property = user.properties?.[0];
    const lat = latestDesign?.location?.lat || parseFloat(req.query.lat) || property?.address?.coordinates?.lat || 28.6139;
    const lng = latestDesign?.location?.lng || parseFloat(req.query.lng) || property?.address?.coordinates?.lng || 77.2090;
    const capacityKw = latestDesign?.panelPlacement?.totalCapacity || user.solarSystems?.[0]?.capacity || 5;
    const lastCleaning = await CleaningLog.findOne({ userId: req.user._id }).sort({ date: -1 });
    const daysSinceClean = lastCleaning ? Math.floor((Date.now() - new Date(lastCleaning.date).getTime()) / 86400000) : 30;
    const soilingLoss = Math.min(0.30, daysSinceClean * 0.003);
    const systemLosses = 0.15 + soilingLoss * 0.85;
    const regionRate = getRegionFactors(lat, lng).electricityRate;

    let data;
    switch (range) {
        case 'daily':
            data = todayHourlyCurve(lat, capacityKw, systemLosses, 0);
            break;
        case 'weekly':
            data = weeklyProductionData(lat, capacityKw, systemLosses, 0, regionRate);
            break;
        case 'yearly':
            data = yearlyProductionBreakdown(lat, capacityKw, systemLosses, 0);
            break;
        default: // monthly (day-by-day for current month)
            data = weeklyProductionData(lat, capacityKw, systemLosses, 0); // simplified
    }

    res.json({ success: true, data: { chartData: data, range } });
});

// GET /api/dashboard/savings
exports.getSavingsData = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const latestDesign = await DesignConfig.findOne({ userId: req.user._id, status: { $ne: 'draft' } }).sort({ updatedAt: -1 });
    const property = user.properties?.[0];
    const lat = latestDesign?.location?.lat || parseFloat(req.query.lat) || property?.address?.coordinates?.lat || 28.6139;
    const lng = latestDesign?.location?.lng || parseFloat(req.query.lng) || property?.address?.coordinates?.lng || 77.2090;
    const capacityKw = latestDesign?.panelPlacement?.totalCapacity || user.solarSystems?.[0]?.capacity || 5;

    const region = getRegionFactors(lat, lng);
    const monthlyPSH = monthlyPeakSunHours(lat);
    const avgPSH = monthlyPSH.reduce((a, b) => a + b, 0) / 12;
    const annualProd = capacityKw * avgPSH * 365 * 0.85;
    const monthlySavings = (annualProd / 12) * region.electricityRate;

    const cumulativeSavings = [];
    let cumulative = 0;
    for (let y = 1; y <= 25; y++) {
        const degradation = 1 - 0.005 * y;
        const yearSavings = monthlySavings * 12 * degradation;
        cumulative += yearSavings;
        cumulativeSavings.push({
            year: y,
            annual: Math.round(yearSavings),
            cumulative: Math.round(cumulative),
        });
    }

    res.json({
        success: true,
        data: {
            monthlySavings: Math.round(monthlySavings),
            currency: region.currency,
            cumulativeSavings,
        },
    });
});

// GET /api/dashboard/environmental-impact
exports.getEnvironmentalImpact = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const latestDesign = await DesignConfig.findOne({ userId: req.user._id, status: { $ne: 'draft' } }).sort({ updatedAt: -1 });
    const property = user.properties?.[0];
    const lat = latestDesign?.location?.lat || parseFloat(req.query.lat) || property?.address?.coordinates?.lat || 28.6139;
    const lng = latestDesign?.location?.lng || parseFloat(req.query.lng) || property?.address?.coordinates?.lng || 77.2090;
    const capacityKw = latestDesign?.panelPlacement?.totalCapacity || user.solarSystems?.[0]?.capacity || 5;

    const region = getRegionFactors(lat, lng);
    const monthlyPSH = monthlyPeakSunHours(lat);
    const avgPSH = monthlyPSH.reduce((a, b) => a + b, 0) / 12;

    const yearsData = [];
    let totalCo2 = 0;
    for (let y = 1; y <= 25; y++) {
        const degradation = 1 - 0.005 * y;
        const yearProd = capacityKw * avgPSH * 365 * 0.85 * degradation;
        const co2 = (yearProd * region.co2Factor) / 1000;
        totalCo2 += co2;
        yearsData.push({
            year: y,
            production: Math.round(yearProd),
            co2Offset: Math.round(co2 * 100) / 100,
            treesEquivalent: Math.round(co2 * 45),
        });
    }

    res.json({
        success: true,
        data: {
            totalCo2Offset: Math.round(totalCo2 * 100) / 100,
            totalTreesEquivalent: Math.round(totalCo2 * 45),
            totalMilesNotDriven: Math.round(totalCo2 * 2481),
            co2Factor: region.co2Factor,
            country: region.country,
            yearlyData: yearsData,
        },
    });
});
