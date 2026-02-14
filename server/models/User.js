const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
        type: String,
        minlength: 6,
        select: false,
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: 100,
    },
    phone: {
        type: String,
        trim: true,
    },
    avatar: String,
    role: {
        type: String,
        enum: ['homeowner', 'business', 'installer', 'admin'],
        default: 'homeowner',
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: { type: String, default: 'Pakistan' },
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    properties: [{
        name: { type: String, default: 'My Property' },
        address: {
            street: String,
            city: String,
            state: String,
            zip: String,
            country: String,
            coordinates: { lat: Number, lng: Number },
        },
        roofArea: Number,
        roofType: {
            type: String,
            enum: ['flat', 'gabled', 'hipped', 'mansard', 'shed', 'other'],
        },
        roofAngle: Number,
        roofOrientation: {
            type: String,
            enum: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'],
        },
        currentEnergyBill: Number,
        monthlyConsumption: Number,
    }],
    solarSystems: [{
        propertyIndex: Number,
        installedDate: Date,
        panelCount: Number,
        panelModel: String,
        capacity: Number, // kW
        inverterModel: String,
        status: {
            type: String,
            enum: ['planned', 'installing', 'active', 'maintenance', 'decommissioned'],
            default: 'planned',
        },
        annualProduction: Number, // kWh estimate
        designConfigId: mongoose.Schema.Types.ObjectId,
    }],
    financingDetails: [{
        loanId: String,
        provider: String,
        amount: Number,
        interestRate: Number,
        tenure: Number,
        emi: Number,
        status: {
            type: String,
            enum: ['applied', 'approved', 'active', 'completed', 'rejected'],
            default: 'applied',
        },
        startDate: Date,
    }],
    preferences: {
        currency: { type: String, default: 'PKR' },
        units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            cleaningAlerts: { type: Boolean, default: true },
            financingAlerts: { type: Boolean, default: true },
            performanceAlerts: { type: Boolean, default: true },
        },
        language: { type: String, default: 'en' },
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
    onboardingCompleted: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: Date,
    refreshToken: {
        type: String,
        select: false,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );
};

module.exports = mongoose.model('User', userSchema);
