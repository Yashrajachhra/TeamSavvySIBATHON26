const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const FinancingOption = require('../models/FinancingOption');
const User = require('../models/User');

const financingOptions = [
    {
        provider: 'Meezan Bank', loanName: 'Meezan Solar financing', interestRate: 15.5,
        tenure: 60, maxAmount: 2500000, minAmount: 100000, downPaymentPercent: 15,
        processingFee: 5000, prepaymentPenalty: 0, greenCertified: true, subsidyEligible: true,
        region: 'Pakistan', currency: 'PKR', description: 'Shariah-compliant solar financing solution',
        features: ['Shariah compliant', 'Quick processing', 'Takaful coverage'],
        contactInfo: { phone: '111-331-331', email: 'solar@meezanbank.com', website: 'https://meezanbank.com' },
        applicationUrl: 'https://meezanbank.com/solar',
    },
    {
        provider: 'HBL', loanName: 'HBL Own A Home (Solar)', interestRate: 17.5,
        tenure: 60, maxAmount: 3000000, minAmount: 150000, downPaymentPercent: 20,
        processingFee: 6000, prepaymentPenalty: 1, greenCertified: true, subsidyEligible: false,
        region: 'Pakistan', currency: 'PKR', description: 'Install solar panels with HBL personal loan',
        features: ['Flexible tenure', 'Competitive markup', 'Quick disbursement'],
        contactInfo: { phone: '111-111-425', email: 'contact@hbl.com', website: 'https://hbl.com' },
        applicationUrl: 'https://hbl.com/personal/loans',
    },
    {
        provider: 'Bank Alfalah', loanName: 'Alfalah Green Energy', interestRate: 16.0,
        tenure: 84, maxAmount: 2000000, minAmount: 100000, downPaymentPercent: 20,
        processingFee: 4000, prepaymentPenalty: 2, greenCertified: true, subsidyEligible: true,
        region: 'Pakistan', currency: 'PKR', description: 'Switch to renewable energy with ease',
        features: ['Low processing fee', 'Easy installments', 'Reliable partners'],
        contactInfo: { phone: '111-225-111', email: 'solar@bankalfalah.com', website: 'https://bankalfalah.com' },
        applicationUrl: 'https://bankalfalah.com',
    },
    {
        provider: 'JS Bank', loanName: 'JS Smart Energy', interestRate: 14.5,
        tenure: 120, maxAmount: 5000000, minAmount: 500000, downPaymentPercent: 10,
        processingFee: 0, prepaymentPenalty: 0, greenCertified: true, subsidyEligible: true,
        region: 'Pakistan', currency: 'PKR', description: 'State Bank Refinance Scheme for Renewable Energy',
        features: ['Subsidized rate (SBP)', 'Long tenure', 'Commercial & Residential'],
        contactInfo: { phone: '111-654-321', email: 'solar@jsbl.com', website: 'https://jsbl.com' },
        applicationUrl: 'https://jsbl.com/solar',
    },
    {
        provider: 'Faysal Bank', loanName: 'Faysal Islami Solar', interestRate: 16.5,
        tenure: 60, maxAmount: 2000000, minAmount: 100000, downPaymentPercent: 25,
        processingFee: 3000, prepaymentPenalty: 0, greenCertified: true, subsidyEligible: true,
        region: 'Pakistan', currency: 'PKR', description: 'Islamic financing for solar solutions',
        features: ['Shariah compliant', 'Takaful included', 'Fast track'],
        contactInfo: { phone: '111-060-606', email: 'info@faysalbank.com', website: 'https://faysalbank.com' },
        applicationUrl: 'https://faysalbank.com',
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartsolar');
        console.log('Connected to MongoDB');

        await FinancingOption.deleteMany({});
        console.log('Cleared financing options');

        await FinancingOption.insertMany(financingOptions);
        console.log(`Seeded ${financingOptions.length} financing options`);

        // Create admin user if not exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                email: 'admin@smartsolar.com',
                password: 'admin123456',
                fullName: 'SmartSolar Admin',
                role: 'admin',
                onboardingCompleted: true,
                isActive: true,
            });
            console.log('Created admin user (admin@smartsolar.com / admin123456)');
        }

        // Create demo user if not exists
        const demoExists = await User.findOne({ email: 'demo@smartsolar.com' });
        if (!demoExists) {
            await User.create({
                email: 'demo@smartsolar.com',
                password: 'demo123456',
                fullName: 'Demo Homeowner',
                role: 'homeowner',
                onboardingCompleted: true,
                isActive: true,
                address: {
                    street: 'Block 4, Gulshan-e-Iqbal',
                    city: 'Karachi',
                    state: 'Sindh',
                    zip: '75300',
                    country: 'Pakistan',
                    coordinates: { lat: 24.91, lng: 67.09 },
                },
                properties: [{
                    name: 'My Home',
                    address: {
                        street: 'Block 4, Gulshan-e-Iqbal', city: 'Karachi', state: 'Sindh',
                        zip: '75300', country: 'Pakistan',
                        coordinates: { lat: 24.91, lng: 67.09 },
                    },
                    roofArea: 120,
                    roofType: 'flat',
                    roofAngle: 10,
                    roofOrientation: 'south',
                    currentEnergyBill: 15000,
                    monthlyConsumption: 500,
                }],
                solarSystems: [{
                    propertyIndex: 0,
                    installedDate: new Date('2024-06-15'),
                    panelCount: 12,
                    panelModel: 'Longi solar 550W',
                    capacity: 6.6,
                    status: 'active',
                    annualProduction: 9000,
                }],
                preferences: {
                    currency: 'PKR',
                    units: 'metric',
                    theme: 'dark',
                },
            });
            console.log('Created demo user (demo@smartsolar.com / demo123456)');
        }

        console.log('✅ Seed completed');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDB();
