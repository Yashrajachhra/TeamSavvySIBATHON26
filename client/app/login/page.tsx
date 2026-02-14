'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sun, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const login = useAuthStore(s => s.login);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = () => {
        setEmail('demo@smartsolar.com');
        setPassword('demo123456');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-yellow-500 to-green-500 relative items-center justify-center p-12">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative text-white max-w-md">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Sun className="w-16 h-16 mb-8 animate-pulse-slow" />
                        <h1 className="text-4xl font-black mb-4">Power Your Future with Solar</h1>
                        <p className="text-lg text-white/80">AI-powered solar analysis, smart financing, and intelligent maintenance — all in one platform.</p>
                        <div className="mt-8 flex gap-8">
                            <div>
                                <div className="text-3xl font-bold">10K+</div>
                                <div className="text-sm text-white/70">Homes Powered</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">Rs 500M</div>
                                <div className="text-sm text-white/70">Savings Generated</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">25K+</div>
                                <div className="text-sm text-white/70">Tons CO₂ Saved</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-primary)]">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center">
                            <Sun className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold solar-gradient-text">SmartSolar</span>
                    </Link>

                    <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
                    <p className="text-[var(--text-secondary)] mb-8">Sign in to your account to continue</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com" required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium">Password</label>
                                <Link href="/forgot-password" className="text-sm text-orange-500 hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                                <input
                                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" required minLength={6}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <button onClick={fillDemo} className="w-full mt-3 py-3 border border-[var(--border-color)] rounded-xl text-sm font-medium hover:bg-[var(--bg-secondary)] transition">
                        🚀 Use Demo Account
                    </button>

                    <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-orange-500 font-medium hover:underline">Sign up free</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
