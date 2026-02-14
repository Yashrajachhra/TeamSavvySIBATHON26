/**
 * ROI Calculation Service
 * Real financial formulas for solar investment analysis
 */

function calculateROI(params) {
    const {
        systemCost = 350000,          // Total system cost in INR
        systemSize = 5,               // kW
        annualProduction = 7000,      // kWh
        electricityRate = 8,          // INR per kWh
        rateInflation = 3,            // % annual electricity price increase
        panelDegradation = 0.5,       // % annual production decrease
        maintenanceCost = 5000,       // Annual maintenance INR
        netMetering = true,
        netMeteringRate = 2.5,        // INR per kWh exported
        selfConsumptionRatio = 0.7,   // % of production consumed directly
        subsidyAmount = 0,
        financingOption = null,       // { amount, interestRate, tenure, downPayment }
        taxBenefit = 0,               // Annual tax savings
        years = 25,
    } = params;

    const effectiveCost = systemCost - subsidyAmount;
    let downPayment = effectiveCost;
    let loanAmount = 0;
    let monthlyEMI = 0;
    let totalLoanCost = 0;

    if (financingOption) {
        downPayment = financingOption.downPayment || effectiveCost * 0.2;
        loanAmount = effectiveCost - downPayment;
        const monthlyRate = financingOption.interestRate / 100 / 12;
        const n = financingOption.tenure;
        if (monthlyRate > 0) {
            monthlyEMI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
        } else {
            monthlyEMI = loanAmount / n;
        }
        totalLoanCost = monthlyEMI * n;
    }

    const monthlyData = [];
    let cumulativeSavings = -downPayment;
    let cumulativeCost = downPayment;
    let breakEvenMonth = null;
    let totalSavings = 0;
    let totalCO2 = 0;
    const co2Factor = 0.82; // kg CO2 per kWh (India average)

    for (let month = 1; month <= years * 12; month++) {
        const yearNum = Math.ceil(month / 12);
        const degradation = 1 - (panelDegradation / 100) * (yearNum - 1);
        const monthlyProduction = (annualProduction / 12) * degradation;
        const currentRate = electricityRate * Math.pow(1 + rateInflation / 100, yearNum - 1);

        const selfConsumed = monthlyProduction * selfConsumptionRatio;
        const exported = monthlyProduction * (1 - selfConsumptionRatio);

        const savingsFromSelfConsumption = selfConsumed * currentRate;
        const revenueFromExport = netMetering ? exported * netMeteringRate : 0;
        const monthlyMaintenance = maintenanceCost / 12;
        const monthlyTaxBenefit = taxBenefit / 12;

        const loanPayment = (financingOption && month <= financingOption.tenure) ? monthlyEMI : 0;

        const netMonthlySavings = savingsFromSelfConsumption + revenueFromExport + monthlyTaxBenefit - monthlyMaintenance - loanPayment;

        cumulativeSavings += netMonthlySavings;
        cumulativeCost += loanPayment + monthlyMaintenance;
        totalSavings += savingsFromSelfConsumption + revenueFromExport;
        totalCO2 += monthlyProduction * co2Factor / 1000; // tons

        if (cumulativeSavings >= 0 && !breakEvenMonth) {
            breakEvenMonth = month;
        }

        if (month % 12 === 0) {
            monthlyData.push({
                year: yearNum,
                annualProduction: +(monthlyProduction * 12).toFixed(0),
                annualSavings: +(netMonthlySavings * 12).toFixed(0),
                cumulativeSavings: +cumulativeSavings.toFixed(0),
                electricityRate: +currentRate.toFixed(2),
                efficiency: +(degradation * 100).toFixed(1),
            });
        }
    }

    // NPV calculation (10% discount rate)
    const discountRate = 0.10;
    let npv = -effectiveCost;
    for (const yearData of monthlyData) {
        npv += yearData.annualSavings / Math.pow(1 + discountRate, yearData.year);
    }

    // IRR calculation (Newton's method approximation)
    let irr = 0.1;
    for (let iter = 0; iter < 100; iter++) {
        let fValue = -effectiveCost;
        let fDerivative = 0;
        for (const yearData of monthlyData) {
            const t = yearData.year;
            fValue += yearData.annualSavings / Math.pow(1 + irr, t);
            fDerivative -= t * yearData.annualSavings / Math.pow(1 + irr, t + 1);
        }
        if (Math.abs(fDerivative) < 1e-10) break;
        const newIrr = irr - fValue / fDerivative;
        if (Math.abs(newIrr - irr) < 1e-6) break;
        irr = newIrr;
    }

    return {
        summary: {
            systemCost: +systemCost.toFixed(0),
            effectiveCost: +effectiveCost.toFixed(0),
            subsidyAmount: +subsidyAmount.toFixed(0),
            breakEvenMonth: breakEvenMonth || null,
            breakEvenYear: breakEvenMonth ? +(breakEvenMonth / 12).toFixed(1) : null,
            lifetimeSavings: +cumulativeSavings.toFixed(0),
            totalSavings: +totalSavings.toFixed(0),
            npv: +npv.toFixed(0),
            irr: +(irr * 100).toFixed(2),
            roiPercent: +((cumulativeSavings / effectiveCost) * 100).toFixed(1),
            co2OffsetTons: +totalCO2.toFixed(2),
            treesEquivalent: Math.round(totalCO2 * 45),
        },
        financing: financingOption ? {
            loanAmount: +loanAmount.toFixed(0),
            monthlyEMI: +monthlyEMI.toFixed(0),
            totalLoanCost: +totalLoanCost.toFixed(0),
            totalInterest: +(totalLoanCost - loanAmount).toFixed(0),
        } : null,
        yearlyData: monthlyData,
    };
}

module.exports = { calculateROI };
