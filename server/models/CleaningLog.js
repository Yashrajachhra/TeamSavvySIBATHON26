const mongoose = require('mongoose');

const cleaningLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyIndex: { type: Number, default: 0 },
    date: { type: Date, required: true },
    method: {
        type: String,
        enum: ['water_wash', 'dry_brush', 'robotic', 'professional', 'rain'],
        default: 'water_wash',
    },
    cost: { type: Number, default: 0 },
    efficiencyBefore: { type: Number },  // percentage
    efficiencyAfter: { type: Number },   // percentage
    notes: String,
    performedBy: {
        type: String,
        enum: ['self', 'installer', 'automated'],
        default: 'self',
    },
}, { timestamps: true });

cleaningLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('CleaningLog', cleaningLogSchema);
