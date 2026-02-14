'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sun, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', role: 'homeowner' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const register = useAuthStore(s => s.register);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created successfully!');
            router.push('/onboarding');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 via-emerald-500 to-yellow-500 relative items-center justify-center p-12">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative text-white max-w-md">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Sun className="w-16 h-16 mb-8 animate-float" />
                        <h1 className="text-4xl font-black mb-4">Join the Solar Revolution</h1>
                        <p className="text-lg text-white/80">Start your journey to energy independence. Free analysis, smart financing, and AI-powered maintenance.</p>
                    </motion.div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-primary)]">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center">
                            <Sun className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold solar-gradient-text">SmartSolar</span>
                    </Link>

                    <h2 className="text-2xl font-bold mb-1">Create your account</h2>
                    <p className="text-[var(--text-secondary)] mb-8">Get started with free solar analysis</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                                <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min 6 characters" required minLength={6}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">I am a...</label>
                            <select name="role" value={form.role} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:ring-2 focus:ring-orange-500 outline-none transition">
                                <option value="homeowner">🏠 Homeowner</option>
                                <option value="business">🏢 Business Owner</option>
                                <option value="installer">🔧 Solar Installer</option>
                            </select>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                        Already have an account?{' '}
                        <Link href="/login" className="text-orange-500 font-medium hover:underline">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
