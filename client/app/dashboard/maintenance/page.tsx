'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Wind, Thermometer, Cloud, AlertTriangle, CheckCircle, Calendar, Plus, History, MapPin, RefreshCw, Navigation } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocationStore } from '@/store/useLocationStore';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

export default function MaintenancePage() {
    const [tab, setTab] = useState<'status' | 'schedule' | 'history'>('status');
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [dustStatus, setDustStatus] = useState<any>(null);
    const [schedule, setSchedule] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [newLog, setNewLog] = useState({
        method: 'water_wash',
        cost: 500,
        notes: '',
        performedBy: 'self'
    });

    const user = useAuthStore(s => s.user);
    const { lat, lng, setLocation, initializeFromUser } = useLocationStore();

    // Initialize location from user profile on mount
    useEffect(() => {
        if (user) {
            initializeFromUser(user);
        }
    }, [user, initializeFromUser]);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }
        const toastId = toast.loading('Locating...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(
                    position.coords.latitude.toFixed(6),
                    position.coords.longitude.toFixed(6)
                );
                toast.success('Location updated!', { id: toastId });
            },
            (error) => {
                console.error(error);
                toast.error('Unable to retrieve your location', { id: toastId });
            }
        );
    };

    const fetchMaintenanceData = useCallback(async () => {
        if (!lat || !lng) {
            toast.error('Please enter valid coordinates');
            return;
        }

        setLoading(true);
        setFetched(false);

        const queryParams = `?lat=${lat}&lng=${lng}`;
        let loaded = 0;
        const total = 3;
        const checkDone = () => { loaded++; if (loaded >= total) { setLoading(false); setFetched(true); } };

        // Dust status
        api.get(`/api/maintenance/dust-status${queryParams}`)
            .then(res => { if (res.data.success) setDustStatus(res.data.data); })
            .catch(err => { console.error('Dust status error:', err.message); toast.error('Failed to load dust status'); })
            .finally(checkDone);

        // Cleaning schedule (longer timeout)
        api.get(`/api/maintenance/cleaning-schedule${queryParams}`, { timeout: 60000 })
            .then(res => { if (res.data.success) setSchedule(res.data.data); })
            .catch(err => { console.error('Schedule error:', err.message); })
            .finally(checkDone);

        // History (not location-dependent but load alongside)
        api.get('/api/maintenance/history')
            .then(res => { if (res.data.success) setHistory(res.data.data.logs); })
            .catch(err => console.error('History error:', err.message))
            .finally(checkDone);
    }, [lat, lng]);

    const handleLogCleaning = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Logging cleaning...');
        try {
            const { data } = await api.post('/api/maintenance/log-cleaning', {
                ...newLog,
                date: new Date().toISOString(),
                efficiencyBefore: 100 - (dustStatus?.currentDustLevel || 0),
                efficiencyAfter: 100
            });

            if (data.success) {
                toast.success('Cleaning logged successfully!', { id: toastId });
                setHistory([data.data.log, ...history]);
                setShowLogModal(false);
                // Refresh dust status for new location
                const queryParams = `?lat=${lat}&lng=${lng}`;
                const dustRes = await api.get(`/api/maintenance/dust-status${queryParams}`);
                if (dustRes.data.success) setDustStatus(dustRes.data.data);
            }
        } catch (error) {
            toast.error('Failed to log cleaning', { id: toastId });
        }
    };

    const currentDust = dustStatus?.currentDustLevel || 0;
    const efficiencyLoss = dustStatus?.efficiencyLoss || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Panel <span className="solar-gradient-text">Maintenance</span></h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        AI-powered dust monitoring and cleaning recommendations
                        {dustStatus && (
                            dustStatus.dataSource === 'estimated' || dustStatus.weather?.source === 'estimated' || dustStatus.weather?.source === 'fallback' ? (
                                <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                    ⚠ Estimated — weather APIs unavailable
                                </span>
                            ) : (
                                <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                                    ● Live data from {dustStatus.weather?.source || 'API'}
                                </span>
                            )
                        )}
                    </p>
                </div>
                {fetched && (
                    <button
                        onClick={() => setShowLogModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                    >
                        <Plus className="w-4 h-4" /> Log Cleaning
                    </button>
                )}
            </div>

            {/* Location Section */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" /> Solar System Location
                </h3>
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Coordinate Inputs */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1.5 block">Latitude</label>
                                <input
                                    value={lat}
                                    onChange={e => setLocation(e.target.value, lng)}
                                    placeholder="e.g. 24.8607"
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1.5 block">Longitude</label>
                                <input
                                    value={lng}
                                    onChange={e => setLocation(lat, e.target.value)}
                                    placeholder="e.g. 67.0011"
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleLocateMe}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-orange-500/50 transition text-sm font-medium"
                            >
                                <Navigation className="w-4 h-4 text-orange-500" /> Locate Me
                            </button>
                            <button
                                onClick={fetchMaintenanceData}
                                disabled={loading || !lat || !lng}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Fetching...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" /> {fetched ? 'Refresh Data' : 'Get Maintenance Data'}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Quick location presets */}
                        <div>
                            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Quick Locations</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Karachi', lat: '24.8607', lng: '67.0011' },
                                    { label: 'Lahore', lat: '31.5497', lng: '74.3436' },
                                    { label: 'Islamabad', lat: '33.6844', lng: '73.0479' },
                                    { label: 'Delhi', lat: '28.6139', lng: '77.2090' },
                                    { label: 'Dubai', lat: '25.2048', lng: '55.2708' },
                                ].map(loc => (
                                    <button
                                        key={loc.label}
                                        onClick={() => setLocation(loc.lat, loc.lng)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${lat === loc.lat && lng === loc.lng
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-orange-500/50'
                                            }`}
                                    >
                                        {loc.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map Preview */}
                    <div className="space-y-2">
                        <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] relative h-[220px] group">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng) - 0.01}%2C${parseFloat(lat) - 0.01}%2C${parseFloat(lng) + 0.01}%2C${parseFloat(lat) + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
                                className="opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute bottom-2 right-2 text-[10px] bg-white/80 dark:bg-black/50 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                                © OpenStreetMap contributors
                            </div>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] text-center">
                            Real weather, air quality, and dust data will be fetched for this location
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center mb-4 animate-pulse">
                        <Droplets className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Fetching maintenance data...</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Getting real weather, AQI, and dust analysis for ({lat}, {lng})</p>
                    <div className="mt-4 w-48 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                            initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 4 }} />
                    </div>
                </motion.div>
            )}

            {/* Data loaded — show tabs and content */}
            {fetched && !loading && (
                <>
                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-[var(--border-color)] pb-px">
                        {[
                            { key: 'status', label: '📊 Current Status' },
                            { key: 'schedule', label: '📅 Cleaning Schedule' },
                            { key: 'history', label: '📜 History' },
                        ].map(t => (
                            <button key={t.key} onClick={() => setTab(t.key as any)}
                                className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition ${tab === t.key ? 'bg-orange-500/10 text-orange-500 border-b-2 border-orange-500' : 'text-[var(--text-secondary)]'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {tab === 'status' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            {/* Status Cards */}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { icon: Droplets, label: 'Dust Level', value: `${currentDust.toFixed(1)}%`, urgency: currentDust > 50 ? 'High' : 'Moderate', color: currentDust > 50 ? 'text-red-500' : 'text-yellow-500' },
                                    { icon: Wind, label: 'Efficiency Loss', value: `${efficiencyLoss}%`, urgency: efficiencyLoss > 8 ? 'Needs Cleaning' : 'Acceptable', color: efficiencyLoss > 8 ? 'text-red-500' : 'text-yellow-500' },
                                    { icon: Thermometer, label: 'Temperature', value: `${dustStatus?.weather?.temperature?.toFixed(1) || 30}°C`, urgency: 'Normal', color: 'text-green-500' },
                                    { icon: Cloud, label: 'AQI', value: dustStatus?.weather?.aqi || 'N/A', urgency: (dustStatus?.weather?.aqi || 0) > 150 ? 'Unhealthy' : 'Moderate', color: (dustStatus?.weather?.aqi || 0) > 150 ? 'text-red-500' : 'text-yellow-500' },
                                ].map((card, i) => (
                                    <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={fadeInUp} className="glass-card p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <card.icon className={`w-6 h-6 ${card.color}`} />
                                            <span className={`text-xs font-medium ${card.color}`}>{card.urgency}</span>
                                        </div>
                                        <div className="text-2xl font-bold">{card.value}</div>
                                        <div className="text-sm text-[var(--text-secondary)]">{card.label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Location Weather Card */}
                            {dustStatus?.weather && (
                                <div className="glass-card p-5 flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
                                            {dustStatus.weather.description?.includes('rain') ? '🌧️' :
                                             dustStatus.weather.description?.includes('cloud') ? '⛅' :
                                             dustStatus.weather.description?.includes('haze') || dustStatus.weather.description?.includes('fog') ? '🌫️' : '☀️'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold capitalize">{dustStatus.weather.description}</div>
                                            <div className="text-xs text-[var(--text-secondary)]">
                                                {dustStatus.season && <span className="capitalize">{dustStatus.season} season</span>}
                                                {dustStatus.regionType && <span> · {dustStatus.regionType} area</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
                                        <div><span className="text-[var(--text-secondary)]">PM2.5:</span> <span className="font-semibold">{dustStatus.weather.pm25}</span></div>
                                        <div><span className="text-[var(--text-secondary)]">PM10:</span> <span className="font-semibold">{dustStatus.weather.pm10}</span></div>
                                        <div><span className="text-[var(--text-secondary)]">Wind:</span> <span className="font-semibold">{dustStatus.weather.windSpeed} km/h</span></div>
                                        <div><span className="text-[var(--text-secondary)]">Humidity:</span> <span className="font-semibold">{dustStatus.weather.humidity}%</span></div>
                                    </div>
                                    {dustStatus.daysSinceClean !== undefined && (
                                        <div className="ml-auto text-right">
                                            <div className="text-xs text-[var(--text-secondary)]">Last cleaned</div>
                                            <div className="font-semibold">{dustStatus.daysSinceClean} days ago</div>
                                        </div>
                                    )}
                                </div>
                            )}

                    {/* Alert Banner */}
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${efficiencyLoss > 5 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400' : 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'}`}>
                        {efficiencyLoss > 5 ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                        <div className="text-sm">
                            <span className="font-semibold">{efficiencyLoss > 5 ? 'Cleaning Recommended' : 'Panels Clean'}</span>
                            {' — '}Your panels have lost {efficiencyLoss}% efficiency due to dust buildup.
                            {efficiencyLoss > 5 ? ' Clean soon to recover performance.' : ' Keep monitoring.'}
                        </div>
                    </div>

                    {/* Soiling Analysis Breakdown */}
                    {dustStatus?.dailySoilingRate !== undefined && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4">Soiling Analysis</h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Daily rate + explanation */}
                                <div className="space-y-3">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-orange-500">{dustStatus.dailySoilingRate}%</span>
                                        <span className="text-sm text-[var(--text-secondary)]">daily soiling rate</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        Based on real-time PM10 ({dustStatus.weather?.pm10} µg/m³), AQI ({dustStatus.weather?.aqi}),
                                        humidity ({dustStatus.weather?.humidity}%), and wind ({dustStatus.weather?.windSpeed} km/h)
                                        in a {dustStatus.regionType} {dustStatus.season} environment.
                                    </p>
                                </div>
                                {/* Factor bars */}
                                {dustStatus.soilingFactors && (
                                    <div className="space-y-2">
                                        {[
                                            { label: 'PM10 Impact', value: dustStatus.soilingFactors.pm10_factor, desc: dustStatus.weather?.pm10 > 100 ? 'High dust particles' : dustStatus.weather?.pm10 > 50 ? 'Moderate dust' : 'Low dust' },
                                            { label: 'Air Quality', value: dustStatus.soilingFactors.aqi_factor, desc: dustStatus.weather?.aqi > 150 ? 'Unhealthy AQI' : dustStatus.weather?.aqi > 100 ? 'Moderate AQI' : 'Good AQI' },
                                            { label: 'Humidity', value: dustStatus.soilingFactors.humidity_factor, desc: dustStatus.weather?.humidity > 70 ? 'Dust sticks more' : 'Normal' },
                                            { label: 'Wind', value: dustStatus.soilingFactors.wind_factor, desc: dustStatus.weather?.windSpeed > 20 ? 'Self-cleaning wind' : 'Normal wind' },
                                            { label: 'Season', value: dustStatus.soilingFactors.season_factor, desc: dustStatus.season === 'monsoon' ? 'Rain reduces dust' : `${dustStatus.season} season` },
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-24 text-xs font-medium text-[var(--text-secondary)]">{f.label}</div>
                                                <div className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${f.value > 1.2 ? 'bg-red-500' : f.value < 0.9 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                        style={{ width: `${Math.min(100, (f.value / 2.5) * 100)}%` }}
                                                    />
                                                </div>
                                                <div className="w-10 text-xs font-bold text-right">{f.value}x</div>
                                                <div className="w-28 text-[10px] text-[var(--text-secondary)] hidden sm:block">{f.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                            {/* 7-Day Dust Forecast */}
                            {schedule?.forecast && schedule.forecast.length > 0 && (
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-semibold mb-4">7-Day Dust Prediction</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                        {schedule.forecast.map((d: any, i: number) => (
                                            <div key={i} className={`text-center p-4 rounded-xl transition ${d.recommendation === 'good_day_to_clean' ? 'bg-green-500/10 border border-green-500/20' : 'bg-[var(--bg-secondary)]'}`}>
                                                <div className="text-xs font-medium mb-1">{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                <div className="text-2xl mb-2">{d.rain ? '🌧️' : d.dustLevel > 50 ? '🌫️' : '☀️'}</div>
                                                <div className="text-sm font-bold">{typeof d.dustLevel === 'number' ? d.dustLevel.toFixed(0) : d.dustLevel}%</div>
                                                <div className={`text-[10px] uppercase font-bold mt-1 ${d.recommendation === 'good_day_to_clean' ? 'text-green-500' : 'text-[var(--text-secondary)]'}`}>
                                                    {d.recommendation === 'good_day_to_clean' ? 'Ideal' : 'Wait'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {tab === 'schedule' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="glass-card p-6 bg-gradient-to-r from-orange-500/5 to-yellow-500/5">
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-500" /> AI Recommended Cleaning
                                    {schedule?.dataSource === 'estimated' && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-normal">Estimated</span>
                                    )}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    Based on weather forecast, dust prediction, and cost-benefit analysis
                                    {schedule?.currency && schedule?.electricityRate && (
                                        <span className="text-xs ml-1">({schedule.electricityRate} {schedule.currency}/kWh)</span>
                                    )}
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                                        <div className="text-sm text-[var(--text-secondary)] mb-1">Recommended Date</div>
                                        <div className="text-xl font-bold text-orange-500">
                                            {schedule?.recommendedDate ? new Date(schedule.recommendedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                        </div>
                                        <div className="text-xs text-[var(--text-secondary)] mt-1">Urgency: <span className="uppercase font-bold">{schedule?.urgency}</span></div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                                        <div className="text-sm text-[var(--text-secondary)] mb-1">Expected Recovery</div>
                                        <div className="text-xl font-bold text-green-500">+{schedule?.estimatedRecovery}% efficiency</div>
                                        <div className="text-xs text-[var(--text-secondary)] mt-1">
                                            ROI Score: {schedule?.costBenefitRatio}
                                            {schedule?.cleaningCost && schedule?.currency && (
                                                <span className="ml-2">· Cleaning: {schedule.cleaningCost} {schedule.currency}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold mb-4 text-center">Upcoming Schedule</h3>
                                <div className="space-y-3">
                                    {schedule?.calendarEvents?.map((ev: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex flex-col items-center justify-center text-orange-500">
                                                    <span className="text-[10px] font-bold uppercase">{new Date(ev.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                    <span className="text-lg font-black leading-none">{new Date(ev.date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold capitalize">{ev.type.replace(/_/g, ' ')}</div>
                                                    <div className="text-xs text-[var(--text-secondary)]">Automated prediction</div>
                                                </div>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 font-bold uppercase">{ev.urgency}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {tab === 'history' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            {history.length === 0 ? (
                                <div className="glass-card p-12 text-center text-[var(--text-secondary)]">
                                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No cleaning history yet</p>
                                </div>
                            ) : history.map((log, i) => (
                                <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={fadeInUp} className="glass-card p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium capitalize">{log.method.replace(/_/g, ' ')}</div>
                                                <div className="text-sm text-[var(--text-secondary)]">{new Date(log.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-sm font-semibold text-green-500">+{log.efficiencyAfter - log.efficiencyBefore}%</div>
                                                <div className="text-xs text-[var(--text-secondary)]">Recovery</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">{log.cost > 0 ? `Rs ${log.cost}` : 'Free'}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">Cost</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold capitalize">{log.performedBy}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">By</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </>
            )}

            {/* Prompt to fetch if not yet loaded */}
            {!fetched && !loading && (
                <div className="glass-card p-12 text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-orange-500/30" />
                    <h3 className="text-lg font-semibold mb-2">Set your location to get started</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Enter your solar system coordinates above or use &quot;Locate Me&quot;, then click <strong>Get Maintenance Data</strong>
                    </p>
                </div>
            )}

            {/* Log Cleaning Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-md p-6 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold mb-4">Log Panel Cleaning</h2>
                        <form onSubmit={handleLogCleaning} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Cleaning Method</label>
                                <select
                                    className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-orange-500 outline-none"
                                    value={newLog.method}
                                    onChange={e => setNewLog({ ...newLog, method: e.target.value })}
                                >
                                    <option value="water_wash">Water Wash</option>
                                    <option value="dry_brush">Dry Brush</option>
                                    <option value="professional">Professional Service</option>
                                    <option value="robotic">Robotic Cleaning</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cost (Rs)</label>
                                <input
                                    type="number"
                                    className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-orange-500 outline-none"
                                    value={newLog.cost}
                                    onChange={e => setNewLog({ ...newLog, cost: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea
                                    className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-orange-500 outline-none h-24"
                                    placeholder="Add any observations..."
                                    value={newLog.notes}
                                    onChange={e => setNewLog({ ...newLog, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLogModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition font-medium shadow-lg shadow-orange-500/20"
                                >
                                    Save Log
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
