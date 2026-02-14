'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const user = useAuthStore(s => s.user);
    const { isDark, toggleTheme } = useThemeStore();
    const [tab, setTab] = useState<'profile' | 'notifications' | 'appearance'>('profile');
    const [profile, setProfile] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: '',
    });
    const [notifications, setNotifications] = useState({
        dustAlerts: true,
        cleaningReminders: true,
        reportReady: true,
        weeklyDigest: false,
        smsAlerts: false,
    });

    const handleSave = () => {
        toast.success('Settings saved!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold"><span className="solar-gradient-text">Settings</span></h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account preferences</p>
            </div>

            <div className="flex gap-2 border-b border-[var(--border-color)] pb-px">
                {[
                    { key: 'profile', label: '👤 Profile', icon: User },
                    { key: 'notifications', label: '🔔 Notifications', icon: Bell },
                    { key: 'appearance', label: '🎨 Appearance', icon: Palette },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key as any)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition ${tab === t.key ? 'bg-orange-500/10 text-orange-500 border-b-2 border-orange-500' : 'text-[var(--text-secondary)]'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'profile' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 max-w-2xl space-y-5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center text-white text-2xl font-bold">
                            {profile.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{profile.fullName || 'User'}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{profile.email}</p>
                        </div>
                    </div>

                    {[
                        { label: 'Full Name', key: 'fullName', type: 'text' },
                        { label: 'Email', key: 'email', type: 'email' },
                        { label: 'Phone', key: 'phone', type: 'tel' },
                    ].map(field => (
                        <div key={field.key}>
                            <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                            <input type={field.type} value={(profile as any)[field.key]}
                                onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none transition" />
                        </div>
                    ))}

                    <button onClick={handleSave}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-glow transition-all flex items-center gap-2 text-sm"
                    >
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </motion.div>
            )}

            {tab === 'notifications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 max-w-2xl space-y-4">
                    {[
                        { key: 'dustAlerts', label: 'Dust Alerts', desc: 'Get notified when dust levels exceed threshold' },
                        { key: 'cleaningReminders', label: 'Cleaning Reminders', desc: 'AI-scheduled cleaning recommendations' },
                        { key: 'reportReady', label: 'Report Ready', desc: 'Notification when monthly report is generated' },
                        { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of production and savings' },
                        { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive critical alerts via SMS' },
                    ].map(n => (
                        <div key={n.key} className="flex items-center justify-between py-3 border-b border-[var(--border-color)] last:border-0">
                            <div>
                                <div className="font-medium text-sm">{n.label}</div>
                                <div className="text-xs text-[var(--text-secondary)]">{n.desc}</div>
                            </div>
                            <button onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !(prev as any)[n.key] }))}
                                className={`w-12 h-6 rounded-full transition-colors relative ${(notifications as any)[n.key] ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${(notifications as any)[n.key] ? 'left-6' : 'left-0.5'}`} />
                            </button>
                        </div>
                    ))}
                </motion.div>
            )}

            {tab === 'appearance' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 max-w-2xl space-y-6">
                    <div>
                        <h3 className="font-medium mb-3">Theme</h3>
                        <div className="flex gap-3">
                            {[
                                { mode: 'light', icon: Sun, label: 'Light' },
                                { mode: 'dark', icon: Moon, label: 'Dark' },
                            ].map(t => (
                                <button key={t.mode} onClick={toggleTheme}
                                    className={`flex-1 p-4 rounded-xl border transition flex flex-col items-center gap-2 ${(isDark && t.mode === 'dark') || (!isDark && t.mode === 'light')
                                            ? 'border-orange-500 bg-orange-500/10' : 'border-[var(--border-color)] hover:border-orange-500/50'}`}
                                >
                                    <t.icon className="w-6 h-6" />
                                    <span className="text-sm font-medium">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
