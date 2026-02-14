'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Plus, Calendar, Eye, X, Loader2, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Report {
    _id: string;
    title: string;
    type: string;
    dateRange?: { start: string; end: string };
    generatedAt: string;
    format: string;
    fileUrl: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [previewReport, setPreviewReport] = useState<Report | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/reports/list');
            if (data.success) {
                setReports(data.data.reports || []);
            }
        } catch (error: any) {
            console.error('Failed to fetch reports:', error);
            toast.error(error.response?.data?.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const { data } = await api.post('/api/reports/generate', {
                type: reportType,
            });
            if (data.success) {
                toast.success('Report generated successfully!');
                await fetchReports();
            }
        } catch (error: any) {
            console.error('Failed to generate report:', error);
            toast.error(error.response?.data?.message || 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (report: Report) => {
        try {
            const response = await api.get(`/api/reports/${report._id}/download`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${report.title.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Report downloaded!');
        } catch (error: any) {
            console.error('Failed to download report:', error);
            toast.error(error.response?.data?.message || 'Failed to download report');
        }
    };

    const handlePreview = async (report: Report) => {
        try {
            setPreviewReport(report);
            // Fetch PDF as blob with authentication
            const response = await api.get(`/api/reports/${report._id}/preview`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setPreviewUrl(url);
        } catch (error: any) {
            console.error('Failed to load preview:', error);
            toast.error(error.response?.data?.message || 'Failed to load PDF preview');
            setPreviewReport(null);
        }
    };

    const closePreview = () => {
        setPreviewReport(null);
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleDelete = async (report: Report) => {
        if (!confirm(`Are you sure you want to delete "${report.title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/api/reports/${report._id}`);
            toast.success('Report deleted successfully');
            await fetchReports();
            // Close preview if the deleted report was being previewed
            if (previewReport?._id === report._id) {
                closePreview();
            }
        } catch (error: any) {
            console.error('Failed to delete report:', error);
            toast.error(error.response?.data?.message || 'Failed to delete report');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'annual':
                return 'bg-purple-500/10 text-purple-500';
            case 'quarterly':
                return 'bg-blue-500/10 text-blue-500';
            default:
                return 'bg-green-500/10 text-green-500';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-sm text-[var(--text-secondary)]">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Performance <span className="solar-gradient-text">Reports</span></h1>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">Auto-generated reports with energy, financial, and environmental data</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as any)}
                            className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annual">Annual</option>
                        </select>
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                        >
                            {generating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            Generate Report
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid sm:grid-cols-3 gap-4">
                    {[
                        {
                            label: 'Total Reports',
                            value: reports.length,
                            icon: FileText,
                            color: 'from-orange-500 to-yellow-500',
                        },
                        {
                            label: 'Monthly',
                            value: reports.filter((r) => r.type === 'monthly').length,
                            icon: Calendar,
                            color: 'from-blue-500 to-cyan-500',
                        },
                        {
                            label: 'Available',
                            value: reports.length,
                            icon: Download,
                            color: 'from-green-500 to-emerald-500',
                        },
                    ].map((s, i) => (
                        <div key={i} className="glass-card p-5">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                                <s.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-2xl font-bold">{s.value}</div>
                            <div className="text-sm text-[var(--text-secondary)]">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Reports List */}
                {reports.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-[var(--text-secondary)] opacity-40 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Generate your first performance report to see energy, financial, and environmental insights.
                        </p>
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                        >
                            {generating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            Generate Your First Report
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report, i) => (
                            <motion.div
                                key={report._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-4 flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{report.title}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">
                                        {report.dateRange
                                            ? `${formatDate(report.dateRange.start)} - ${formatDate(report.dateRange.end)}`
                                            : formatDate(report.generatedAt)}{' '}
                                        • {report.format.toUpperCase()}
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(report.type)}`}>
                                    {report.type}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePreview(report)}
                                        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)] hover:text-orange-500"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(report)}
                                        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)] hover:text-green-500"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(report)}
                                        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)] hover:text-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={closePreview}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                                <div>
                                    <h2 className="text-lg font-semibold">{previewReport.title}</h2>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        {previewReport.dateRange
                                            ? `${formatDate(previewReport.dateRange.start)} - ${formatDate(previewReport.dateRange.end)}`
                                            : formatDate(previewReport.generatedAt)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownload(previewReport)}
                                        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)]"
                                        title="Download"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={closePreview}
                                        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)]"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* PDF Preview */}
                            <div className="flex-1 overflow-hidden p-4">
                                {previewUrl ? (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-full border border-[var(--border-color)] rounded-lg bg-white"
                                        title="Report Preview"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                            <p className="text-sm text-[var(--text-secondary)]">Loading PDF...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
