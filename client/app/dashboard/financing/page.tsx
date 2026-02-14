'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Calculator, TrendingUp, Percent, Building2, ArrowRight, ChevronDown, Info, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

// Demo financing options
// Demo financing options
const financingOptions = [
    { id: 1, provider: 'Meezan Bank', type: 'Solar Financing', rate: 15.5, maxAmount: 2500000, tenure: '3-5 years', emi: 45000, rating: 4.8 },
    { id: 2, provider: 'HBL', type: 'Personal Loan', rate: 17.5, maxAmount: 3000000, tenure: '1-5 years', emi: 52000, rating: 4.5 },
    { id: 3, provider: 'JS Bank', type: 'SBP Refinance', rate: 6.0, maxAmount: 5000000, tenure: '5-10 years', emi: 35000, rating: 4.9 },
    { id: 4, provider: 'Bank Alfalah', type: 'Green Energy', rate: 16.0, maxAmount: 2000000, tenure: '3-7 years', emi: 42000, rating: 4.4 },
    { id: 5, provider: 'Faysal Bank', type: 'Islamic Solar', rate: 16.5, maxAmount: 2000000, tenure: '3-5 years', emi: 44000, rating: 4.6 },
];

// Demo ROI data
function generateROI() {
    return Array.from({ length: 25 }, (_, i) => {
        const year = i + 1;
        const savings = Math.round(48000 * Math.pow(1.05, i));
        const cumulative = savings * year * 0.6;
        return { year: `Y${year}`, savings, cumulative, emiCost: year <= 10 ? 14100 * 12 : 0 };
    });
}

export default function FinancingPage() {
    const [tab, setTab] = useState<'options' | 'roi' | 'subsidies'>('options');
    const [roiParams, setRoiParams] = useState({ systemCost: 500000, capacity: 6.4, rate: 8, inflation: 5, financing: 70 });
    const roiData = generateROI();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Green <span className="solar-gradient-text">Financing</span></h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Compare loans, simulate ROI, and find subsidies</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--border-color)] pb-px">
                {[
                    { key: 'options', label: '🏦 Financing Options', icon: Building2 },
                    { key: 'roi', label: '📊 ROI Simulator', icon: Calculator },
                    { key: 'subsidies', label: '🏛️ Subsidies', icon: Star },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key as any)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition ${tab === t.key ? 'bg-orange-500/10 text-orange-500 border-b-2 border-orange-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'options' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {financingOptions.map((opt, i) => (
                        <motion.div key={opt.id} custom={i} initial="hidden" animate="visible" variants={fadeInUp}
                            className="glass-card p-5 hover:border-orange-500/30 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold">{opt.provider}</h3>
                                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-500 rounded-full">{opt.type}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <Star key={j} className={`w-3 h-3 ${j < Math.floor(opt.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                        <span className="text-xs text-[var(--text-secondary)] ml-1">{opt.rating}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 text-center">
                                    <div>
                                        <div className="text-xl font-bold text-green-500">{opt.rate}%</div>
                                        <div className="text-xs text-[var(--text-secondary)]">Interest Rate</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold">{formatCurrency(opt.emi)}</div>
                                        <div className="text-xs text-[var(--text-secondary)]">Monthly EMI</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold">{formatCurrency(opt.maxAmount)}</div>
                                        <div className="text-xs text-[var(--text-secondary)]">Max Amount</div>
                                    </div>
                                </div>

                                <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-glow transition text-sm flex items-center gap-1 whitespace-nowrap">
                                    Apply <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {tab === 'roi' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Input Parameters */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Calculator className="w-5 h-5 text-orange-500" /> ROI Parameters</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { label: 'System Cost (Rs)', key: 'systemCost', value: roiParams.systemCost },
                                { label: 'Capacity (kW)', key: 'capacity', value: roiParams.capacity },
                                { label: 'Electricity Rate (Rs/kWh)', key: 'rate', value: roiParams.rate },
                                { label: 'Rate Inflation (%)', key: 'inflation', value: roiParams.inflation },
                                { label: 'Financing (%)', key: 'financing', value: roiParams.financing },
                            ].map(p => (
                                <div key={p.key}>
                                    <label className="text-sm font-medium mb-1.5 block">{p.label}</label>
                                    <input type="number" value={p.value} onChange={e => setRoiParams(prev => ({ ...prev, [p.key]: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ROI Summary */}
                    <div className="grid sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Break Even', value: '3.5 Years', color: 'text-green-500' },
                            { label: '25-Year Savings', value: 'Rs 8.5M', color: 'text-orange-500' },
                            { label: 'IRR', value: '28.5%', color: 'text-blue-500' },
                            { label: 'NPV', value: 'Rs 4.2M', color: 'text-emerald-500' },
                        ].map((m, i) => (
                            <div key={i} className="glass-card p-5 text-center">
                                <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                                <div className="text-sm text-[var(--text-secondary)]">{m.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">25-Year Cash Flow Projection</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={roiData.slice(0, 15)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={12} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }} />
                                <Bar dataKey="savings" fill="#22c55e" radius={[4, 4, 0, 0]} name="Annual Savings (Rs)" />
                                <Bar dataKey="emiCost" fill="#ef4444" radius={[4, 4, 0, 0]} name="EMI Cost (Rs)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {tab === 'subsidies' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="glass-card p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                        <h3 className="text-lg font-semibold mb-2">🏛️ State Bank of Pakistan (SBP) Refinancing Scheme</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">Concessional loans for renewable energy (Category I & II)</p>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { capacity: 'Up to 1 MW', subsidy: '6% Flat Rate', total: 'Max 10 Years' },
                                { capacity: '1 MW - 50 MW', subsidy: '6% Flat Rate', total: 'Max 10 Years' },
                                { capacity: 'LED Replacement', subsidy: 'Markup 6%', total: 'Max 5 Years' },
                            ].map((s, i) => (
                                <div key={i} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                                    <div className="text-lg font-bold text-green-500">{s.subsidy}</div>
                                    <div className="text-sm font-medium">{s.capacity}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Tenure: {s.total}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">📋 Eligibility Criteria</h3>
                        <ul className="space-y-3 text-sm">
                            {[
                                'Must be a valid electricity consumer in Pakistan',
                                'Applicable for residential, commercial and industrial sectors',
                                'CNIC holder with active bank account',
                                'Installation via AEDB certified vendors only',
                                'Net Metering license required for grid feedback',
                            ].map((e, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">✓</span>
                                    {e}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
