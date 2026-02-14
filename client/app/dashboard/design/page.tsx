'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, PanelTop, Sun, Ruler, ScanEye, ArrowRight, RotateCw, Zap, Home, TrendingUp, Leaf, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Roof type definitions with inline SVG illustrations               */
/* ------------------------------------------------------------------ */
const ROOF_TYPES = [
    {
        id: 'flat',
        label: 'Flat Roof',
        desc: 'Level surface, ideal for panel placement',
        usablePct: 0.80,
        defaultTilt: 5,
    },
    {
        id: 'gable',
        label: 'Gable Roof',
        desc: 'Classic A-frame, panels on south-facing side',
        usablePct: 0.65,
        defaultTilt: 25,
    },
    {
        id: 'hip',
        label: 'Hip Roof',
        desc: 'Sloped on all four sides',
        usablePct: 0.55,
        defaultTilt: 22,
    },
    {
        id: 'shed',
        label: 'Shed / Lean-to',
        desc: 'Single slope, good for south-facing',
        usablePct: 0.75,
        defaultTilt: 18,
    },
    {
        id: 'mansard',
        label: 'Mansard Roof',
        desc: 'Double-slope on each side, French style',
        usablePct: 0.50,
        defaultTilt: 30,
    },
    {
        id: 'gambrel',
        label: 'Gambrel Roof',
        desc: 'Barn-style, two slopes per side',
        usablePct: 0.58,
        defaultTilt: 28,
    },
];

/* Inline SVG illustrations for each roof type */
function RoofIllustration({ type, size = 240, showPanels = false }: { type: string; size?: number; showPanels?: boolean }) {
    const w = size;
    const h = size * 0.7;
    const panelColor = '#f97316';
    const panelStroke = '#ea580c';
    const roofFill = '#64748b';
    const roofStroke = '#334155';
    const wallFill = '#cbd5e1';
    const wallStroke = '#94a3b8';

    switch (type) {
        case 'flat':
            return (
                <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mx-auto">
                    {/* Wall */}
                    <rect x={w * 0.15} y={h * 0.35} width={w * 0.7} height={h * 0.55} fill={wallFill} stroke={wallStroke} strokeWidth="2" rx="2" />
                    {/* Flat roof */}
                    <rect x={w * 0.1} y={h * 0.28} width={w * 0.8} height={h * 0.1} fill={roofFill} stroke={roofStroke} strokeWidth="2" rx="3" />
                    {/* Panels */}
                    {showPanels && (
                        <g>
                            {[0, 1, 2, 3, 4].map(i => (
                                <rect key={i} x={w * 0.14 + i * w * 0.145} y={h * 0.29} width={w * 0.12} height={h * 0.07} fill={panelColor} stroke={panelStroke} strokeWidth="1" rx="1" opacity="0.9" />
                            ))}
                        </g>
                    )}
                    {/* Windows */}
                    <rect x={w * 0.25} y={h * 0.5} width={w * 0.12} height={h * 0.15} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.63} y={h * 0.5} width={w * 0.12} height={h * 0.15} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    {/* Door */}
                    <rect x={w * 0.42} y={h * 0.55} width={w * 0.16} height={h * 0.35} fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" rx="2" />
                </svg>
            );

        case 'gable':
            return (
                <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mx-auto">
                    {/* Wall */}
                    <rect x={w * 0.15} y={h * 0.45} width={w * 0.7} height={h * 0.45} fill={wallFill} stroke={wallStroke} strokeWidth="2" rx="2" />
                    {/* Gable roof (triangle) */}
                    <polygon points={`${w * 0.1},${h * 0.45} ${w * 0.5},${h * 0.1} ${w * 0.9},${h * 0.45}`} fill={roofFill} stroke={roofStroke} strokeWidth="2" />
                    {/* Panels on right slope */}
                    {showPanels && (
                        <g>
                            {[0, 1, 2].map(i => (
                                <rect key={i}
                                    x={w * 0.53 + i * w * 0.1}
                                    y={h * 0.24 + i * h * 0.065}
                                    width={w * 0.09}
                                    height={h * 0.06}
                                    fill={panelColor} stroke={panelStroke} strokeWidth="1" rx="1" opacity="0.9"
                                    transform={`rotate(-18, ${w * 0.53 + i * w * 0.1 + w * 0.045}, ${h * 0.24 + i * h * 0.065 + h * 0.03})`}
                                />
                            ))}
                        </g>
                    )}
                    {/* Windows */}
                    <rect x={w * 0.25} y={h * 0.55} width={w * 0.12} height={h * 0.15} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.63} y={h * 0.55} width={w * 0.12} height={h * 0.15} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    {/* Door */}
                    <rect x={w * 0.42} y={h * 0.6} width={w * 0.16} height={h * 0.3} fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" rx="2" />
                </svg>
            );

        case 'hip':
            return (
                <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mx-auto">
                    {/* Wall */}
                    <rect x={w * 0.15} y={h * 0.5} width={w * 0.7} height={h * 0.4} fill={wallFill} stroke={wallStroke} strokeWidth="2" rx="2" />
                    {/* Hip roof — four slopes meeting at a ridge */}
                    <polygon points={`${w * 0.1},${h * 0.5} ${w * 0.35},${h * 0.15} ${w * 0.65},${h * 0.15} ${w * 0.9},${h * 0.5}`} fill={roofFill} stroke={roofStroke} strokeWidth="2" />
                    {/* Ridge line */}
                    <line x1={w * 0.35} y1={h * 0.15} x2={w * 0.65} y2={h * 0.15} stroke={roofStroke} strokeWidth="2" />
                    {/* Panels on front slope */}
                    {showPanels && (
                        <g>
                            {[0, 1, 2].map(i => (
                                <rect key={i}
                                    x={w * 0.32 + i * w * 0.12}
                                    y={h * 0.22 + i * h * 0.05}
                                    width={w * 0.1}
                                    height={h * 0.06}
                                    fill={panelColor} stroke={panelStroke} strokeWidth="1" rx="1" opacity="0.9"
                                />
                            ))}
                        </g>
                    )}
                    {/* Windows */}
                    <rect x={w * 0.25} y={h * 0.58} width={w * 0.12} height={h * 0.13} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.63} y={h * 0.58} width={w * 0.12} height={h * 0.13} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.42} y={h * 0.6} width={w * 0.16} height={h * 0.3} fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" rx="2" />
                </svg>
            );

        case 'shed':
            return (
                <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mx-auto">
                    {/* Wall */}
                    <polygon points={`${w * 0.15},${h * 0.3} ${w * 0.85},${h * 0.45} ${w * 0.85},${h * 0.9} ${w * 0.15},${h * 0.9}`} fill={wallFill} stroke={wallStroke} strokeWidth="2" />
                    {/* Shed roof — single slope */}
                    <polygon points={`${w * 0.1},${h * 0.25} ${w * 0.9},${h * 0.4} ${w * 0.9},${h * 0.47} ${w * 0.1},${h * 0.32}`} fill={roofFill} stroke={roofStroke} strokeWidth="2" />
                    {/* Panels along slope */}
                    {showPanels && (
                        <g>
                            {[0, 1, 2, 3].map(i => (
                                <rect key={i}
                                    x={w * 0.15 + i * w * 0.175}
                                    y={h * 0.27 + i * h * 0.032}
                                    width={w * 0.14}
                                    height={h * 0.06}
                                    fill={panelColor} stroke={panelStroke} strokeWidth="1" rx="1" opacity="0.9"
                                    transform={`rotate(5, ${w * 0.15 + i * w * 0.175 + w * 0.07}, ${h * 0.27 + i * h * 0.032 + h * 0.03})`}
                                />
                            ))}
                        </g>
                    )}
                    {/* Window */}
                    <rect x={w * 0.3} y={h * 0.55} width={w * 0.12} height={h * 0.15} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.55} y={h * 0.58} width={w * 0.12} height={h * 0.15} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.42} y={h * 0.62} width={w * 0.14} height={h * 0.28} fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" rx="2" />
                </svg>
            );

        case 'mansard':
            return (
                <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mx-auto">
                    {/* Wall */}
                    <rect x={w * 0.2} y={h * 0.55} width={w * 0.6} height={h * 0.35} fill={wallFill} stroke={wallStroke} strokeWidth="2" rx="2" />
                    {/* Mansard — steep lower, flat upper */}
                    <polygon points={`${w * 0.15},${h * 0.55} ${w * 0.25},${h * 0.25} ${w * 0.75},${h * 0.25} ${w * 0.85},${h * 0.55}`} fill={roofFill} stroke={roofStroke} strokeWidth="2" />
                    {/* Flat top */}
                    <rect x={w * 0.25} y={h * 0.2} width={w * 0.5} height={h * 0.08} fill="#475569" stroke={roofStroke} strokeWidth="2" rx="2" />
                    {/* Panels on top flat section */}
                    {showPanels && (
                        <g>
                            {[0, 1, 2].map(i => (
                                <rect key={i} x={w * 0.29 + i * w * 0.14} y={h * 0.21} width={w * 0.11} height={h * 0.055} fill={panelColor} stroke={panelStroke} strokeWidth="1" rx="1" opacity="0.9" />
                            ))}
                        </g>
                    )}
                    {/* Dormer windows */}
                    <rect x={w * 0.3} y={h * 0.34} width={w * 0.1} height={h * 0.1} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.6} y={h * 0.34} width={w * 0.1} height={h * 0.1} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.42} y={h * 0.62} width={w * 0.16} height={h * 0.28} fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" rx="2" />
                </svg>
            );

        case 'gambrel':
            return (
                <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mx-auto">
                    {/* Wall */}
                    <rect x={w * 0.15} y={h * 0.55} width={w * 0.7} height={h * 0.35} fill={wallFill} stroke={wallStroke} strokeWidth="2" rx="2" />
                    {/* Gambrel — two slopes per side */}
                    <polygon points={`${w * 0.1},${h * 0.55} ${w * 0.25},${h * 0.3} ${w * 0.38},${h * 0.12} ${w * 0.62},${h * 0.12} ${w * 0.75},${h * 0.3} ${w * 0.9},${h * 0.55}`} fill={roofFill} stroke={roofStroke} strokeWidth="2" />
                    {/* Ridge */}
                    <line x1={w * 0.38} y1={h * 0.12} x2={w * 0.62} y2={h * 0.12} stroke={roofStroke} strokeWidth="2" />
                    {/* Panels on upper slope */}
                    {showPanels && (
                        <g>
                            {[0, 1].map(i => (
                                <rect key={i}
                                    x={w * 0.52 + i * w * 0.1}
                                    y={h * 0.16 + i * h * 0.05}
                                    width={w * 0.09}
                                    height={h * 0.06}
                                    fill={panelColor} stroke={panelStroke} strokeWidth="1" rx="1" opacity="0.9"
                                    transform={`rotate(-20, ${w * 0.52 + i * w * 0.1 + w * 0.045}, ${h * 0.16 + i * h * 0.05 + h * 0.03})`}
                                />
                            ))}
                        </g>
                    )}
                    {/* Windows */}
                    <rect x={w * 0.25} y={h * 0.62} width={w * 0.12} height={h * 0.12} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.63} y={h * 0.62} width={w * 0.12} height={h * 0.12} fill="#bae6fd" stroke={wallStroke} strokeWidth="1" rx="1" />
                    <rect x={w * 0.42} y={h * 0.62} width={w * 0.16} height={h * 0.28} fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" rx="2" />
                </svg>
            );

        default:
            return null;
    }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function DesignPage() {
    const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
    const [coords, setCoords] = useState({ lat: '28.6139', lng: '77.2090' });
    const [roofArea, setRoofArea] = useState('120');
    const [roofType, setRoofType] = useState('flat');
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const user = useAuthStore(s => s.user);

    const selectedRoof = ROOF_TYPES.find(r => r.id === roofType) || ROOF_TYPES[0];

    useEffect(() => {
        if (user?.properties?.[0]?.address?.coordinates) {
            setCoords({
                lat: user.properties[0].address.coordinates.lat.toString(),
                lng: user.properties[0].address.coordinates.lng.toString()
            });
        }
        if (user?.properties?.[0]?.roofArea) {
            setRoofArea(user.properties[0].roofArea.toString());
        }
    }, [user]);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }
        const toastId = toast.loading('Locating...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6)
                });
                toast.success('Location updated!', { id: toastId });
            },
            (error) => {
                console.error(error);
                toast.error('Unable to retrieve your location', { id: toastId });
            }
        );
    };

    const handleAnalyze = async () => {
        if (!coords.lat || !coords.lng) {
            toast.error('Please enter your location coordinates');
            return;
        }
        if (!roofArea || parseFloat(roofArea) <= 0) {
            toast.error('Please enter a valid roof area');
            return;
        }

        setLoading(true);
        setStep('analyzing');

        try {
            const { data: roofData } = await api.post('/api/design/roof-analysis', {
                lat: coords.lat,
                lng: coords.lng,
                roof_area: roofArea,
                roof_type: roofType,
            });

            const roofResult = roofData.data;

            const { data: placementData } = await api.post('/api/design/panel-placement', {
                designId: roofResult.designId,
                usable_area: roofResult.usableArea || 85,
                lat: parseFloat(coords.lat),
                lng: parseFloat(coords.lng),
                roof_tilt: roofResult.estimatedTilt || selectedRoof.defaultTilt,
                roof_orientation: 'south',
                panel_wattage: 400,
            });

            setResults({ roof: { ...roofResult, roofType: roofResult.roofType || roofType }, placement: placementData.data });
            setStep('results');
        } catch (err: any) {
            console.error(err);
            toast.error(`Analysis failed: ${err.response?.data?.message || err.message}. Using demo data.`);
            const area = parseFloat(roofArea) || 120;
            const usable = Math.round(area * selectedRoof.usablePct);
            const panels = Math.floor(usable / 2);
            setResults({
                roof: {
                    totalArea: area, usableArea: usable, confidence: 0.87,
                    roofType: roofType, estimatedTilt: selectedRoof.defaultTilt,
                },
                placement: {
                    panelCount: panels, totalCapacity: +(panels * 0.4).toFixed(1),
                    estimatedAnnualProduction: Math.round(panels * 0.4 * 5.2 * 0.8 * 365),
                    peakSunHours: 5.2, optimalTiltAngle: selectedRoof.defaultTilt, systemLosses: 20, panelWattage: 400,
                },
            });
            setStep('results');
        } finally {
            setLoading(false);
        }
    };

    const annualProd = results?.placement?.estimatedAnnualProduction || 0;
    const dailyProd = (annualProd / 365).toFixed(1);
    const co2Offset25yr = ((annualProd * 25 * 0.0007) / 1000).toFixed(1);
    const monthlySavings = Math.round((annualProd / 12) * 25);
    const resultRoofType = results?.roof?.roofType || roofType;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Solar <span className="solar-gradient-text">Design Studio</span></h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Enter your roof details and location for AI-powered panel placement</p>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2">
                {['Roof Details', 'AI Analysis', 'Results'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${i <= ['input', 'analyzing', 'results'].indexOf(step) ? 'bg-gradient-to-br from-orange-500 to-yellow-500 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                            }`}>{i + 1}</div>
                        <span className="text-sm hidden sm:inline">{s}</span>
                        {i < 2 && <div className="w-8 h-px bg-[var(--border-color)]" />}
                    </div>
                ))}
            </div>

            {step === 'input' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Roof Information Card */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Home className="w-5 h-5 text-orange-500" /> Roof Information
                            </h3>
                            <div className="space-y-4">
                                {/* Roof Type Dropdown */}
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Roof Type</label>
                                    <div className="relative">
                                        <select
                                            value={roofType}
                                            onChange={e => setRoofType(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer font-medium"
                                        >
                                            {ROOF_TYPES.map(rt => (
                                                <option key={rt.id} value={rt.id}>{rt.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]" />
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)] mt-1 block">{selectedRoof.desc}</span>
                                </div>

                                {/* Roof Area */}
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Roof Area (m²)</label>
                                    <input
                                        value={roofArea}
                                        onChange={e => setRoofArea(e.target.value)}
                                        type="number"
                                        min="10"
                                        max="5000"
                                        placeholder="e.g. 120"
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none text-lg font-semibold"
                                    />
                                </div>

                                {/* Quick size presets */}
                                <div>
                                    <label className="text-xs text-[var(--text-secondary)] mb-2 block">Quick Select</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: 'Small (50 m²)', value: '50' },
                                            { label: 'Medium (120 m²)', value: '120' },
                                            { label: 'Large (200 m²)', value: '200' },
                                            { label: 'Commercial (500 m²)', value: '500' },
                                        ].map(preset => (
                                            <button
                                                key={preset.value}
                                                onClick={() => setRoofArea(preset.value)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${roofArea === preset.value
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-orange-500/50'
                                                    }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Estimate */}
                                {roofArea && parseFloat(roofArea) > 0 && (
                                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                                        <div className="text-sm font-medium text-orange-600 mb-2">Quick Estimate for {selectedRoof.label}</div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-[var(--text-secondary)]">Usable area: </span>
                                                <span className="font-semibold">~{Math.round(parseFloat(roofArea) * selectedRoof.usablePct)} m²</span>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-secondary)]">Est. panels: </span>
                                                <span className="font-semibold">~{Math.floor(parseFloat(roofArea) * selectedRoof.usablePct / 2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-secondary)]">Est. capacity: </span>
                                                <span className="font-semibold">~{(Math.floor(parseFloat(roofArea) * selectedRoof.usablePct / 2) * 0.4).toFixed(1)} kW</span>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-secondary)]">Default tilt: </span>
                                                <span className="font-semibold">{selectedRoof.defaultTilt}°</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-500" /> Location</h3>
                                <button onClick={handleLocateMe} className="text-xs bg-orange-500/10 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Locate Me
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Latitude</label>
                                    <input value={coords.lat} onChange={e => setCoords(c => ({ ...c, lat: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Longitude</label>
                                    <input value={coords.lng} onChange={e => setCoords(c => ({ ...c, lng: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] relative h-48 group">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight={0}
                                        marginWidth={0}
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(coords.lng) - 0.01}%2C${parseFloat(coords.lat) - 0.01}%2C${parseFloat(coords.lng) + 0.01}%2C${parseFloat(coords.lat) + 0.01}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
                                        className="opacity-75 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute bottom-2 right-2 text-[10px] bg-white/80 dark:bg-black/50 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                                        © OpenStreetMap contributors
                                    </div>
                                </div>
                                <div className="text-xs text-[var(--text-secondary)] text-center">
                                    Location is used to calculate sun hours, optimal tilt angle, and energy production
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Roof Type Visual Selector */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold mb-3 text-[var(--text-secondary)] uppercase tracking-wider">Select Your Roof Type</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {ROOF_TYPES.map(rt => (
                                <button
                                    key={rt.id}
                                    onClick={() => setRoofType(rt.id)}
                                    className={`p-3 rounded-xl border-2 transition-all text-center ${roofType === rt.id
                                        ? 'border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10'
                                        : 'border-[var(--border-color)] hover:border-orange-500/30 bg-[var(--bg-secondary)]'
                                        }`}
                                >
                                    <div className="mb-2">
                                        <RoofIllustration type={rt.id} size={120} showPanels={roofType === rt.id} />
                                    </div>
                                    <div className={`text-xs font-semibold ${roofType === rt.id ? 'text-orange-500' : ''}`}>{rt.label}</div>
                                    <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{Math.round(rt.usablePct * 100)}% usable</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <button onClick={handleAnalyze}
                            disabled={!roofArea || parseFloat(roofArea) <= 0 || !coords.lat || !coords.lng}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ScanEye className="w-5 h-5" /> Run AI Analysis <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}

            {step === 'analyzing' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center mb-6 animate-pulse">
                        <ScanEye className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">AI is analyzing your {selectedRoof.label.toLowerCase()}...</h3>
                    <p className="text-[var(--text-secondary)] text-sm">Calculating optimal panel placement for {roofArea} m² at ({coords.lat}, {coords.lng})</p>
                    <div className="mt-6 w-64 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                            initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3 }} />
                    </div>
                </motion.div>
            )}

            {step === 'results' && results && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Roof Illustration with Panels */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Home className="w-5 h-5 text-orange-500" />
                            Your {ROOF_TYPES.find(r => r.id === resultRoofType)?.label || 'Roof'} — with Solar Panels
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] mb-4">
                            Showing optimal panel placement on your {resultRoofType} roof ({results.roof.totalArea} m² total, {results.roof.usableArea} m² usable)
                        </p>
                        <div className="flex justify-center py-4 bg-gradient-to-b from-sky-100/50 to-green-50/30 dark:from-sky-900/10 dark:to-green-900/5 rounded-xl border border-[var(--border-color)]">
                            <RoofIllustration type={resultRoofType} size={360} showPanels={true} />
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { icon: Ruler, label: 'Usable Area', value: `${results.roof.usableArea} m²`, color: 'from-blue-500 to-cyan-500' },
                            { icon: PanelTop, label: 'Panels', value: `${results.placement.panelCount} panels`, color: 'from-orange-500 to-yellow-500' },
                            { icon: Zap, label: 'Per Panel', value: `${results.placement.panelWattage || 400} W`, color: 'from-purple-500 to-pink-500' },
                            { icon: Sun, label: 'Total Capacity', value: `${results.placement.totalCapacity} kW`, color: 'from-yellow-500 to-amber-500' },
                            { icon: TrendingUp, label: 'Annual Production', value: `${(annualProd / 1000).toFixed(1)} MWh`, color: 'from-green-500 to-emerald-500' },
                        ].map((card, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                                    <card.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-xl font-bold">{card.value}</div>
                                <div className="text-sm text-[var(--text-secondary)]">{card.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Roof & Energy Details */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Sun className="w-5 h-5 text-orange-500" /> System Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Roof Type', value: ROOF_TYPES.find(r => r.id === resultRoofType)?.label || resultRoofType },
                                    { label: 'Total Roof Area', value: `${results.roof.totalArea} m²` },
                                    { label: 'Optimal Tilt Angle', value: `${results.placement.optimalTiltAngle}°` },
                                    { label: 'Peak Sun Hours', value: `${results.placement.peakSunHours} h/day` },
                                    { label: 'System Losses', value: `${results.placement.systemLosses}%` },
                                    { label: 'AI Confidence', value: `${((results.roof.confidence || 0.85) * 100).toFixed(0)}%` },
                                ].map((item, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                        <div className="text-xs text-[var(--text-secondary)]">{item.label}</div>
                                        <div className="text-base font-semibold mt-0.5 capitalize">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-green-500" /> Energy & Savings
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Daily Production', value: `${dailyProd} kWh` },
                                    { label: 'Monthly Production', value: `${(annualProd / 12).toFixed(0)} kWh` },
                                    { label: 'Annual Production', value: `${annualProd.toLocaleString()} kWh` },
                                    { label: 'Est. Monthly Savings', value: `Rs ${monthlySavings.toLocaleString()}` },
                                    { label: 'CO₂ Offset (25yr)', value: `${co2Offset25yr} tons` },
                                    { label: '25yr Production', value: `${((annualProd * 25 * 0.9) / 1000).toFixed(0)} MWh` },
                                ].map((item, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                        <div className="text-xs text-[var(--text-secondary)]">{item.label}</div>
                                        <div className="text-base font-semibold mt-0.5">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Location summary */}
                    <div className="glass-card p-4 flex items-center gap-4 text-sm">
                        <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div>
                            <span className="text-[var(--text-secondary)]">Analysis for </span>
                            <span className="font-semibold">{ROOF_TYPES.find(r => r.id === resultRoofType)?.label}</span>
                            <span className="text-[var(--text-secondary)]"> at </span>
                            <span className="font-semibold">{coords.lat}, {coords.lng}</span>
                            <span className="text-[var(--text-secondary)]"> with </span>
                            <span className="font-semibold">{roofArea} m²</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button onClick={() => { setStep('input'); setResults(null); }}
                            className="px-6 py-3 border border-[var(--border-color)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition flex items-center gap-2"
                        >
                            <RotateCw className="w-4 h-4" /> New Analysis
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
