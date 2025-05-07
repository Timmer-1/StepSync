'use client'

import React, { useState, useEffect } from 'react';
import {
    User,
    Bell,
    Shield,
    Lock,
    LogOut,
    Trash2,
    ChevronRight,
    Save
} from 'lucide-react';
import GridBackground from '@/app/ui/background';
import SpotlightCard from '@/app/ui/spotlightcard';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Settings() {
    // User data state
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const router = useRouter();
    const supabase = createClient();

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    // Get user data on component mount
    useEffect(() => {
        async function getUserData() {
            setLoading(true);
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                console.error('Error fetching user:', error);
                router.push('/auth/login');
                return;
            }

            setUserData(user);

            // Set initial form values
            setName(user.user_metadata?.name || user.email?.split('@')[0] || '');
            setEmail(user.email || '');

            setLoading(false);
        }

        getUserData();
    }, [router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleSaveProfile = () => {
        // Save profile logic would go here
        setSuccessMessage('Profile updated successfully');

        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    };

    const handleSaveNotifications = () => {
        // Save notifications logic would go here
        setSuccessMessage('Notification preferences updated');

        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
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
            <div className="min-h-screen">
                {/* Top Navigation Bar */}
                <div className="container mx-auto py-4 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Settings Navigation */}
                        <div className="md:col-span-1">
                            <SpotlightCard className="p-4 rounded-xl">
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left ${activeTab === 'profile' ? 'bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-teal-400' : 'hover:bg-slate-700/20'}`}
                                    >
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 mr-3" />
                                            <span>Profile</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('notifications')}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left ${activeTab === 'notifications' ? 'bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-teal-400' : 'hover:bg-slate-700/20'}`}
                                    >
                                        <div className="flex items-center">
                                            <Bell className="w-5 h-5 mr-3" />
                                            <span>Notifications</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('privacy')}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left ${activeTab === 'privacy' ? 'bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-teal-400' : 'hover:bg-slate-700/20'}`}
                                    >
                                        <div className="flex items-center">
                                            <Shield className="w-5 h-5 mr-3" />
                                            <span>Privacy & Security</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mt-8 pt-4 border-t border-slate-700/50 space-y-1">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center p-3 rounded-lg text-left text-red-400 hover:bg-red-500/10"
                                    >
                                        <LogOut className="w-5 h-5 mr-3" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </SpotlightCard>
                        </div>

                        {/* Settings Content */}
                        <div className="md:col-span-3">
                            {/* Success Message */}
                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center space-x-2">
                                    <div className="text-green-400 text-sm">{successMessage}</div>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <SpotlightCard className="p-6 rounded-xl">
                                    <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white text-2xl font-semibold">
                                                {userData?.user_metadata?.name ? userData.user_metadata.name.charAt(0) : userData?.email?.charAt(0)}
                                            </div>
                                            <div>
                                                <button className="px-4 py-2 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                                                    Change Photo
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                                                    Display Name
                                                </label>
                                                <input
                                                    id="displayName"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex items-center px-6 py-2 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </button>
                                    </div>
                                </SpotlightCard>
                            )}

                            {activeTab === 'notifications' && (
                                <SpotlightCard className="p-6 rounded-xl">
                                    <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="flex items-center justify-between">
                                                <span className="font-medium">Email Notifications</span>
                                                <div className="relative inline-block w-12 h-6">
                                                    <input
                                                        type="checkbox"
                                                        className="opacity-0 w-0 h-0"
                                                        checked={emailNotifications}
                                                        onChange={() => setEmailNotifications(!emailNotifications)}
                                                    />
                                                    <span
                                                        className={`absolute cursor-pointer inset-0 rounded-full transition-colors ${emailNotifications ? 'bg-green-400' : 'bg-gray-600'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`absolute h-5 w-5 bg-white rounded-full transform transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                                                } top-0.5`}
                                                        ></span>
                                                    </span>
                                                </div>
                                            </label>
                                            <p className="text-sm text-gray-400 mt-1">Receive email notifications for activities, challenges, and friend requests</p>
                                        </div>

                                        <div>
                                            <label className="flex items-center justify-between">
                                                <span className="font-medium">Push Notifications</span>
                                                <div className="relative inline-block w-12 h-6">
                                                    <input
                                                        type="checkbox"
                                                        className="opacity-0 w-0 h-0"
                                                        checked={pushNotifications}
                                                        onChange={() => setPushNotifications(!pushNotifications)}
                                                    />
                                                    <span
                                                        className={`absolute cursor-pointer inset-0 rounded-full transition-colors ${pushNotifications ? 'bg-green-400' : 'bg-gray-600'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`absolute h-5 w-5 bg-white rounded-full transform transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'
                                                                } top-0.5`}
                                                        ></span>
                                                    </span>
                                                </div>
                                            </label>
                                            <p className="text-sm text-gray-400 mt-1">Receive push notifications on your device</p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-700/50">
                                            <h3 className="text-lg font-medium mb-3">Notification Types</h3>

                                            <div className="space-y-3">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-600 text-green-400 focus:ring-green-400 bg-white/5"
                                                        defaultChecked
                                                    />
                                                    <span className="ml-2">Friend Requests</span>
                                                </label>

                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-600 text-green-400 focus:ring-green-400 bg-white/5"
                                                        defaultChecked
                                                    />
                                                    <span className="ml-2">Activity Updates</span>
                                                </label>

                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-600 text-green-400 focus:ring-green-400 bg-white/5"
                                                        defaultChecked
                                                    />
                                                    <span className="ml-2">Challenge Invites</span>
                                                </label>

                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-600 text-green-400 focus:ring-green-400 bg-white/5"
                                                        defaultChecked
                                                    />
                                                    <span className="ml-2">Goal Achievements</span>
                                                </label>

                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-600 text-green-400 focus:ring-green-400 bg-white/5"
                                                    />
                                                    <span className="ml-2">Product Updates</span>
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSaveNotifications}
                                            className="flex items-center px-6 py-2 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Preferences
                                        </button>
                                    </div>
                                </SpotlightCard>
                            )}

                            {activeTab === 'privacy' && (
                                <SpotlightCard className="p-6 rounded-xl">
                                    <h2 className="text-xl font-bold mb-6">Privacy & Security</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-3">Password</h3>
                                            <button className="flex items-center px-4 py-2 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                                                <Lock className="w-4 h-4 mr-2" />
                                                Change Password
                                            </button>
                                        </div>

                                        <div className="pt-4 border-t border-slate-700/50">
                                            <h3 className="text-lg font-medium mb-3">Privacy Settings</h3>

                                            <div className="space-y-3">
                                                <label className="flex items-center justify-between">
                                                    <span>Who can see my profile</span>
                                                    <select className="bg-slate-700/50 border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                                                        <option>Everyone</option>
                                                        <option>Friends Only</option>
                                                        <option>Private</option>
                                                    </select>
                                                </label>

                                                <label className="flex items-center justify-between">
                                                    <span>Show my activity on leaderboards</span>
                                                    <div className="relative inline-block w-12 h-6">
                                                        <input
                                                            type="checkbox"
                                                            className="opacity-0 w-0 h-0"
                                                            defaultChecked
                                                        />
                                                        <span
                                                            className="absolute cursor-pointer inset-0 rounded-full bg-green-400"
                                                        >
                                                            <span
                                                                className="absolute h-5 w-5 bg-white rounded-full transform translate-x-6 top-0.5"
                                                            ></span>
                                                        </span>
                                                    </div>
                                                </label>

                                                <label className="flex items-center justify-between">
                                                    <span>Allow friend requests</span>
                                                    <div className="relative inline-block w-12 h-6">
                                                        <input
                                                            type="checkbox"
                                                            className="opacity-0 w-0 h-0"
                                                            defaultChecked
                                                        />
                                                        <span
                                                            className="absolute cursor-pointer inset-0 rounded-full bg-green-400"
                                                        >
                                                            <span
                                                                className="absolute h-5 w-5 bg-white rounded-full transform translate-x-6 top-0.5"
                                                            ></span>
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <button className="text-red-400 hover:underline flex items-center text-xl">
                                            <Trash2 className="w-6 h-6 mr-2" />
                                            Delete account
                                        </button>

                                    </div>
                                </SpotlightCard>
                            )}


                        </div>
                    </div>
                </div>
            </div>
        </GridBackground>
    );
}