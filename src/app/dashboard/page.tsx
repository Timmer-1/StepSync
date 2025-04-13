'use client'

import React from 'react';
import { TrendingUp, Clock, Award, Calendar, Activity, MessageCircle } from 'lucide-react';
import SpotlightCard from '@/app/ui/spotlightcard';

export default function DashboardOverview() {
    // Mock fitness data
    const fitnessData = {
        stepsToday: 8473,
        caloriesBurned: 1842,
        activeMins: 78,
        distanceKm: 6.2,
        weeklyGoalProgress: 68, // percentage
        streakDays: 15,
        upcomingEvents: [
            { id: 1, title: '5K Community Run', date: 'Tomorrow, 8:00 AM' },
            { id: 2, title: 'HIIT Class', date: 'Wed, 6:30 PM' }
        ],
        recentAchievements: [
            { id: 1, title: '10K Steps for 2 Weeks', date: 'Yesterday' },
            { id: 2, title: 'Climbed 100 Floors', date: '3 days ago' }
        ],
        connections: [
            { id: 1, name: 'Jane Smith', avatar: 'JS', status: 'active' },
            { id: 2, name: 'Mike Johnson', avatar: 'MJ', status: 'active' },
            { id: 3, name: 'Sarah Wilson', avatar: 'SW', status: 'away' }
        ],
        challenges: [
            { id: 1, title: 'Spring Challenge', progress: 72, participants: 156 },
            { id: 2, title: 'Walking Marathon', progress: 45, participants: 89 }
        ]
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <SpotlightCard className="p-6 rounded-xl">
                <div className="flex flex-col md:flex-row justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Welcome back!</h3>
                        <p className="text-slate-300 mb-4">Here's your fitness summary for today.</p>
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span>You're making great progress on your goals!</span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <div className="bg-gradient-to-r from-blue-500/30 to-teal-500/30 p-4 rounded-lg backdrop-blur-sm border border-slate-700/50">
                            <div className="text-center">
                                <p className="text-sm text-slate-300">Current streak</p>
                                <div className="flex items-center justify-center space-x-2 mt-1">
                                    <Clock className="w-5 h-5 text-green-400" />
                                    <span className="text-2xl font-bold">{fitnessData.streakDays} days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SpotlightCard>

            {/* Fitness Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SpotlightCard className="p-6 rounded-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 mx-auto flex items-center justify-center mb-3">
                            <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="text-slate-300">Steps Today</p>
                        <p className="text-2xl font-bold mt-1">{fitnessData.stepsToday.toLocaleString()}</p>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="p-6 rounded-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-teal-500/20 mx-auto flex items-center justify-center mb-3">
                            <Activity className="w-6 h-6 text-teal-400" />
                        </div>
                        <p className="text-slate-300">Calories</p>
                        <p className="text-2xl font-bold mt-1">{fitnessData.caloriesBurned.toLocaleString()}</p>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="p-6 rounded-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-3">
                            <Clock className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-slate-300">Active Minutes</p>
                        <p className="text-2xl font-bold mt-1">{fitnessData.activeMins}</p>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="p-6 rounded-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 mx-auto flex items-center justify-center mb-3">
                            <Activity className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="text-slate-300">Distance</p>
                        <p className="text-2xl font-bold mt-1">{fitnessData.distanceKm} km</p>
                    </div>
                </SpotlightCard>
            </div>

            {/* Weekly Goal Progress */}
            <SpotlightCard className="p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Weekly Goal Progress</h3>
                <div className="w-full bg-slate-700/50 rounded-full h-4 mb-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-teal-400 h-4 rounded-full"
                        style={{ width: `${fitnessData.weeklyGoalProgress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm">
                    <span>{fitnessData.weeklyGoalProgress}% complete</span>
                    <span>Goal: 10,000 steps/day</span>
                </div>
            </SpotlightCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Events */}
                <SpotlightCard className="p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Upcoming Events</h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                    </div>
                    <div className="space-y-4">
                        {fitnessData.upcomingEvents.map(event => (
                            <div key={event.id} className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium">{event.title}</p>
                                    <p className="text-sm text-slate-400">{event.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SpotlightCard>

                {/* Recent Achievements */}
                <SpotlightCard className="p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Recent Achievements</h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                    </div>
                    <div className="space-y-4">
                        {fitnessData.recentAchievements.map(achievement => (
                            <div key={achievement.id} className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Award className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="font-medium">{achievement.title}</p>
                                    <p className="text-sm text-slate-400">{achievement.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SpotlightCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Connections */}
                <SpotlightCard className="p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Your Connections</h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300">Find Friends</button>
                    </div>
                    <div className="space-y-4">
                        {fitnessData.connections.map(connection => (
                            <div key={connection.id} className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center">
                                    {connection.avatar}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{connection.name}</p>
                                    <p className="text-sm text-slate-400">
                                        {connection.status === 'active' ? 'Active now' : 'Away'}
                                    </p>
                                </div>
                                <button className="p-2 rounded-full hover:bg-slate-700/50">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </SpotlightCard>

                {/* Active Challenges */}
                <SpotlightCard className="p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Active Challenges</h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300">Join New</button>
                    </div>
                    <div className="space-y-4">
                        {fitnessData.challenges.map(challenge => (
                            <div key={challenge.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">{challenge.title}</p>
                                    <p className="text-sm text-slate-400">{challenge.participants} participants</p>
                                </div>
                                <div className="w-full bg-slate-700/50 rounded-full h-3 mb-1">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-teal-400 h-3 rounded-full"
                                        style={{ width: `${challenge.progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-right">{challenge.progress}% complete</p>
                            </div>
                        ))}
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
}