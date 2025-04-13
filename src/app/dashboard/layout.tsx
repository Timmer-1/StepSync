'use client'

import React, { useState, useEffect } from 'react';
import {
    User,
    BarChart,
    Activity,
    Users,
    Calendar,
    Bell,
    Settings,
    LogOut,
    Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GridBackground from '@/app/ui/background';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        async function getUserData() {
            setLoading(true);
            const { data: { user }, error } = await supabase.auth.getUser();

            // Check if the user is authenticated
            if (error || !user) {
                console.error('Error fetching user:', error);
                router.push('/auth/login');
                return;
            }

            // If we have a user, set the user data
            setUserData(user);

            // Here you would fetch additional user profile data from your database
            // For example: const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

            setLoading(false);
        }

        getUserData();
    }, [router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

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

    if (loading) {
        return (
            <GridBackground>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
                </div>
            </GridBackground>
        );
    }

    return (
        <GridBackground>
            <div className="min-h-screen flex flex-col md:flex-row">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-black/30 backdrop-blur-md border-r border-slate-700/50">
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
                            <li>
                                <Link
                                    href="/dashboard"
                                    className={`w-full flex items-center space-x-3 p-2 rounded-lg ${isActive('/dashboard') ? 'bg-slate-700/50 text-green-400' : 'hover:bg-slate-700/30'}`}
                                >
                                    <BarChart className="w-5 h-5" />
                                    <span>Overview</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/activity"
                                    className={`w-full flex items-center space-x-3 p-2 rounded-lg ${isActive('/dashboard/activity') ? 'bg-slate-700/50 text-green-400' : 'hover:bg-slate-700/30'}`}
                                >
                                    <Activity className="w-5 h-5" />
                                    <span>Activity</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/social"
                                    className={`w-full flex items-center space-x-3 p-2 rounded-lg ${isActive('/dashboard/social') ? 'bg-slate-700/50 text-green-400' : 'hover:bg-slate-700/30'}`}
                                >
                                    <Users className="w-5 h-5" />
                                    <span>Social</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/calendar"
                                    className={`w-full flex items-center space-x-3 p-2 rounded-lg ${isActive('/dashboard/calendar') ? 'bg-slate-700/50 text-green-400' : 'hover:bg-slate-700/30'}`}
                                >
                                    <Calendar className="w-5 h-5" />
                                    <span>Calendar</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/notification"
                                    className={`w-full flex items-center space-x-3 p-2 rounded-lg ${isActive('/dashboard/notifications') ? 'bg-slate-700/50 text-green-400' : 'hover:bg-slate-700/30'}`}
                                >
                                    <Bell className="w-5 h-5" />
                                    <span>Notifications</span>
                                </Link>
                            </li>
                        </ul>

                        <div className="mt-8 pt-4 border-t border-slate-700/50">
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/dashboard/settings"
                                        className={`w-full flex items-center space-x-3 p-2 rounded-lg ${isActive('/dashboard/settings') ? 'bg-slate-700/50 text-green-400' : 'hover:bg-slate-700/30'}`}
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span>Settings</span>
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center space-x-3 p-2 rounded-lg text-red-400 hover:bg-slate-700/30"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Sign Out</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    {/* Top Bar */}
                    <div className="p-4 border-b border-slate-700/50 flex justify-between items-center backdrop-blur-md bg-black/30 sticky top-0 z-10">
                        <h2 className="text-xl font-semibold">
                            {pathname === '/dashboard' && 'Dashboard Overview'}
                            {pathname === '/dashboard/activity' && 'Your Activity'}
                            {pathname === '/dashboard/social' && 'Social Connections'}
                            {pathname === '/dashboard/calendar' && 'Fitness Calendar'}
                            {pathname === '/dashboard/notifications' && 'Notifications'}
                            {pathname === '/dashboard/profile' && 'Your Profile'}
                            {pathname === '/dashboard/settings' && 'Account Settings'}
                        </h2>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-green-400"
                                />
                            </div>

                            <Link href="/dashboard/notifications" className="relative">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full"></span>
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </GridBackground>
    );
}