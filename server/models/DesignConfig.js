const mongoose = require('mongoose');

const designConfigSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyIndex: { type: Number, default: 0 },
    name: { type: String, default: 'My Solar Design' },
    location: {
        lat: Number,
        lng: Number,
    },
    roofType: String,
    roofAnalysis: {
        totalArea: Number,
        usableArea: Number,
        obstructions: [{
            type: { type: String },
            area: Number,
            position: { x: Number, y: Number },
        }],
        roofPolygon: [[Number]],
        imageUrl: String,
    },
    panelPlacement: {
        panelCount: Number,
        panelModel: { type: String, default: 'Standard 400W' },
        panelWattage: { type: Number, default: 400 },
        tiltAngle: Number,
        azimuthAngle: Number,
        totalCapacity: Number, // kW
        estimatedAnnualProduction: Number, // kWh
        layout: [{
            row: Number,
            col: Number,
            x: Number,
            y: Number,
            width: Number,
            height: Number,
            orientation: String,
        }],
    },
    solarIrradiance: {
        annualAverage: Number, // kWh/m2/day
        monthlyValues: [Number],
        peakSunHours: Number,
    },
    shadowAnalysis: {
        annualShadowLoss: Number, // percentage
        hourlyData: mongoose.Schema.Types.Mixed,
    },
    financialEstimate: {
        systemCost: Number,
        annualSavings: Number,
        breakEvenYears: Number,
        lifetimeSavings: Number,
        co2Offset: Number, // tons over 25 years
    },
    status: {
        type: String,
        enum: ['draft', 'analyzed', 'finalized', 'implemented'],
        default: 'draft',
    },
}, { timestamps: true });

designConfigSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('DesignConfig', designConfigSchema);
