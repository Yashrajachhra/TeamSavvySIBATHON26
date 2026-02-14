const FinancingOption = require('../models/FinancingOption');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateROI } = require('../services/roiCalculator');

// GET /api/financing/options
exports.getFinancingOptions = asyncHandler(async (req, res) => {
    const { amount, tenure, region } = req.query;
    const filter = { isActive: true };
    if (region) filter.region = new RegExp(region, 'i');
    if (amount) {
        filter.minAmount = { $lte: parseFloat(amount) };
        filter.maxAmount = { $gte: parseFloat(amount) };
    }
    if (tenure) filter.tenure = { $gte: parseInt(tenure) };

    const options = await FinancingOption.find(filter).sort({ interestRate: 1 });
    res.json({ success: true, data: { options, count: options.length } });
});

// POST /api/financing/compare
exports.compareOptions = asyncHandler(async (req, res) => {
    const { optionIds, loanAmount } = req.body;
    if (!optionIds || !Array.isArray(optionIds) || optionIds.length > 4) {
        throw ApiError.badRequest('Provide 1-4 option IDs to compare');
    }

    const options = await FinancingOption.find({ _id: { $in: optionIds }, isActive: true });

    const comparisons = options.map(opt => {
        const principal = loanAmount || (opt.maxAmount + opt.minAmount) / 2;
        const monthlyRate = opt.interestRate / 100 / 12;
        const n = opt.tenure;
        const emi = monthlyRate > 0
            ? (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
            : principal / n;
        const totalPayment = emi * n;
        const totalInterest = totalPayment - principal;
        const processingAmount = principal * opt.processingFee / 100;

        return {
            ...opt.toObject(),
            calculated: {
                principal,
                emi: +emi.toFixed(2),
                totalPayment: +totalPayment.toFixed(2),
                totalInterest: +totalInterest.toFixed(2),
                processingFee: +processingAmount.toFixed(2),
                effectiveCost: +(totalPayment + processingAmount).toFixed(2),
            },
        };
    });

    res.json({ success: true, data: { comparisons } });
});

// GET /api/financing/subsidies
exports.getSubsidies = asyncHandler(async (req, res) => {
    const { region, systemSize } = req.query;

    // Comprehensive Indian solar subsidy data
    const subsidies = [
        {
            name: 'PM Surya Ghar Muft Bijli Yojana',
            provider: 'Government of India',
            region: 'All India',
            description: 'Central government subsidy for residential rooftop solar',
            tiers: [
                { upToKW: 2, subsidyPerKW: 30000, maxSubsidy: 60000 },
                { upToKW: 3, subsidyPerKW: 18000, maxSubsidy: 78000 },
                { upToKW: 10, subsidyPerKW: 9000, maxSubsidy: 78000 },
            ],
            eligibility: 'Residential consumers with grid connection',
            applicationUrl: 'https://pmsuryaghar.gov.in',
            active: true,
        },
        {
            name: 'State Solar Subsidy - Maharashtra',
            provider: 'MEDA',
            region: 'Maharashtra',
            description: 'Additional state subsidy for rooftop solar in Maharashtra',
            amount: 10000,
            perKW: true,
            maxSubsidy: 50000,
            eligibility: 'Maharashtra residents',
            active: true,
        },
        {
            name: 'State Solar Subsidy - Gujarat',
            provider: 'GEDA',
            region: 'Gujarat',
            description: 'Gujarat state incentive for rooftop solar installations',
            amount: 10000,
            perKW: true,
            maxSubsidy: 40000,
            eligibility: 'Gujarat residents',
            active: true,
        },
        {
            name: 'Tax Benefits - Section 80D',
            provider: 'Income Tax Department',
            region: 'All India',
            description: 'Accelerated depreciation benefit for commercial solar installations',
            benefit: '40% accelerated depreciation',
            eligibility: 'Commercial and industrial consumers',
            active: true,
        },
        {
            name: 'Net Metering Benefits',
            provider: 'State DISCOMs',
            region: 'All India',
            description: 'Export excess solar power to grid and get credits on electricity bill',
            benefit: 'Feed-in tariff varies by state (₹2-₹5 per kWh)',
            eligibility: 'All rooftop solar consumers with approved net metering',
            active: true,
        },
    ];

    let filtered = subsidies;
    if (region) {
        filtered = subsidies.filter(s =>
            s.region.toLowerCase().includes(region.toLowerCase()) || s.region === 'All India'
        );
    }

    // Calculate estimated subsidy for given system size
    let estimatedSubsidy = 0;
    if (systemSize) {
        const kw = parseFloat(systemSize);
        const centralSubsidy = subsidies[0];
        for (const tier of centralSubsidy.tiers) {
            if (kw <= tier.upToKW) {
                estimatedSubsidy = Math.min(kw * tier.subsidyPerKW, tier.maxSubsidy);
                break;
            }
        }
        if (estimatedSubsidy === 0 && kw > 3) {
            estimatedSubsidy = 78000;
        }
    }

    res.json({
        success: true,
        data: { subsidies: filtered, estimatedSubsidy, systemSize: systemSize || null },
    });
});

// POST /api/financing/apply
exports.applyForFinancing = asyncHandler(async (req, res) => {
    const { optionId, amount, tenure } = req.body;

    const option = await FinancingOption.findById(optionId);
    if (!option) throw ApiError.notFound('Financing option not found');

    if (amount < option.minAmount || amount > option.maxAmount) {
        throw ApiError.badRequest(`Amount must be between ₹${option.minAmount} and ₹${option.maxAmount}`);
    }

    // Store application interest in user profile
    const user = req.user;
    user.financingDetails.push({
        loanId: `LOAN_${Date.now()}`,
        provider: option.provider,
        amount,
        interestRate: option.interestRate,
        tenure: tenure || option.tenure,
        status: 'applied',
        startDate: new Date(),
    });
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Financing application submitted successfully',
        data: {
            applicationId: user.financingDetails[user.financingDetails.length - 1]._id,
            redirectUrl: option.applicationUrl,
        },
    });
});

// POST /api/financing/roi-simulation
exports.simulateROI = asyncHandler(async (req, res) => {
    const result = calculateROI(req.body);
    res.json({ success: true, data: result });
});
