'use client'

import React, { useState, useEffect } from 'react';
import {
    Search
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import GridBackground from '@/app/ui/background';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/app/ui/notifications/notificiationbell';
import Sidebar from '../ui/sidebar';

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard Overview',
    '/dashboard/activity': 'Your Activity',
    '/dashboard/social': 'Social Connections',
    '/dashboard/calendar': 'Fitness Calendar',
    '/dashboard/notification': 'Notifications',
    '/dashboard/profile': 'Your Profile',
    '/dashboard/settings': 'Account Settings'
};

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

    // Get the current page title
    const getPageTitle = () => {
        return PAGE_TITLES[pathname] || 'Dashboard';
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
            <div className="min-h-screen flex">
                {/* Sidebar */}
                <Sidebar userData={userData} onSignOut={handleSignOut} />

                {/* Main Content */}
                <div className="ml-64 flex-1 overflow-auto">
                    {/* Top Bar */}
                    <div className="p-4 border-b border-slate-700/50 flex justify-between items-center backdrop-blur-md bg-black/30 sticky top-0 z-10">
                        <h2 className="text-xl font-semibold">
                            {getPageTitle()}
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

                            <NotificationBell />
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