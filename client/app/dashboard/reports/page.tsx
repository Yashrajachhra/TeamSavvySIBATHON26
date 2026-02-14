'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Plus, Calendar, Filter, Eye } from 'lucide-react';

const demoReports = [
    { id: '1', title: 'January 2025 Performance Report', type: 'monthly', date: '2025-01-01', status: 'ready', format: 'PDF' },
    { id: '2', title: 'December 2024 Performance Report', type: 'monthly', date: '2024-12-01', status: 'ready', format: 'PDF' },
    { id: '3', title: 'Q4 2024 Quarterly Report', type: 'quarterly', date: '2024-10-01', status: 'ready', format: 'PDF' },
    { id: '4', title: 'November 2024 Performance Report', type: 'monthly', date: '2024-11-01', status: 'ready', format: 'PDF' },
    { id: '5', title: 'Annual Report 2024', type: 'annual', date: '2024-01-01', status: 'ready', format: 'PDF' },
];

export default function ReportsPage() {
    const [generating, setGenerating] = useState(false);

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => setGenerating(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Performance <span className="solar-gradient-text">Reports</span></h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Auto-generated reports with energy, financial, and environmental data</p>
                </div>
                <button onClick={handleGenerate} disabled={generating}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                    {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                    Generate Report
                </button>
            </div>

            {/* Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Reports', value: demoReports.length, icon: FileText, color: 'from-orange-500 to-yellow-500' },
                    { label: 'Monthly', value: demoReports.filter(r => r.type === 'monthly').length, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Available', value: demoReports.filter(r => r.status === 'ready').length, icon: Download, color: 'from-green-500 to-emerald-500' },
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
            <div className="space-y-3">
                {demoReports.map((report, i) => (
                    <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="glass-card p-4 flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{report.title}</div>
                            <div className="text-xs text-[var(--text-secondary)]">{report.date} • {report.format}</div>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${report.type === 'annual' ? 'bg-purple-500/10 text-purple-500' :
                                report.type === 'quarterly' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-green-500/10 text-green-500'
                            }`}>{report.type}</span>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)]">
                                <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)]">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
