'use client'

import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    MessageSquare,
    Bell,
    Filter,
    ChevronDown,
    Heart,
    Share,
    MessageCircle,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import GridBackground from "@/app/ui/background";
import SpotlightCard from "@/app/ui/spotlightcard";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Mock data for connections
const mockConnections = [
    { id: 1, name: 'Sarah Johnson', avatar: 'SJ', status: 'active', bio: 'Fitness coach & marathon runner', stats: { workouts: 45, followers: 286, following: 124 } },
    { id: 2, name: 'Michael Chen', avatar: 'MC', status: 'active', bio: 'Tech enthusiast, daily runner', stats: { workouts: 32, followers: 178, following: 143 } },
    { id: 3, name: 'Emma Rodriguez', avatar: 'ER', status: 'away', bio: 'Yoga instructor & wellness advocate', stats: { workouts: 38, followers: 412, following: 98 } },
    { id: 4, name: 'David Park', avatar: 'DP', status: 'active', bio: 'CrossFit competitor & nutrition coach', stats: { workouts: 52, followers: 631, following: 211 } },
];

// Mock data for activity feed
const mockActivityFeed = [
    {
        id: 1,
        user: { name: 'Sarah Johnson', avatar: 'SJ' },
        type: 'workout',
        content: 'Just completed a 5-mile run in 38 minutes! 🏃‍♀️',
        timestamp: '15 minutes ago',
        likes: 24,
        comments: 3,
        image: '/api/placeholder/600/300'
    },
    {
        id: 2,
        user: { name: 'Michael Chen', avatar: 'MC' },
        type: 'achievement',
        content: 'Reached my monthly goal of 20 workouts! Feeling stronger than ever.',
        timestamp: '2 hours ago',
        likes: 42,
        comments: 7,
    },
    {
        id: 3,
        user: { name: 'Emma Rodriguez', avatar: 'ER' },
        type: 'challenge',
        content: 'Just joined the Summer Fitness Challenge. Who else is in? Let\'s motivate each other!',
        timestamp: '5 hours ago',
        likes: 18,
        comments: 12,
    },
    {
        id: 4,
        user: { name: 'David Park', avatar: 'DP' },
        type: 'milestone',
        content: 'Hit a new personal record on deadlifts today: 315 lbs! 💪',
        timestamp: '1 day ago',
        likes: 56,
        comments: 8,
        image: '/api/placeholder/600/300'
    },
];

// Mock data for friend suggestions
const mockSuggestions = [
    { id: 1, name: 'Alex Wong', avatar: 'AW', mutualConnections: 5 },
    { id: 2, name: 'Priya Patel', avatar: 'PP', mutualConnections: 3 },
    { id: 3, name: 'James Wilson', avatar: 'JW', mutualConnections: 7 },
];

export default function SocialPage() {
    const [activeTab, setActiveTab] = useState('feed');
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function getUserData() {
            setLoading(true);
            const { data: { user }, error } = await supabase.auth.getUser();

            // Uncomment this in production to enforce authentication
            // if (error || !user) {
            //   console.error('Error fetching user:', error);
            //   router.push('/auth/login');
            //   return;
            // }

            // If we have a user, set the user data
            setUserData(user || { email: 'user@example.com' }); // Fallback for development
            setLoading(false);
        }

        getUserData();
    }, [router]);

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
            <div className="min-h-screen max-w-6xl mx-auto px-4 py-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                            Social Feed
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Connect with friends and share your fitness journey
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search connections..."
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                            />
                        </div>
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-gray-600">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-gray-600">
                            <MessageSquare className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`px-4 py-2 font-medium ${activeTab === 'feed'
                                ? 'text-green-400 border-b-2 border-green-400'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Activity Feed
                    </button>
                    <button
                        onClick={() => setActiveTab('connections')}
                        className={`px-4 py-2 font-medium ${activeTab === 'connections'
                                ? 'text-green-400 border-b-2 border-green-400'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        My Connections
                    </button>
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={`px-4 py-2 font-medium ${activeTab === 'discover'
                                ? 'text-green-400 border-b-2 border-green-400'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Discover
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - For Activity Feed and Connections List */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        {activeTab === 'feed' && (
                            <div className="space-y-6">
                                {/* New Post Area */}
                                <SpotlightCard className="p-4 rounded-xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold">
                                            {userData?.user_metadata?.name ? userData.user_metadata.name.charAt(0) : userData?.email?.charAt(0)}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Share an update or achievement..."
                                            className="flex-1 px-4 py-2 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                                        />
                                        <button className="px-4 py-2 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors">
                                            Post
                                        </button>
                                    </div>
                                </SpotlightCard>

                                {/* Activity Feed */}
                                {mockActivityFeed.map(activity => (
                                    <SpotlightCard key={activity.id} className="p-4 rounded-xl">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                {activity.user.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium">{activity.user.name}</h3>
                                                        <p className="text-gray-400 text-sm">{activity.timestamp}</p>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-white">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                <p className="mt-2">{activity.content}</p>
                                                {activity.image && (
                                                    <div className="mt-3 rounded-lg overflow-hidden">
                                                        <img src={activity.image} alt="Activity" className="w-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                                                    <button className="flex items-center gap-1 text-gray-400 hover:text-green-400">
                                                        <Heart className="h-4 w-4" />
                                                        <span>{activity.likes}</span>
                                                    </button>
                                                    <button className="flex items-center gap-1 text-gray-400 hover:text-green-400">
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span>{activity.comments}</span>
                                                    </button>
                                                    <button className="flex items-center gap-1 text-gray-400 hover:text-green-400">
                                                        <Share className="h-4 w-4" />
                                                        <span>Share</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                ))}
                            </div>
                        )}

                        {activeTab === 'connections' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">My Connections</h2>
                                    <button className="flex items-center gap-1 text-gray-300 hover:text-green-400 text-sm">
                                        <Filter className="h-4 w-4" />
                                        <span>Filter</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mockConnections.map(connection => (
                                        <SpotlightCard key={connection.id} className="p-4 rounded-xl flex items-start gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold">
                                                    {connection.avatar}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-900 ${connection.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                                                    }`}></div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <h3 className="font-medium">{connection.name}</h3>
                                                    <button className="text-gray-400 hover:text-green-400">
                                                        <MessageSquare className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">{connection.bio}</p>

                                                <div className="flex justify-between mt-3 pt-2 border-t border-gray-700 text-sm">
                                                    <div className="text-center">
                                                        <div className="font-medium">{connection.stats.workouts}</div>
                                                        <div className="text-xs text-gray-400">Workouts</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-medium">{connection.stats.followers}</div>
                                                        <div className="text-xs text-gray-400">Followers</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-medium">{connection.stats.following}</div>
                                                        <div className="text-xs text-gray-400">Following</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SpotlightCard>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'discover' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">Discover Users</h2>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Featured Users Section */}
                                    <SpotlightCard className="p-6 rounded-xl">
                                        <h3 className="text-lg font-medium mb-4">Featured Athletes</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 flex items-center justify-center text-white font-semibold">
                                                    JT
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">Jessica Thompson</h4>
                                                    <p className="text-sm text-gray-400">Olympic Swimmer</p>
                                                </div>
                                                <button className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-green-400 text-gray-900 hover:bg-green-300">
                                                    <UserPlus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-400 flex items-center justify-center text-white font-semibold">
                                                    KJ
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">Kevin Johnson</h4>
                                                    <p className="text-sm text-gray-400">Fitness Influencer</p>
                                                </div>
                                                <button className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-green-400 text-gray-900 hover:bg-green-300">
                                                    <UserPlus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-400 flex items-center justify-center text-white font-semibold">
                                                    AL
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">Ana Lopes</h4>
                                                    <p className="text-sm text-gray-400">Yoga Instructor</p>
                                                </div>
                                                <button className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-green-400 text-gray-900 hover:bg-green-300">
                                                    <UserPlus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
                                                    RW
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">Robert Wilson</h4>
                                                    <p className="text-sm text-gray-400">Trail Runner</p>
                                                </div>
                                                <button className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-green-400 text-gray-900 hover:bg-green-300">
                                                    <UserPlus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </SpotlightCard>

                                    {/* Popular Communities Section */}
                                    <SpotlightCard className="p-6 rounded-xl">
                                        <h3 className="text-lg font-medium mb-4">Popular Communities</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-green-400 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">Marathon Runners</h4>
                                                    <p className="text-sm text-gray-400">12.4K members</p>
                                                </div>
                                                <button className="ml-auto px-3 py-1 rounded-lg bg-green-400 text-gray-900 text-sm font-medium hover:bg-green-300">
                                                    Join
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">Yoga & Mindfulness</h4>
                                                    <p className="text-sm text-gray-400">8.7K members</p>
                                                </div>
                                                <button className="ml-auto px-3 py-1 rounded-lg bg-green-400 text-gray-900 text-sm font-medium hover:bg-green-300">
                                                    Join
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-400 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">CrossFit Enthusiasts</h4>
                                                    <p className="text-sm text-gray-400">15.2K members</p>
                                                </div>
                                                <button className="ml-auto px-3 py-1 rounded-lg bg-green-400 text-gray-900 text-sm font-medium hover:bg-green-300">
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - For Static Content */}
                    <div className="col-span-1 space-y-6">
                        {/* User Profile Card */}
                        <SpotlightCard className="p-5 rounded-xl">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-semibold mx-auto">
                                    {userData?.user_metadata?.name ? userData.user_metadata.name.charAt(0) : userData?.email?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{userData?.user_metadata?.name || userData?.email?.split('@')[0]}</h3>
                                    <p className="text-gray-400 text-sm">{userData?.email}</p>
                                </div>
                                <div className="flex justify-center space-x-6 pt-3 border-t border-gray-700">
                                    <div className="text-center">
                                        <div className="font-bold">48</div>
                                        <div className="text-xs text-gray-400">Workouts</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold">156</div>
                                        <div className="text-xs text-gray-400">Connections</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold">23</div>
                                        <div className="text-xs text-gray-400">Challenges</div>
                                    </div>
                                </div>
                            </div>
                            <Link href="/dashboard">
                                <button className="w-full mt-4 py-2 border border-gray-600 rounded-lg hover:bg-white/5 transition-colors">
                                    View Profile
                                </button>
                            </Link>
                        </SpotlightCard>

                        {/* People You May Know */}
                        <SpotlightCard className="p-5 rounded-xl">
                            <h3 className="font-semibold mb-4">People You May Know</h3>
                            <div className="space-y-4">
                                {mockSuggestions.map(suggestion => (
                                    <div key={suggestion.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold">
                                            {suggestion.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{suggestion.name}</h4>
                                            <p className="text-xs text-gray-400">{suggestion.mutualConnections} mutual connections</p>
                                        </div>
                                        <button className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-gray-600">
                                            <UserPlus className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                <button className="w-full text-sm text-green-400 hover:text-green-300 mt-2">
                                    View More
                                </button>
                            </div>
                        </SpotlightCard>

                        {/* Trending Challenges */}
                        <SpotlightCard className="p-5 rounded-xl">
                            <h3 className="font-semibold mb-4">Trending Challenges</h3>
                            <div className="space-y-3">
                                <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                                    <h4 className="font-medium">Summer Fitness Challenge</h4>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span className="text-gray-400">2,345 participants</span>
                                        <span className="text-green-400">12 days left</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2">
                                        <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                                    <h4 className="font-medium">10K Steps Daily</h4>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span className="text-gray-400">1,872 participants</span>
                                        <span className="text-green-400">Ongoing</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2">
                                        <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full" style={{ width: '78%' }}></div>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                                    <h4 className="font-medium">30-Day Yoga Journey</h4>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span className="text-gray-400">985 participants</span>
                                        <span className="text-green-400">5 days left</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2">
                                        <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>

                                <button className="w-full text-sm text-green-400 hover:text-green-300 mt-2">
                                    View All Challenges
                                </button>
                            </div>
                        </SpotlightCard>
                    </div>
                </div>
            </div>
        </GridBackground>
    );
}