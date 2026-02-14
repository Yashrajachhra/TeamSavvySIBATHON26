'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, DollarSign, Leaf, Sun, TrendingUp, Battery, Droplets, ArrowUpRight, ArrowDownRight, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { formatNumber, formatKWh } from '@/lib/utils';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function DashboardHome() {
    const user = useAuthStore(s => s.user);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/api/dashboard/summary');
                if (data.success) {
                    setMetrics(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading || !metrics) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 skeleton" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton" />)}
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-80 skeleton" />)}
                </div>
            </div>
        );
    }

    const { energy, financial, distribution, systemHealth, environmental, location, design, dataSource } = metrics;
    const currency = financial.currency || 'PKR';
    const currencySymbol = currency === 'PKR' ? 'Rs' : currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'AED' ? 'AED' : currency;

    const pieData = [
        { name: 'Self-Consumed', value: distribution.selfConsumed, color: '#22c55e' },
        { name: 'Exported', value: distribution.exported, color: '#f97316' },
        { name: 'Grid Import', value: distribution.gridImport, color: '#64748b' },
    ];

    // Compare to a "clean panels" baseline for change indicators
    const cleanBaseline = energy.capacity * energy.currentPSH;
    const todayVsClean = cleanBaseline > 0 ? Math.round((energy.todayEstimate / cleanBaseline - 1) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, <span className="solar-gradient-text">{user?.fullName?.split(' ')[0] || 'User'}</span> 👋</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Here&apos;s how your solar system is performing today
                        {location && (
                            <span className="inline-flex items-center gap-1 ml-2 text-orange-500">
                                <MapPin className="w-3 h-3" />
                                {location.city !== 'Unknown' ? location.city : `${location.lat?.toFixed(2)}°, ${location.lng?.toFixed(2)}°`}
                            </span>
                        )}
                        {design && (
                            <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs border border-green-500/20">
                                Using: {design.name || 'Solar Design'}
                            </span>
                        )}
                        {!design && dataSource === 'default' && (
                            <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20">
                                No design yet — using defaults
                            </span>
                        )}
                    </p>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-xs text-[var(--text-secondary)]">System Capacity</div>
                    <div className="text-lg font-bold">{energy.capacity} kW</div>
                    <div className="text-xs text-[var(--text-secondary)]">{systemHealth.panelCount} × {systemHealth.panelWattage || 400}W</div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        icon: Zap, label: "Today's Production",
                        value: `${energy.todaySoFar} kWh`,
                        sub: `Est. ${energy.todayEstimate} kWh by sunset`,
                        change: `PSH ${energy.currentPSH}`, positive: true,
                        color: 'from-orange-500 to-yellow-500',
                    },
                    {
                        icon: DollarSign, label: 'Monthly Savings',
                        value: `${currencySymbol} ${financial.monthlySavings.toLocaleString()}`,
                        sub: `${formatKWh(energy.monthlyTotal)} this month`,
                        change: `${currencySymbol} ${financial.electricityRate}/kWh`, positive: true,
                        color: 'from-green-500 to-emerald-500',
                    },
                    {
                        icon: Battery, label: 'System Efficiency',
                        value: `${systemHealth.efficiency}%`,
                        sub: `Soiling: ${systemHealth.soilingLoss}% | Degradation: ${systemHealth.degradation}%`,
                        change: systemHealth.dustLevel === 'low' ? 'Clean' : systemHealth.dustLevel === 'medium' ? 'Moderate' : 'Needs cleaning',
                        positive: systemHealth.dustLevel === 'low',
                        color: 'from-blue-500 to-cyan-500',
                    },
                    {
                        icon: Leaf, label: 'CO₂ Saved',
                        value: `${environmental.co2Offset} tons`,
                        sub: `${environmental.co2PerYear} tons/year`,
                        change: `${environmental.treesEquivalent} trees equiv.`, positive: true,
                        color: 'from-emerald-500 to-green-500',
                    },
                ].map((card, i) => (
                    <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={fadeInUp}
                        className="glass-card p-5"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${card.positive ? 'text-green-600 bg-green-500/10' : 'text-orange-600 bg-orange-500/10'}`}>
                                {card.change}
                            </span>
                        </div>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <div className="text-sm text-[var(--text-secondary)] mt-1">{card.label}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5 opacity-70">{card.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Annual Energy Production Chart (from API) */}
                <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">Annual Energy Production</h2>
                            <p className="text-xs text-[var(--text-secondary)]">{formatKWh(energy.yearlyTotal)} per year at {location?.lat?.toFixed(2)}° latitude</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> Produced</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Self-used</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> Exported</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={energy.monthlyBreakdown}>
                            <defs>
                                <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} unit=" kWh" />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                                formatter={(value: number, name: string) => [`${value} kWh`, name]}
                            />
                            <Area type="monotone" dataKey="produced" stroke="#f97316" fill="url(#gradOrange)" strokeWidth={2} name="Produced" />
                            <Area type="monotone" dataKey="consumed" stroke="#22c55e" fill="url(#gradGreen)" strokeWidth={2} name="Self-used" />
                            <Area type="monotone" dataKey="exported" stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Exported" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Energy Distribution Pie (from API) */}
                <motion.div custom={5} initial="hidden" animate="visible" variants={fadeInUp} className="glass-card p-6">
                    <h2 className="text-lg font-semibold mb-4">Energy Distribution</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                                formatter={(value: number) => [`${value}%`]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                        {pieData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                                    {item.name}
                                </span>
                                <span className="font-medium">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Weekly Performance (from API) */}
                <motion.div custom={6} initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">This Week</h2>
                        <div className="text-xs text-[var(--text-secondary)]">
                            Avg: {(energy.weeklyData.reduce((s: number, d: any) => s + d.production, 0) / 7).toFixed(1)} kWh/day
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={energy.weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} unit=" kWh" />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                                formatter={(value: number, name: string) => {
                                    if (name === 'production') return [`${value} kWh`, 'Production'];
                                    return [`${currencySymbol} ${value}`, 'Savings'];
                                }}
                            />
                            <Bar dataKey="production" fill="#f97316" radius={[6, 6, 0, 0]} name="production" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* System Health (from API) */}
                <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp} className="glass-card p-6">
                    <h2 className="text-lg font-semibold mb-4">System Health</h2>
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-4">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                                <circle cx="50" cy="50" r="45" fill="none"
                                    stroke={systemHealth.efficiency > 80 ? '#22c55e' : systemHealth.efficiency > 60 ? '#f97316' : '#ef4444'}
                                    strokeWidth="8"
                                    strokeDasharray={`${systemHealth.efficiency * 2.83} 283`}
                                    strokeLinecap="round" className="gauge-fill" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-3xl font-black ${systemHealth.efficiency > 80 ? 'text-green-500' : systemHealth.efficiency > 60 ? 'text-orange-500' : 'text-red-500'}`}>
                                    {systemHealth.efficiency}%
                                </span>
                                <span className="text-xs text-[var(--text-secondary)]">Overall</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mt-4">
                        {[
                            { label: 'Panels', value: `${systemHealth.panelCount} × ${systemHealth.panelWattage || 400}W` },
                            { label: 'Tilt / Azimuth', value: `${systemHealth.tiltAngle}° / ${systemHealth.azimuthAngle}°` },
                            {
                                label: 'Dust Level',
                                value: systemHealth.dustLevel.toUpperCase(),
                                color: systemHealth.dustLevel === 'low' ? 'text-green-500' : systemHealth.dustLevel === 'medium' ? 'text-yellow-500' : 'text-red-500',
                            },
                            { label: 'Soiling Loss', value: `${systemHealth.soilingLoss}%`, color: systemHealth.soilingLoss > 5 ? 'text-orange-500' : 'text-green-500' },
                            ...(systemHealth.shadowLoss > 0 ? [{ label: 'Shadow Loss', value: `${systemHealth.shadowLoss}%`, color: 'text-orange-500' }] : []),
                            { label: 'System Losses', value: `${systemHealth.systemLosses}%` },
                            { label: 'Last Cleaned', value: `${systemHealth.daysSinceClean} days ago` },
                            { label: 'Next Cleaning', value: new Date(systemHealth.nextCleaningDate).toLocaleDateString() },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">{item.label}</span>
                                <span className={`font-medium ${item.color || ''}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Environmental Impact (from API) */}
            <motion.div custom={8} initial="hidden" animate="visible" variants={fadeInUp}>
                <div className="glass-card p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                    <h2 className="text-lg font-semibold mb-4">🌍 Environmental Impact</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-black text-green-500">{environmental.co2Offset}</div>
                            <div className="text-sm text-[var(--text-secondary)]">Tons CO₂ Saved</div>
                            <div className="text-xs text-[var(--text-secondary)] mt-1">{environmental.co2PerYear} tons/year</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-green-500">{environmental.treesEquivalent}</div>
                            <div className="text-sm text-[var(--text-secondary)]">Trees Equivalent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-green-500">{formatNumber(environmental.milesNotDriven)}</div>
                            <div className="text-sm text-[var(--text-secondary)]">Miles Not Driven</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
