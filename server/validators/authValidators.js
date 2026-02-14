const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required(),
    phone: Joi.string().allow(''),
    role: Joi.string().valid('homeowner', 'business', 'installer').default('homeowner'),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const googleAuthSchema = Joi.object({
    idToken: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
    fullName: Joi.string().min(2).max(100),
    phone: Joi.string().allow(''),
    avatar: Joi.string().uri().allow(''),
    role: Joi.string().valid('homeowner', 'business', 'installer'),
    address: Joi.object({
        street: Joi.string().allow(''),
        city: Joi.string().allow(''),
        state: Joi.string().allow(''),
        zip: Joi.string().allow(''),
        country: Joi.string().allow(''),
        coordinates: Joi.object({
            lat: Joi.number().min(-90).max(90),
            lng: Joi.number().min(-180).max(180),
        }),
    }),
    preferences: Joi.object({
        currency: Joi.string(),
        units: Joi.string().valid('metric', 'imperial'),
        notifications: Joi.object({
            email: Joi.boolean(),
            push: Joi.boolean(),
            sms: Joi.boolean(),
            cleaningAlerts: Joi.boolean(),
            financingAlerts: Joi.boolean(),
            performanceAlerts: Joi.boolean(),
        }),
        language: Joi.string(),
        theme: Joi.string().valid('light', 'dark', 'system'),
    }),
});

const onboardingSchema = Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    phone: Joi.string().allow(''),
    role: Joi.string().valid('homeowner', 'business', 'installer').required(),
    address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().required(),
        country: Joi.string().default('India'),
        coordinates: Joi.object({
            lat: Joi.number().required(),
            lng: Joi.number().required(),
        }),
    }).required(),
    property: Joi.object({
        name: Joi.string().default('My Property'),
        roofArea: Joi.number().positive().required(),
        roofType: Joi.string().valid('flat', 'gabled', 'hipped', 'mansard', 'shed', 'other').required(),
        roofAngle: Joi.number().min(0).max(90).required(),
        roofOrientation: Joi.string().valid('north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'),
        currentEnergyBill: Joi.number().positive(),
        monthlyConsumption: Joi.number().positive(),
    }).required(),
    solarInterest: Joi.string().valid('exploring', 'planning', 'ready_to_install', 'already_have'),
    budgetRange: Joi.object({
        min: Joi.number().min(0),
        max: Joi.number().min(0),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    googleAuthSchema,
    updateProfileSchema,
    onboardingSchema,
};
