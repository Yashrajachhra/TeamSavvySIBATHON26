'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sun, Zap, DollarSign, Shield, ChevronRight, Star, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center">
                            <Sun className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold solar-gradient-text">SmartSolar</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">Features</a>
                        <a href="#how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">How It Works</a>
                        <a href="#faq" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">FAQ</a>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login" className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition">
                            Sign In
                        </Link>
                        <Link href="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl hover:shadow-glow transition-all">
                            Get Started Free
                        </Link>
                    </div>

                    <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {menuOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
                        <div className="px-4 py-4 flex flex-col gap-3">
                            <a href="#features" className="py-2 text-[var(--text-secondary)]" onClick={() => setMenuOpen(false)}>Features</a>
                            <a href="#how-it-works" className="py-2 text-[var(--text-secondary)]" onClick={() => setMenuOpen(false)}>How It Works</a>
                            <Link href="/login" className="py-2 text-center font-medium">Sign In</Link>
                            <Link href="/register" className="py-2.5 text-center font-semibold text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl">Get Started Free</Link>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-green-500/5" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="max-w-5xl mx-auto text-center relative"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-8">
                        <Zap className="w-4 h-4" />
                        AI-Powered Solar Intelligence Platform
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                        Make Solar
                        <span className="solar-gradient-text"> Simple,</span>
                        <br />
                        <span className="solar-gradient-text">Smart</span> & Profitable
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
                        Plan optimal panel placement with AI, find the best green financing, and keep your panels running at peak efficiency — all in one beautiful dashboard.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl hover:shadow-glow transition-all flex items-center justify-center gap-2">
                            Start Free Analysis <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 text-lg font-medium border border-[var(--border-color)] rounded-2xl hover:bg-[var(--bg-secondary)] transition flex items-center justify-center gap-2">
                            See How It Works
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="mt-12 flex items-center justify-center gap-6 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                            <span className="ml-1">4.9/5</span>
                        </div>
                        <div>10,000+ homes powered</div>
                        <div>Rs 500M+ savings generated</div>
                    </motion.div>
                </motion.div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 px-4 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
                        <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">
                            Three Steps to <span className="solar-gradient-text">Solar Freedom</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-[var(--text-secondary)] max-w-xl mx-auto">
                            From analysis to installation — we handle the complexity so you don&apos;t have to.
                        </motion.p>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Sun, color: 'from-orange-500 to-yellow-500', title: 'AI Roof Analysis', desc: 'Upload your roof image or drop a pin. Our AI detects usable area, obstructions, and calculates optimal panel placement.' },
                            { icon: DollarSign, color: 'from-green-500 to-emerald-500', title: 'Smart Financing', desc: 'Compare 15+ green loan options, calculate ROI with real financial formulas, and find government subsidies you qualify for.' },
                            { icon: Shield, color: 'from-blue-500 to-cyan-500', title: 'Maintain & Monitor', desc: 'AI predicts dust buildup, sends smart cleaning alerts, and tracks your energy production and savings in real time.' },
                        ].map((step, i) => (
                            <motion.div key={i} variants={fadeInUp} className="glass-card p-8 text-center">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6`}>
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-sm font-semibold text-orange-500 mb-2">Step {i + 1}</div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
                        <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">
                            Everything You Need for <span className="solar-gradient-text">Solar Success</span>
                        </motion.h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'AI Panel Placement', desc: 'Computer vision detects roof boundaries and optimizes panel layout', icon: '🤖' },
                            { title: 'Solar Irradiance Map', desc: 'NASA POWER API data for accurate energy production estimates', icon: '🗺️' },
                            { title: 'Shadow Simulation', desc: 'Hour-by-hour shadow analysis with interactive time slider', icon: '🌗' },
                            { title: 'ROI Calculator', desc: 'NPV, IRR, break-even analysis with real financial formulas', icon: '📊' },
                            { title: 'Financing Marketplace', desc: 'Compare green loan options from leading banks like HBL, Meezan, UBL', icon: '🏦' },
                            { title: 'Subsidy Finder', desc: 'Government net metering policies and provincial solar incentive eligibility', icon: '🏛️' },
                            { title: 'Dust Monitoring', desc: 'ML predicts efficiency loss from dust, AQI, and weather data', icon: '🧹' },
                            { title: 'Smart Alerts', desc: 'Automated cleaning alerts when efficiency drops below threshold', icon: '🔔' },
                            { title: 'PDF Reports', desc: 'Auto-generated monthly reports with energy, savings, and environmental impact', icon: '📄' },
                        ].map((feat, i) => (
                            <motion.div key={i} variants={fadeInUp} className="glass-card p-6 hover:border-orange-500/30 transition-colors">
                                <div className="text-3xl mb-4">{feat.icon}</div>
                                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-4 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">What Our Users <span className="solar-gradient-text">Say</span></h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: 'Ahmed Khan', role: 'Homeowner, Karachi', text: 'SmartSolar helped me save Rs 15,000/month on electricity. The AI placement was spot-on and financing comparison saved me hours of research.', rating: 5 },
                            { name: 'Bilal Rashid', role: 'Business Owner, Lahore', text: 'The dust monitoring feature alone has recovered 12% more energy from my panels. The ROI simulator convinced my investors to go solar.', rating: 5 },
                            { name: 'Sara Malik', role: 'Solar Installer, Islamabad', text: 'I use SmartSolar for every client proposal. The AI roof analysis generates professional reports in minutes instead of hours on-site.', rating: 5 },
                        ].map((t, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                                <div className="flex items-center gap-1 mb-4">
                                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">&quot;{t.text}&quot;</p>
                                <div className="font-semibold text-sm">{t.name}</div>
                                <div className="text-xs text-[var(--text-secondary)]">{t.role}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-20 px-4 bg-[var(--bg-secondary)]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked <span className="solar-gradient-text">Questions</span></h2>
                    <div className="space-y-4">
                        {[
                            { q: 'How accurate is the AI roof analysis?', a: 'Our AI achieves 87%+ accuracy in roof boundary detection. For best results, use high-resolution satellite imagery or upload your own drone photos.' },
                            { q: 'Do I need to install sensors for dust monitoring?', a: 'No hardware needed. Our ML model uses weather data, AQI, and historical patterns to predict dust accumulation and efficiency loss remotely.' },
                            { q: 'Which financing options do you support?', a: 'We compare green loan options from major Pakistani banks including HBL, Meezan Bank, UBL, Bank Alfalah, and JS Bank with competitive solar financing rates.' },
                            { q: 'How is the ROI calculated?', a: 'We use real financial formulas including Net Present Value (NPV), Internal Rate of Return (IRR), and factor in panel degradation, electricity rate inflation, and all costs.' },
                            { q: 'Is my data secure?', a: 'Yes. We use JWT encryption, HTTPS, and follow OWASP security best practices. Your data is never shared with third parties without consent.' },
                        ].map((faq, i) => (
                            <details key={i} className="glass-card group">
                                <summary className="p-5 cursor-pointer font-medium flex items-center justify-between">
                                    {faq.q}
                                    <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-open:rotate-90 transition-transform" />
                                </summary>
                                <div className="px-5 pb-5 text-sm text-[var(--text-secondary)] leading-relaxed">{faq.a}</div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                        className="glass-card p-12 bg-gradient-to-br from-orange-500/10 to-yellow-500/10"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Go Solar?</h2>
                        <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
                            Join 10,000+ homeowners who are saving money and saving the planet with SmartSolar.
                        </p>
                        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl hover:shadow-glow transition-all">
                            Start Your Free Analysis <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[var(--border-color)] py-12 px-4">
                <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center">
                                <Sun className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold solar-gradient-text">SmartSolar</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">AI-powered solar intelligence for a sustainable future.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Product</h4>
                        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                            <li><a href="#features" className="hover:text-[var(--text-primary)]">Features</a></li>
                            <li><Link href="/login" className="hover:text-[var(--text-primary)]">Dashboard</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Resources</h4>
                        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                            <li><a href="#faq" className="hover:text-[var(--text-primary)]">FAQ</a></li>
                            <li><a href="#" className="hover:text-[var(--text-primary)]">API Docs</a></li>
                            <li><a href="#" className="hover:text-[var(--text-primary)]">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Legal</h4>
                        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                            <li><a href="#" className="hover:text-[var(--text-primary)]">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-[var(--text-primary)]">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-[var(--text-primary)]">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-[var(--border-color)] text-center text-sm text-[var(--text-secondary)]">
                    © 2025 SmartSolar. All rights reserved. Made with ☀️ in Pakistan.
                </div>
            </footer>
        </div>
    );
}
