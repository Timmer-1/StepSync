'use client'

import React from 'react';
import { Shield, Zap, Globe } from 'lucide-react';
import SpotlightCard from './ui/spotlightcard';
import GridBackground from './ui/background';
import Link from 'next/link'

export default function Home() {
    return (
        <GridBackground>
            {/* Content Container */}
            <div className="relative">
                {/* Navigation */}
                <nav className="flex justify-between items-center p-6">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                        ProjectA
                    </div>
                    <div className="hidden md:flex space-x-6">
                        <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
                        <a href="#products" className="hover:text-blue-400 transition-colors">Products</a>
                        <a href="#resources" className="hover:text-blue-400 transition-colors">Resources</a>
                        <a href="#support" className="hover:text-blue-400 transition-colors">Support</a>
                    </div>
                    <div className="space-x-4">
                        <button className="px-4 py-2 hover:text-blue-400 transition-colors">
                            <Link href="./registeration/login">Sign In</Link>
                        </button>
                        <button className="bg-gradient-to-r from-blue-500 to-teal-400 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                            <Link href="./registeration/signup">Get Started</Link>
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="max-w-6xl mx-auto px-4 py-20 text-center">
                    <div className="bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-sm px-6 py-2 rounded-full mb-8 inline-block backdrop-blur-sm">
                        🚀 Trusted by Over 1 Million Users Worldwide
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        <span className="text-white">Smart Planning</span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-blue-500 text-transparent bg-clip-text">
                            Made Simple
                        </span>
                    </h1>

                    <p className="text-slate-300 max-w-2xl mx-auto mb-12 text-lg">
                        Stay organized and connected with ease. Share tasks, set reminders, track locations, and split expenses—all in one seamless app for families, friends, and roommates.
                    </p>

                    <div className="flex justify-center gap-4">
                        <button className="bg-gradient-to-r from-blue-500 to-teal-400 px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
                            Start Now
                        </button>
                        <button className="border border-slate-600 px-6 py-3 rounded-lg hover:border-slate-400 font-medium backdrop-blur-sm bg-slate-800/30">
                            Explore ProjectA
                        </button>
                    </div>
                </main>

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto px-2 py-20 grid md:grid-cols-3 gap-8">
                    <SpotlightCard className="p-6 rounded-xl " custom-spotlight-card spotlightColor="rgba(0, 229, 255, 0.2)">
                        <Shield className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Secure Transfer</h3>
                        <p className="text-slate-300">
                            Ensure your funds reach their destination instantly, with top-notch security
                            and real-time tracking.
                        </p>
                    </SpotlightCard>

                    <SpotlightCard className="p-6 rounded-xl " custom-spotlight-card spotlightColor="rgba(0, 229, 255, 0.2)">
                        <Zap className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Seamless Integration</h3>
                        <p className="text-slate-300">
                            Enjoy a streamlined financial experience, from business transactions
                            to personal finance management.
                        </p>
                    </SpotlightCard>

                    <SpotlightCard className="p-6 rounded-xl " custom-spotlight-card spotlightColor="rgba(0, 229, 255, 0.2)">
                        <Globe className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Multi-Currency Support</h3>
                        <p className="text-slate-300">
                            Effortlessly transact in multiple currencies. Simplified international
                            payments for global reach.
                        </p>
                    </SpotlightCard>
                </div>
            </div>
        </GridBackground>



    );
};