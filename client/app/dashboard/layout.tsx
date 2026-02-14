'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sun, LayoutDashboard, PanelTop, Banknote, Droplets, FileText, Settings,
    LogOut, Menu, X, Moon, ChevronDown, Bell, User
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
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

                    <button className="relative p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)]">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
                    </button>
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
