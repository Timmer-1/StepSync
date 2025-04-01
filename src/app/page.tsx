'use client'

import React from 'react';
import { Shield, Zap, Globe, Star, Users, BarChart, MessagesSquare } from 'lucide-react';
import SpotlightCard from './ui/spotlightcard';
import GridBackground from './ui/background';
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server';
import { useState, useEffect } from 'react';
import { getFeaturedTestimonials } from './data/testimonials';

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const displayedTestimonials = getFeaturedTestimonials(3);

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = async () => {
            const supabase = await createClient();
            const { data } = await supabase.auth.getUser();
            setIsAuthenticated(!!data?.user);
        };
        checkAuth();
    }, []);

    // Function to render stars based on rating
    const renderStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
            />
        ));
    };

    return (
        <GridBackground>
            {/* Content Container */}
            <div className="relative">
                {/* Navigation */}
                <nav className="flex justify-between items-center p-6">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                        StepSync
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex space-x-8">
                        <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
                        <a href="#products" className="hover:text-blue-400 transition-colors">Products</a>
                        <a href="#resources" className="hover:text-blue-400 transition-colors">Resources</a>
                        <a href="#support" className="hover:text-blue-400 transition-colors">Support</a>
                    </div>
                    <div className="space-x-4">
                        <button className="px-4 py-2 hover:text-blue-400 transition-colors">
                            <Link href="./auth/login">Start Your Free Trial</Link>
                        </button>
                        <button className="bg-gradient-to-r from-blue-500 to-teal-400 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                            <Link href="./auth/signup">Get Started</Link>
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="max-w-6xl mx-auto px-4 py-16">
                    <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-sm px-6 py-2 rounded-full mb-8 inline-block backdrop-blur-sm">
                            🚀 Trusted by Over 1 Million Users Worldwide
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
                            <span className="text-white">Stay Alive,</span>
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-blue-500 text-transparent bg-clip-text">
                                Stay Connected
                            </span>
                        </h1>

                        <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-lg text-center">
                            Crush your fitness goals while keeping friends and family in the loop. Track workouts, monitor nutrition, and join challenges—all in one seamless app designed to make health and wellness fun, engaging, and rewarding.
                        </p>

                        <div className="flex justify-center gap-4 mb-12">
                            {isAuthenticated ? (
                                <Link href="/dashboard">
                                    <button className="bg-gradient-to-r from-blue-500 to-teal-400 px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
                                        Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <button className="bg-gradient-to-r from-blue-500 to-teal-400 px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
                                            Sign In
                                        </button>
                                    </Link>
                                    <Link href="/auth/signup">
                                        <button className="border border-slate-600 px-6 py-3 rounded-lg hover:border-slate-400 font-medium backdrop-blur-sm bg-slate-800/30">
                                            Explore StepSync
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Hero Image */}
                        <div className="w-full max-w-4xl mx-auto relative">
                            {/* Glow effect */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-teal-400/20 to-blue-500/20 blur-xl rounded-2xl"></div>

                            {/* Image container with styling */}
                            <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl">
                                <img
                                    src="/run.png"
                                    alt="StepSync Fitness App"
                                    className="w-full h-auto object-cover"
                                />

                                {/* Overlay gradient for better text contrast */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl"></div>

                            </div>
                        </div>
                    </div>
                </main>

                {/* Features Introduction */}
                <div className="max-w-4xl mx-auto px-4 pt-8 pb-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text mb-4">
                        The Complete Fitness Experience
                    </h2>
                    <p className="text-slate-300 text-lg max-w-3xl mx-auto">
                        StepSync brings together powerful features designed to revolutionize how you track, share, and experience your fitness journey. Our innovative platform combines cutting-edge technology with human connection to create the ultimate wellness companion.
                    </p>
                    <div className="mt-8 mb-2 flex justify-center">
                        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"></div>
                    </div>
                </div>

                {/* Features Grid */}
                < div className="max-w-6xl mx-auto px-2 py-20 grid md:grid-cols-3 gap-8" >
                    <SpotlightCard className="p-6 rounded-xl ">  {/*custom-spotlight-card spotlightColor="rgba(0, 229, 255, 0.2)*/}
                        <Users className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Social Connectivity</h3>
                        <p className="text-slate-300">
                            Share achievements, create fitness groups, and keep loved ones updated on your health journey.
                        </p>
                    </SpotlightCard>

                    <SpotlightCard className="p-6 rounded-xl ">
                        <Zap className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Seamless Integration</h3>
                        <p className="text-slate-300">
                            Connect with all your favorite fitness devices and apps. Works with Apple Health, Google Fit, Fitbit, and more.
                        </p>
                    </SpotlightCard>

                    <SpotlightCard className="p-6 rounded-xl ">
                        <Globe className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Global Challenges</h3>
                        <p className="text-slate-300">
                            Join worldwide fitness events and compete with friends from around the globe. Stay motivated with friendly competition.
                        </p>
                    </SpotlightCard>

                    <SpotlightCard className="p-6 rounded xl">
                        <BarChart className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                        <p className="text-slate-300">
                            Track your progress with detailed analytics. Monitor workouts, nutrition, and wellness metrics in one place.
                        </p>
                    </SpotlightCard>

                    <SpotlightCard className="p-6 rounded-xl ">
                        <Shield className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                        <p className="text-slate-300">
                            Your health data stays private. Choose exactly what to share and with whom—complete control over your information.
                        </p>
                    </SpotlightCard>

                    <SpotlightCard className="p-6 rounded-xl ">
                        <MessagesSquare className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Community Support</h3>
                        <p className="text-slate-300">
                            Join a vibrant community of fitness enthusiasts. Share tips, ask questions, and find inspiration from others.
                        </p>
                    </SpotlightCard>
                </div >

                {/* Testimonials Section */}
                < div className="max-w-6xl mx-auto px-4 py-16" >
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
                        <p className="text-slate-300 max-w-2xl mx-auto">
                            Join thousands of satisfied users who have transformed their fitness journey with StepSync.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {displayedTestimonials.map((testimonial) => (
                            <SpotlightCard
                                key={testimonial.id}
                                className="p-6 rounded-xl flex flex-col h-full"
                                spotlightColor="rgba(0, 229, 255, 0.15)"
                            >
                                <div className="flex items-start mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold mr-4">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{testimonial.name}</h4>
                                        <p className="text-sm text-slate-400">{testimonial.role}, {testimonial.company}</p>
                                        <div className="flex mt-1">
                                            {renderStars(testimonial.rating)}
                                        </div>
                                    </div>
                                </div>
                                <blockquote className="italic text-slate-300 flex-grow">
                                    "{testimonial.quote}"
                                </blockquote>
                            </SpotlightCard>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <div className="mt-16 text-center">
                        <div className="bg-gradient-to-r from-blue-500/30 to-teal-500/30 p-8 rounded-2xl backdrop-blur-sm">
                            <h3 className="text-2xl font-bold mb-4">Ready to transform your fitness journey?</h3>
                            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                                Join StepSync today and experience the future of connected fitness tracking.
                            </p>
                            <Link href="/auth/signup">
                                <button className="bg-gradient-to-r from-blue-500 to-teal-400 px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
                                    Start Your Free Trial
                                </button>
                            </Link>
                            <p className="text-sm text-slate-400 mt-4">No credit card required. 14-day free trial.</p>
                        </div>
                    </div>
                </div >

                {/* Footer */}
                < footer className="border-t border-slate-800 mt-16" >
                    <div className="max-w-6xl mx-auto px-4 py-12">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text mb-4">
                                    StepSync
                                </div>
                                <p className="text-slate-400">Your all-in-one fitness tracking and social wellness platform.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Product</h4>
                                <ul className="space-y-2 text-slate-400">
                                    <li><a href="#" className="hover:text-blue-400">Features</a></li>
                                    <li><a href="#" className="hover:text-blue-400">Pricing</a></li>
                                    <li><a href="#" className="hover:text-blue-400">Integrations</a></li>
                                    <li><a href="#" className="hover:text-blue-400">Enterprise</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Company</h4>
                                <ul className="space-y-2 text-slate-400">
                                    <li><a href="#" className="hover:text-blue-400">About Us</a></li>
                                    <li><a href="#" className="hover:text-blue-400">Help Center</a></li>
                                    <li><a href="#" className="hover:text-blue-400">Community</a></li>
                                    <li><a href="#" className="hover:text-blue-400">Contact</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Connect</h4>
                                <ul className="space-y-2 text-slate-400">
                                    <li><a href="#" className="hover:text-blue-400">Twitter</a></li>
                                    <li><a href="#" className="hover:text-blue-400">Instagram</a></li>
                                    <li><a href="#" className="hover:text-blue-400">Facebook</a></li>
                                    <li><a href="#" className="hover:text-blue-400">LinkedIn</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-slate-800 mt-8 pt-8 flex justify-center">
                            <p className="text-slate-500 text-sm text-center">© 2025 StepSync. All rights reserved.</p>
                        </div>
                    </div>
                </footer >
            </div >
        </GridBackground >
    );
};