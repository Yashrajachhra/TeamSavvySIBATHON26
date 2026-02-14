const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyIndex: { type: Number, default: 0 },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['monthly', 'quarterly', 'annual', 'custom', 'design'],
        default: 'monthly',
    },
    dateRange: {
        start: Date,
        end: Date,
    },
    sections: {
        energy: {
            totalProduction: Number,
            totalConsumption: Number,
            selfConsumption: Number,
            gridExport: Number,
        },
        financial: {
            totalSavings: Number,
            loanPayments: Number,
            netSavings: Number,
            breakEvenProgress: Number,
        },
        maintenance: {
            cleaningEvents: Number,
            avgEfficiency: Number,
            dustImpact: Number,
        },
        environmental: {
            co2Offset: Number,
            treesEquivalent: Number,
        },
    },
    fileUrl: String,
    format: {
        type: String,
        enum: ['pdf', 'csv', 'excel'],
        default: 'pdf',
    },
    generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

reportSchema.index({ userId: 1, generatedAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
