'use client'

import React, { useState } from 'react';
import {
    BarChart,
    Bell,
    Activity,
    Users,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    userData: any;
    onSignOut: () => void;
}

export default function Sidebar({ userData, onSignOut }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Function to check if a link is active
    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') {
            return true;
        }
        if (path !== '/dashboard' && pathname.startsWith(path)) {
            return true;
        }
        return false;
    };

    // Navigation items - centralized for easy modification
    const navigationItems = [
        { path: '/dashboard', label: 'Overview', icon: <BarChart className="w-5 h-5" /> },
        { path: '/dashboard/activity', label: 'Activity', icon: <Activity className="w-5 h-5" /> },
        { path: '/dashboard/social', label: 'Social', icon: <Users className="w-5 h-5" /> },
        { path: '/dashboard/calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> }
    ];

    // Settings and logout
    const settingsItems = [
        { path: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ];

    // Close mobile menu when clicking a link
    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-black/30 backdrop-blur-md border border-slate-700/50"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-black/30 backdrop-blur-md border-r border-slate-700/50 overflow-y-auto z-40 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="p-4 border-b border-slate-700/50">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                        StepSync
                    </h1>
                </div>

                <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center">
                            {userData?.user_metadata?.name ? userData.user_metadata.name.charAt(0) : userData?.email?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-medium">{userData?.user_metadata?.name || userData?.email?.split('@')[0]}</p>
                            <p className="text-xs text-slate-400">{userData?.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        {navigationItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    onClick={handleLinkClick}
                                    className={`w-full flex items-center space-x-3 p-2 rounded-lg ${isActive(item.path)
                                        ? 'bg-slate-700/50 text-green-400'
                                        : 'hover:bg-slate-700/30'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8">
                        <ul className="space-y-2">
                            {settingsItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        onClick={handleLinkClick}
                                        className={`w-full flex items-center space-x-3 p-2 rounded-lg ${isActive(item.path)
                                            ? 'bg-slate-700/50 text-green-400'
                                            : 'hover:bg-slate-700/30'
                                            }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => {
                                        handleLinkClick();
                                        onSignOut();
                                    }}
                                    className="w-full flex items-center space-x-3 p-2 rounded-lg text-red-400 hover:bg-slate-700/30"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Sign Out</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>
        </>
    );
}