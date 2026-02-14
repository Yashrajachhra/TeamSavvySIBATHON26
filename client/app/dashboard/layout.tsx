'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sun, LayoutDashboard, PanelTop, Banknote, Droplets, FileText, Settings,
    LogOut, Menu, X, Moon, ChevronDown, Bell, User, CheckCheck, Sparkles,
    Wrench, TrendingUp, Shield, Trash2
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/design', icon: PanelTop, label: 'Solar Design' },
    { href: '/dashboard/financing', icon: Banknote, label: 'Financing' },
    { href: '/dashboard/maintenance', icon: Droplets, label: 'Maintenance' },
    { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    iconName: string;
    href?: string;
}

const NOTIF_ICONS: Record<string, { Icon: any; color: string }> = {
    sparkles: { Icon: Sparkles, color: 'text-orange-500' },
    panel: { Icon: PanelTop, color: 'text-blue-500' },
    wrench: { Icon: Wrench, color: 'text-emerald-500' },
    trending: { Icon: TrendingUp, color: 'text-purple-500' },
    shield: { Icon: Shield, color: 'text-amber-500' },
};

function NotifIcon({ name }: { name: string }) {
    const entry = NOTIF_ICONS[name];
    if (!entry) return <Bell className="w-5 h-5 text-[var(--text-secondary)]" />;
    const { Icon, color } = entry;
    return <Icon className={`w-5 h-5 ${color}`} />;
}

function generateNotifications(userName: string): Notification[] {
    return [
        {
            id: 'welcome',
            title: 'Welcome to SmartSolar! 🎉',
            message: `Hi ${userName.split(' ')[0]}, your account is ready. Start by designing your solar system.`,
            time: 'Just now',
            read: false,
            iconName: 'sparkles',
            href: '/dashboard/design',
        },
        {
            id: 'design-tip',
            title: 'Design Your Solar System',
            message: 'Use our AI-powered tool to get an optimal panel layout for your roof.',
            time: '2m ago',
            read: false,
            iconName: 'panel',
            href: '/dashboard/design',
        },
        {
            id: 'maintenance-tip',
            title: 'Dust Monitoring Active',
            message: 'We track dust levels and air quality to keep your panels efficient.',
            time: '5m ago',
            read: false,
            iconName: 'wrench',
            href: '/dashboard/maintenance',
        },
        {
            id: 'financing',
            title: 'Explore Financing Options',
            message: 'Check out available solar loans and calculate your EMI savings.',
            time: '10m ago',
            read: false,
            iconName: 'trending',
            href: '/dashboard/financing',
        },
        {
            id: 'security',
            title: 'Secure Your Account',
            message: 'Complete your profile settings for a better experience.',
            time: '15m ago',
            read: true,
            iconName: 'shield',
            href: '/dashboard/settings',
        },
    ];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, fetchUser, logout } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Load notifications
    useEffect(() => {
        if (user) {
            const key = `smartsolar_notifs_v2_${user.id}`;
            // Clear old corrupt format
            localStorage.removeItem(`smartsolar_notifs_${user.id}`);
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    // Validate that data has iconName (string), not icon (object)
                    if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0].iconName === 'string')) {
                        setNotifications(parsed);
                    } else {
                        throw new Error('old format');
                    }
                } catch {
                    const initial = generateNotifications(user.fullName || 'User');
                    setNotifications(initial);
                    localStorage.setItem(key, JSON.stringify(initial));
                }
            } else {
                const initial = generateNotifications(user.fullName || 'User');
                setNotifications(initial);
                localStorage.setItem(key, JSON.stringify(initial));
            }
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const saveNotifs = (notifs: Notification[]) => {
        if (user) localStorage.setItem(`smartsolar_notifs_v2_${user.id}`, JSON.stringify(notifs));
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
            saveNotifs(updated);
            return updated;
        });
    };

    const markAllRead = () => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            saveNotifs(updated);
            return updated;
        });
    };

    const clearAll = () => {
        setNotifications([]);
        saveNotifs([]);
    };

    const handleNotifClick = (notif: Notification) => {
        markAsRead(notif.id);
        if (notif.href) {
            router.push(notif.href);
            setNotifOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center animate-pulse">
                        <Sun className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-card)] border-r border-[var(--border-color)] transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--border-color)]">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center">
                                <Sun className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold solar-gradient-text">SmartSolar</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--text-secondary)]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                            return (
                                <Link key={item.href} href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 text-orange-500 border border-orange-500/20'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-3 border-t border-[var(--border-color)]">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center text-white text-sm font-bold">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{user?.fullName || 'User'}</div>
                                <div className="text-xs text-[var(--text-secondary)] truncate">{user?.email || ''}</div>
                            </div>
                        </div>
                        <button onClick={() => { logout(); router.push('/login'); }}
                            className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main content */}
            <div className="flex-1 lg:ml-64">
                {/* Top bar */}
                <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[var(--text-secondary)]">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1" />

                    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)]">
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="relative p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)]"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full px-1">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-12 w-80 sm:w-96 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl z-50 overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllRead}
                                                    className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                                                >
                                                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                                                </button>
                                            )}
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={clearAll}
                                                    className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition p-1"
                                                    title="Clear all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notification List */}
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="py-10 text-center">
                                                <Bell className="w-8 h-8 mx-auto text-[var(--text-secondary)] opacity-40 mb-2" />
                                                <p className="text-sm text-[var(--text-secondary)]">No notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <button
                                                    key={notif.id}
                                                    onClick={() => handleNotifClick(notif)}
                                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--bg-secondary)] transition border-b border-[var(--border-color)] last:border-0 ${
                                                        !notif.read ? 'bg-orange-500/5' : ''
                                                    }`}
                                                >
                                                    <div className="mt-0.5 shrink-0"><NotifIcon name={notif.iconName} /></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-medium truncate ${!notif.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                                {notif.title}
                                                            </span>
                                                            {!notif.read && <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />}
                                                        </div>
                                                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{notif.message}</p>
                                                        <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">{notif.time}</span>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
