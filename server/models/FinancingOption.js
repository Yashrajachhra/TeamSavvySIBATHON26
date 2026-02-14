const mongoose = require('mongoose');

const financingOptionSchema = new mongoose.Schema({
    provider: { type: String, required: true },
    loanName: { type: String, required: true },
    interestRate: { type: Number, required: true },
    tenure: { type: Number, required: true }, // months
    maxAmount: { type: Number, required: true },
    minAmount: { type: Number, required: true },
    downPaymentPercent: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    prepaymentPenalty: { type: Number, default: 0 },
    eligibilityCriteria: { type: String },
    greenCertified: { type: Boolean, default: false },
    subsidyEligible: { type: Boolean, default: false },
    region: { type: String, default: 'Pakistan' },
    currency: { type: String, default: 'PKR' },
    contactInfo: {
        phone: String,
        email: String,
        website: String,
    },
    applicationUrl: String,
    description: String,
    features: [String],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

financingOptionSchema.index({ region: 1, isActive: 1 });
financingOptionSchema.index({ interestRate: 1 });

module.exports = mongoose.model('FinancingOption', financingOptionSchema);
