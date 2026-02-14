const DesignConfig = require('../models/DesignConfig');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/design/roof-analysis
exports.analyzeRoof = asyncHandler(async (req, res) => {
    const { lat, lng, roof_area, roof_type, propertyIndex = 0 } = req.body;
    const roofArea = parseFloat(roof_area) || 100;

    let analysisResult;

    try {
        if (req.file) {
            // Forward file upload as multipart form data to AI service
            const formData = new FormData();
            formData.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
            if (lat) formData.append('lat', lat.toString());
            if (lng) formData.append('lng', lng.toString());
            formData.append('roof_area', roofArea.toString());

            const response = await axios.post(`${AI_SERVICE_URL}/ai/roof-analysis`, formData, {
                timeout: 30000,
            });
            analysisResult = response.data;
        } else if (lat && lng) {
            // Use JSON endpoint when no file is uploaded
            const response = await axios.post(`${AI_SERVICE_URL}/ai/roof-analysis-json`, {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                roof_area: roofArea,
                roof_type: roof_type || null,
            }, { timeout: 30000 });
            analysisResult = response.data;
        } else {
            throw ApiError.badRequest('Provide either an image file or coordinates (lat, lng)');
        }
    } catch (err) {
        if (err instanceof ApiError) throw err;
        console.error('AI service roof-analysis error:', err.message);
        // Fallback demo analysis
        analysisResult = {
            success: true,
            data: {
                totalArea: roofArea,
                usableArea: Math.round(roofArea * 0.75),
                obstructions: [
                    { type: 'chimney', area: Math.round(roofArea * 0.05 * 100) / 100, position: { x: 0.8, y: 0.2 } },
                    { type: 'vent', area: Math.round(roofArea * 0.02 * 100) / 100, position: { x: 0.3, y: 0.7 } },
                    { type: 'shadow_zone', area: Math.round(roofArea * 0.18 * 100) / 100, position: { x: 0.1, y: 0.9 } },
                ],
                roofPolygon: [[0, 0], [1, 0], [1, 1], [0, 1]],
                confidence: 0.87,
                roofType: 'flat',
                estimatedTilt: 12,
            },
        };
    }

    // Save design to database (non-blocking — don't let DB errors break the response)
    let design = null;
    try {
        design = await DesignConfig.create({
            userId: req.user._id,
            propertyIndex,
            location: {
                lat: parseFloat(lat) || null,
                lng: parseFloat(lng) || null,
            },
            roofType: roof_type || analysisResult.data.roofType || 'flat',
            roofAnalysis: {
                totalArea: analysisResult.data.totalArea,
                usableArea: analysisResult.data.usableArea,
                obstructions: analysisResult.data.obstructions,
                roofPolygon: analysisResult.data.roofPolygon,
            },
            status: 'analyzed',
        });
    } catch (dbErr) {
        console.error('DesignConfig save error (non-fatal):', dbErr.message);
    }

    // Return the analysis data directly (flat) so client can use data.data.usableArea
    res.status(201).json({
        success: true,
        data: {
            ...analysisResult.data,
            designId: design?._id,
        },
    });
});

// POST /api/design/panel-placement
exports.getPanelPlacement = asyncHandler(async (req, res) => {
    // Accept both camelCase and snake_case field names from client
    const {
        designId,
        lat, lng,
        roofTilt, roof_tilt,
        roofOrientation, roof_orientation,
        panelWattage, panel_wattage,
        usable_area, usableArea,
    } = req.body;

    const effectiveTilt = parseFloat(roofTilt || roof_tilt) || 15;
    const effectiveOrientation = roofOrientation || roof_orientation || 'south';
    const effectiveWattage = parseInt(panelWattage || panel_wattage) || 400;
    const effectiveUsableArea = parseFloat(usable_area || usableArea) || 75;

    let design;
    if (designId) {
        design = await DesignConfig.findOne({ _id: designId, userId: req.user._id });
        if (!design) throw ApiError.notFound('Design not found');
    }

    let placementData;
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/ai/panel-placement`, {
            usable_area: design?.roofAnalysis?.usableArea || effectiveUsableArea,
            lat: parseFloat(lat) || 28.6139,
            lng: parseFloat(lng) || 77.209,
            roof_tilt: effectiveTilt,
            roof_orientation: effectiveOrientation,
            panel_wattage: effectiveWattage,
        }, { timeout: 30000 });
        placementData = response.data?.data || response.data;
    } catch (err) {
        console.error('AI service panel-placement error:', err.message);
        // Fallback demo placement
        const areaForCalc = design?.roofAnalysis?.usableArea || effectiveUsableArea;
        const panelArea = 2.0; // m² per panel
        const panelCount = Math.floor(areaForCalc / panelArea);
        const capacity = (panelCount * effectiveWattage) / 1000;
        const peakSunHours = 5.2;
        const annualProduction = Math.round(capacity * peakSunHours * 0.8 * 365);

        const layout = [];
        const cols = Math.ceil(Math.sqrt(panelCount * 2));
        const rows = Math.ceil(panelCount / cols);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols && layout.length < panelCount; c++) {
                layout.push({
                    row: r, col: c,
                    x: c * 1.1, y: r * 2.1,
                    width: 1.0, height: 2.0,
                    orientation: 'portrait',
                });
            }
        }

        placementData = {
            panelCount,
            panelWattage: effectiveWattage,
            totalCapacity: Math.round(capacity * 100) / 100,
            optimalTiltAngle: Math.round(Math.abs(parseFloat(lat) || 28.6) * 0.9 * 10) / 10,
            optimalAzimuth: 180,
            estimatedAnnualProduction: annualProduction,
            peakSunHours,
            systemLosses: 20,
            layout,
            degradationSchedule: Array.from({ length: 25 }, (_, i) => ({
                year: i + 1,
                efficiency: +(100 - i * 0.5).toFixed(1),
                production: Math.round(annualProduction * (1 - i * 0.005)),
            })),
        };
    }

    if (design) {
        design.panelPlacement = placementData;
        // Store/update location if provided
        if (lat && lng) {
            design.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
        }
        design.status = 'analyzed';
        await design.save();
    }

    // Update user's solar system to reflect the latest design
    try {
        const user = await require('../models/User').findById(req.user._id);
        if (user) {
            const designLat = parseFloat(lat) || user.properties?.[0]?.address?.coordinates?.lat;
            const designLng = parseFloat(lng) || user.properties?.[0]?.address?.coordinates?.lng;
            const capacity = placementData.totalCapacity || 5;
            const panels = placementData.panelCount || Math.round(capacity / 0.4);

            // Update or create the first solar system entry
            if (user.solarSystems && user.solarSystems.length > 0) {
                user.solarSystems[0].capacity = capacity;
                user.solarSystems[0].panelCount = panels;
                user.solarSystems[0].panelModel = `${placementData.panelWattage || 400}W Panel`;
                user.solarSystems[0].designConfigId = design?._id;
                if (!user.solarSystems[0].installedDate) {
                    user.solarSystems[0].installedDate = new Date();
                }
            } else {
                user.solarSystems = [{
                    propertyIndex: 0,
                    installedDate: new Date(),
                    panelCount: panels,
                    panelModel: `${placementData.panelWattage || 400}W Panel`,
                    capacity,
                    status: 'active',
                    annualProduction: placementData.estimatedAnnualProduction,
                    designConfigId: design?._id,
                }];
            }

            // Update property coordinates if this is a new location
            if (designLat && designLng && user.properties?.length > 0) {
                user.properties[0].address = user.properties[0].address || {};
                user.properties[0].address.coordinates = { lat: designLat, lng: designLng };
                user.properties[0].roofArea = design?.roofAnalysis?.totalArea || user.properties[0].roofArea;
            }

            await user.save();
        }
    } catch (profileErr) {
        console.error('User profile update (non-fatal):', profileErr.message);
    }

    // Return placement data directly (flat) so client can use data.data.panelCount
    res.json({
        success: true,
        data: {
            ...placementData,
            designId: design?._id,
        },
    });
});

// GET /api/design
exports.getDesigns = asyncHandler(async (req, res) => {
    const designs = await DesignConfig.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, data: { designs } });
});

// GET /api/design/:id
exports.getDesign = asyncHandler(async (req, res) => {
    const design = await DesignConfig.findOne({ _id: req.params.id, userId: req.user._id });
    if (!design) throw ApiError.notFound('Design not found');
    res.json({ success: true, data: { design } });
});

// PUT /api/design/:id
exports.updateDesign = asyncHandler(async (req, res) => {
    const design = await DesignConfig.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );
    if (!design) throw ApiError.notFound('Design not found');
    res.json({ success: true, data: { design } });
});

// DELETE /api/design/:id
exports.deleteDesign = asyncHandler(async (req, res) => {
    const design = await DesignConfig.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!design) throw ApiError.notFound('Design not found');
    res.json({ success: true, message: 'Design deleted' });
});
