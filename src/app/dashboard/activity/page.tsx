'use client'

import React, { useState } from 'react';
import { Activity, Calendar, Plus, ChevronRight, BarChart, Timer, Check } from 'lucide-react';
import GridBackground from '@/app/ui/background';
import SpotlightCard from '@/app/ui/spotlightcard';
import Link from 'next/link';

export default function ActivitiesPage() {
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Mock activity data
    const activities = [
        {
            id: 1,
            type: 'run',
            name: 'Morning Run',
            date: 'Today, 7:30 AM',
            duration: '45 min',
            distance: '5.2 km',
            calories: 420,
            completed: true
        },
        {
            id: 2,
            type: 'gym',
            name: 'Upper Body Workout',
            date: 'Yesterday, 6:00 PM',
            duration: '1 hr 15 min',
            exercises: 8,
            calories: 550,
            completed: true
        },
        {
            id: 3,
            type: 'bike',
            name: 'Evening Ride',
            date: 'Apr 10, 2025',
            duration: '30 min',
            distance: '8.7 km',
            calories: 310,
            completed: true
        },
        {
            id: 4,
            type: 'yoga',
            name: 'Morning Yoga Flow',
            date: 'Apr 13, 2025, 8:00 AM',
            duration: '30 min',
            calories: 140,
            completed: false
        },
        {
            id: 5,
            type: 'swim',
            name: 'Pool Laps',
            date: 'Apr 15, 2025, 5:30 PM',
            duration: '45 min',
            distance: '1.5 km',
            calories: 400,
            completed: false
        }
    ];

    // Filter activities
    const filteredActivities = selectedFilter === 'all'
        ? activities
        : selectedFilter === 'upcoming'
            ? activities.filter(a => !a.completed)
            : activities.filter(a => a.completed);

    // Activity type icons
    const getActivityIcon = (type: any) => {
        switch (type) {
            case 'run':
                return <Activity className="w-5 h-5 text-blue-400" />;
            case 'gym':
                return <BarChart className="w-5 h-5 text-purple-400" />;
            case 'bike':
                return <Activity className="w-5 h-5 text-green-400" />;
            case 'yoga':
                return <Activity className="w-5 h-5 text-yellow-400" />;
            case 'swim':
                return <Activity className="w-5 h-5 text-cyan-400" />;
            default:
                return <Activity className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <GridBackground>
            <div className="min-h-screen max-w-5xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Your Activities</h1>
                    <Link href="/dashboard">
                        <button className="bg-transparent hover:bg-white/10 p-2 rounded-lg transition-colors">
                            Back to Dashboard
                        </button>
                    </Link>
                </div>

                {/* Filters and Add Activity */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setSelectedFilter('all')}
                            className={`px-4 py-2 rounded-lg transition-colors ${selectedFilter === 'all'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedFilter('completed')}
                            className={`px-4 py-2 rounded-lg transition-colors ${selectedFilter === 'completed'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setSelectedFilter('upcoming')}
                            className={`px-4 py-2 rounded-lg transition-colors ${selectedFilter === 'upcoming'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            Upcoming
                        </button>
                    </div>

                    <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 px-4 py-2 rounded-lg">
                        <Plus className="w-4 h-4" />
                        <span>Add Activity</span>
                    </button>
                </div>

                {/* Activity Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <SpotlightCard className="p-4 rounded-xl">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 mx-auto flex items-center justify-center mb-3">
                                <Calendar className="w-6 h-6 text-blue-400" />
                            </div>
                            <p className="text-sm text-slate-300">This Week</p>
                            <p className="text-2xl font-bold mt-1">8 Activities</p>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-4 rounded-xl">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-3">
                                <Timer className="w-6 h-6 text-green-400" />
                            </div>
                            <p className="text-sm text-slate-300">Active Time</p>
                            <p className="text-2xl font-bold mt-1">8h 45m</p>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-4 rounded-xl">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 mx-auto flex items-center justify-center mb-3">
                                <BarChart className="w-6 h-6 text-purple-400" />
                            </div>
                            <p className="text-sm text-slate-300">Calories Burned</p>
                            <p className="text-2xl font-bold mt-1">3,250</p>
                        </div>
                    </SpotlightCard>
                </div>

                {/* Activities List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">
                        {selectedFilter === 'completed' ? 'Completed Activities' :
                            selectedFilter === 'upcoming' ? 'Upcoming Activities' : 'All Activities'}
                    </h2>

                    {filteredActivities.map((activity) => (
                        <SpotlightCard key={activity.id} className="p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full ${activity.type === 'run' ? 'bg-blue-500/20' :
                                        activity.type === 'gym' ? 'bg-purple-500/20' :
                                            activity.type === 'bike' ? 'bg-green-500/20' :
                                                activity.type === 'yoga' ? 'bg-yellow-500/20' :
                                                    'bg-cyan-500/20'
                                        } flex items-center justify-center`}>
                                        {getActivityIcon(activity.type)}
                                    </div>

                                    <div>
                                        <h3 className="font-medium">{activity.name}</h3>
                                        <p className="text-sm text-gray-400">{activity.date}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-medium">{activity.duration}</p>
                                        <p className="text-xs text-gray-400">
                                            {activity.distance ? `${activity.distance} • ` : ''}
                                            {activity.calories} cal
                                        </p>
                                    </div>

                                    {activity.completed ? (
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-green-400" />
                                        </div>
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}

                    {filteredActivities.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No activities found</p>
                        </div>
                    )}
                </div>
            </div>
        </GridBackground>
    );
}