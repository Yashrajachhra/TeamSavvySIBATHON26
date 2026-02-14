const Report = require('../models/Report');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// POST /api/reports/generate
exports.generateReport = asyncHandler(async (req, res) => {
    const { type = 'monthly', startDate, endDate, propertyIndex = 0 } = req.body;
    const user = await User.findById(req.user._id);

    const now = new Date();
    let start, end;
    
    if (startDate && endDate) {
        // Use provided dates
        start = new Date(startDate);
        end = new Date(endDate);
    } else {
        // Calculate based on report type
        switch (type) {
            case 'quarterly': {
                // Previous quarter (3 months)
                const currentQuarter = Math.floor(now.getMonth() / 3);
                const previousQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
                const previousQuarterYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
                const quarterStartMonth = previousQuarter * 3;
                start = new Date(previousQuarterYear, quarterStartMonth, 1);
                end = new Date(previousQuarterYear, quarterStartMonth + 3, 0); // Last day of the quarter
                break;
            }
            case 'annual': {
                // Previous year
                start = new Date(now.getFullYear() - 1, 0, 1); // Jan 1 of previous year
                end = new Date(now.getFullYear() - 1, 11, 31); // Dec 31 of previous year
                break;
            }
            case 'monthly':
            default: {
                // Previous month
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            }
        }
    }

    const capacity = user.solarSystems[0]?.capacity || 5;
    const annualProduction = capacity * 1400;
    const monthlyProduction = annualProduction / 12;
    const electricityRate = 8;
    const monthlyBill = user.properties[propertyIndex]?.currentEnergyBill || 3000;

    // Calculate multiplier based on report type
    let multiplier;
    switch (type) {
        case 'quarterly':
            multiplier = 3; // 3 months
            break;
        case 'annual':
            multiplier = 12; // 12 months
            break;
        case 'monthly':
        default:
            multiplier = 1; // 1 month
            break;
    }

    const totalProduction = monthlyProduction * multiplier;
    const totalConsumption = monthlyBill * multiplier; // Approximate consumption

    const reportData = {
        energy: {
            totalProduction: +totalProduction.toFixed(0),
            totalConsumption: +(totalConsumption).toFixed(0),
            selfConsumption: +(totalProduction * 0.7).toFixed(0),
            gridExport: +(totalProduction * 0.3).toFixed(0),
        },
        financial: {
            totalSavings: +(totalProduction * electricityRate * 0.7).toFixed(0),
            loanPayments: (user.financingDetails[0]?.emi || 0) * multiplier,
            netSavings: +(totalProduction * electricityRate * 0.7 - ((user.financingDetails[0]?.emi || 0) * multiplier)).toFixed(0),
            breakEvenProgress: 35,
        },
        maintenance: {
            cleaningEvents: Math.max(1, Math.floor(multiplier / 2)), // Rough estimate
            avgEfficiency: 92,
            dustImpact: 4.5,
        },
        environmental: {
            co2Offset: +(totalProduction * 0.82 / 1000).toFixed(3),
            treesEquivalent: Math.round(totalProduction * 0.82 / 1000 * 45),
        },
    };

    // Generate PDF
    const fileName = `report_${user._id}_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Header
    doc.fontSize(24).fillColor('#F97316').text('SmartSolar', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).fillColor('#333').text('Performance Report', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(
        `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        { align: 'center' }
    );
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb');
    doc.moveDown(1);

    // User info
    doc.fontSize(12).fillColor('#333').text(`Name: ${user.fullName}`);
    doc.text(`Property: ${user.properties[propertyIndex]?.name || 'Primary'}`);
    doc.text(`System Size: ${capacity} kW`);
    doc.moveDown(1);

    // Energy section
    doc.fontSize(14).fillColor('#F97316').text('Energy Production');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Total Production: ${reportData.energy.totalProduction} kWh`);
    doc.text(`Self Consumption: ${reportData.energy.selfConsumption} kWh`);
    doc.text(`Grid Export: ${reportData.energy.gridExport} kWh`);
    doc.moveDown(1);

    // Financial section
    doc.fontSize(14).fillColor('#F97316').text('Financial Summary');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Total Savings: PKR ${reportData.financial.totalSavings}`);
    doc.text(`Net Savings: PKR ${reportData.financial.netSavings}`);
    doc.text(`Break-even Progress: ${reportData.financial.breakEvenProgress}%`);
    doc.moveDown(1);

    // Environmental section
    doc.fontSize(14).fillColor('#F97316').text('Environmental Impact');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#333');
    doc.text(`CO2 Offset: ${reportData.environmental.co2Offset} tons`);
    doc.text(`Equivalent Trees Planted: ${reportData.environmental.treesEquivalent}`);
    doc.moveDown(1);

    // Maintenance section
    doc.fontSize(14).fillColor('#F97316').text('Maintenance');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Average Efficiency: ${reportData.maintenance.avgEfficiency}%`);
    doc.text(`Dust Impact: ${reportData.maintenance.dustImpact}% loss`);
    doc.text(`Cleaning Events: ${reportData.maintenance.cleaningEvents}`);

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#999').text(
        'Generated by SmartSolar — AI-Powered Solar Intelligence Platform',
        { align: 'center' }
    );

    doc.end();

    await new Promise((resolve) => writeStream.on('finish', resolve));

    const report = await Report.create({
        userId: req.user._id,
        propertyIndex,
        title: `${type === 'monthly' ? 'Monthly' : type === 'quarterly' ? 'Quarterly' : 'Annual'} Report - ${start.toLocaleDateString()}`,
        type,
        dateRange: { start, end },
        sections: reportData,
        fileUrl: `/uploads/reports/${fileName}`,
        format: 'pdf',
    });

    res.status(201).json({ success: true, data: { report, downloadUrl: `/api/reports/${report._id}/download` } });
});

// GET /api/reports/list
exports.listReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({ userId: req.user._id }).sort({ generatedAt: -1 }).limit(50);
    res.json({ success: true, data: { reports } });
});

// GET /api/reports/:id/preview
exports.previewReport = asyncHandler(async (req, res) => {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) throw ApiError.notFound('Report not found');

    const filePath = path.join(__dirname, '..', report.fileUrl);
    if (!fs.existsSync(filePath)) throw ApiError.notFound('Report file not found');

    // Set headers for PDF viewing in iframe
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(report.title)}.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Send file
    res.sendFile(path.resolve(filePath));
});

// GET /api/reports/:id/download
exports.downloadReport = asyncHandler(async (req, res) => {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) throw ApiError.notFound('Report not found');

    const filePath = path.join(__dirname, '..', report.fileUrl);
    if (!fs.existsSync(filePath)) throw ApiError.notFound('Report file not found');

    res.download(filePath, `SmartSolar_Report_${report._id}.pdf`);
});

// DELETE /api/reports/:id
exports.deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) throw ApiError.notFound('Report not found');

    // Delete the PDF file if it exists
    if (report.fileUrl) {
        const filePath = path.join(__dirname, '..', report.fileUrl);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error('Failed to delete report file:', err);
                // Continue with database deletion even if file deletion fails
            }
        }
    }

    // Delete from database
    await Report.findByIdAndDelete(report._id);

    res.json({
        success: true,
        message: 'Report deleted successfully',
    });
});
