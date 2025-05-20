'use client'

import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Plus, ChevronRight, BarChart, Timer, Check } from 'lucide-react';
import GridBackground from '@/app/ui/background';
import SpotlightCard from '@/app/ui/spotlightcard';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import WorkoutDetailsModal from '@/app/ui/workoutdetailsmodal';
import AddSessionModal from '@/app/ui/addsessionmodal';

interface EnhancedSession {
    id: string;
    session_date: string;
    duration_minutes: number;
    notes: string;
    completed: boolean;
    workoutType: string;
}

export default function ActivitiesPage() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [timePeriod, setTimePeriod] = useState('week');
    const [sessions, setSessions] = useState<EnhancedSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
    const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
    const supabase = createClient();

    const fetchSessions = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('User error:', userError);
                return;
            }

            // First get basic session data
            const { data: sessionsData, error: sessionsError } = await supabase
                .from('workout_sessions')
                .select('id, session_date, duration_minutes, notes, completed')
                .eq('user_id', user.id)
                .order('session_date', { ascending: false });

            if (sessionsError) {
                console.error('Sessions error:', sessionsError);
                return;
            }

            // Enhanced sessions with workout type
            const enhancedSessions = [];

            // For each session, fetch associated exercises
            for (const session of sessionsData || []) {
                const { data: exercises, error: exercisesError } = await supabase
                    .from('workout_session_exercises')
                    .select('exercise_id, exercises:exercise_id(name)')
                    .eq('workout_session_id', session.id);

                if (exercisesError) {
                    console.error(`Error fetching exercises for session ${session.id}:`, exercisesError);
                }

                // Default workout type
                let workoutType = "Workout Session";

                // If exercises exist, use the first exercise name
                if (exercises && exercises.length > 0 && exercises[0].exercises && exercises[0].exercises.length > 0) {
                    workoutType = exercises[0].exercises[0].name;
                }

                enhancedSessions.push({
                    ...session,
                    workoutType
                });
            }

            setSessions(enhancedSessions);
        } catch (err) {
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSession = async (sessionData: {
        newDate: string;
        newDuration: number;
        newNotes: string;
        exercises: Array<{
            exercise_id: string;
            sets: number;
            reps_per_set: number;
            weight: number;
        }>;
    }) => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('User error:', userError);
                return;
            }

            // Create the workout session
            const { data: createdSession, error: sessionError } = await supabase
                .from('workout_sessions')
                .insert({
                    user_id: user.id,
                    session_date: sessionData.newDate,
                    duration_minutes: sessionData.newDuration,
                    notes: sessionData.newNotes,
                    completed: false
                })
                .select()
                .single();

            if (sessionError) {
                console.error('Session creation error:', sessionError);
                return;
            }

            // If there are exercises, create the session exercises
            if (sessionData.exercises && sessionData.exercises.length > 0) {
                const { error: exercisesError } = await supabase
                    .from('workout_session_exercises')
                    .insert(
                        sessionData.exercises.map(exercise => ({
                            workout_session_id: createdSession.id,
                            exercise_id: exercise.exercise_id,
                            sets: exercise.sets,
                            reps_per_set: exercise.reps_per_set,
                            weight: exercise.weight
                        }))
                    );

                if (exercisesError) {
                    console.error('Exercises creation error:', exercisesError);
                    return;
                }
            }

            // Refresh the sessions list
            await fetchSessions();
        } catch (err) {
            console.error('Add session error:', err);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const toggleCompletion = async (sessionId: number, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('workout_sessions')
                .update({ completed: !currentStatus })
                .eq('id', sessionId);

            if (error) {
                console.error('Error updating completion status:', error);
                return;
            }

            // Update local state
            setSessions(sessions.map(session =>
                session.id.toString() === sessionId.toString()
                    ? { ...session, completed: !currentStatus }
                    : session
            ));
        } catch (err) {
            console.error('Error toggling completion:', err);
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        try {
            // First delete any associated session exercises
            const { error: exercisesError } = await supabase
                .from('workout_session_exercises')
                .delete()
                .eq('workout_session_id', sessionId);

            if (exercisesError) {
                console.error('Error deleting session exercises:', exercisesError);
                return;
            }

            // Then delete the workout session
            const { error: sessionError } = await supabase
                .from('workout_sessions')
                .delete()
                .eq('id', sessionId);

            // Update local state by removing the deleted session
            setSessions(prevSessions => {
                // Make sure we're comparing the same types (both strings)
                const filteredSessions = prevSessions.filter(session =>
                    session.id.toString() !== sessionId.toString()
                );
                return filteredSessions;
            });

            // Clear the selected workout if it was the one deleted
            if (selectedWorkout && selectedWorkout.id.toString() === sessionId.toString()) {
                setSelectedWorkout(null);
            }
        } catch (err) {
            console.error('Error deleting session:', err);
        }
    };

    // Filter activities
    const filteredActivities = selectedFilter === 'all'
        ? sessions
        : selectedFilter === 'upcoming'
            ? sessions.filter(s => !s.completed)
            : sessions.filter(s => s.completed);

    // Activity type icons
    const getActivityIcon = (type: string) => {
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

    // Calculate date range based on selected time period
    const getDateRange = () => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        switch (timePeriod) {
            case 'day':
                const startOfDay = new Date(today);
                startOfDay.setHours(0, 0, 0, 0);
                return { start: startOfDay, end: today };
            case 'week':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                startOfWeek.setHours(0, 0, 0, 0);
                return { start: startOfWeek, end: today };
            case 'month':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                startOfMonth.setHours(0, 0, 0, 0);
                return { start: startOfMonth, end: today };
            default:
                return { start: new Date(0), end: today }; // All time
        }
    };

    // Helper to get date string (YYYY-MM-DD) from session_date
    const getDateString = (dateInput: string | Date) => {
        const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const { start, end } = getDateRange();

    // For 'week' filter, generate all valid date strings for this week
    let weekDateSet = new Set<string>();
    if (timePeriod === 'week') {
        let current = new Date(start);
        current.setHours(0, 0, 0, 0);
        while (current <= end) {
            weekDateSet.add(getDateString(current));
            current.setDate(current.getDate() + 1);
        }
    }

    const isThisWeek = (session: EnhancedSession) => {
        if (timePeriod !== 'week') return false;
        const sessionDateStr = getDateString(session.session_date);
        return weekDateSet.has(sessionDateStr) && session.completed;
    };

    // Calculate summary statistics
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const isToday = (session: EnhancedSession) => session.session_date === todayStr && session.completed;

    const sessionsThisWeek = sessions.filter(s => {
        if (timePeriod === 'day') {
            return isToday(s);
        } else if (timePeriod === 'week') {
            return isThisWeek(s);
        } else {
            const sessionDate = new Date(s.session_date);
            return sessionDate >= start && sessionDate <= end && s.completed;
        }
    }).length;

    const totalActiveTime = sessions
        .filter(s => {
            if (timePeriod === 'day') {
                return isToday(s);
            } else if (timePeriod === 'week') {
                return isThisWeek(s);
            } else {
                const sessionDate = new Date(s.session_date);
                return sessionDate >= start && sessionDate <= end && s.completed;
            }
        })
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    const totalCalories = sessions
        .filter(s => {
            if (timePeriod === 'day') {
                return isToday(s);
            } else if (timePeriod === 'week') {
                return isThisWeek(s);
            } else {
                const sessionDate = new Date(s.session_date);
                return sessionDate >= start && sessionDate <= end && s.completed;
            }
        })
        .reduce((sum, s) => sum + ((s.duration_minutes || 0) * 8), 0);

    // Calculate today's stats
    const todaySessionsCount = sessions.filter(isToday).length;
    const todayActiveMinutes = sessions
        .filter(isToday)
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    const handleSessionAdded = (duration: number) => {
        // Refresh the sessions list
        fetchSessions();
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

    const formatDateForDisplay = (dateString: string) => {
        const dateParts = dateString.split('-');
        // Create a date object with year, month (0-based), and day using local timezone
        const date = new Date(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2]),
            12, // Set to noon to avoid timezone issues
            0,
            0
        );

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const uniqueSessionDates = Array.from(
        new Set(sessions.filter(s => s.completed).map(s => s.session_date))
    ).sort((a, b) => b.localeCompare(a)); // Descending

    // Calculate streak using the correct implementation
    const calculateStreak = (workoutDates: string[]): number => {
        if (!workoutDates.length) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = workoutDates
            .map(date => new Date(date))
            .sort((a, b) => b.getTime() - a.getTime());

        let streak = 0;
        let currentDate = today;

        for (let i = 0; i < dates.length; i++) {
            const workoutDate = dates[i];
            workoutDate.setHours(0, 0, 0, 0);

            // If there's a gap of more than 1 day, break the streak
            if (i > 0) {
                const prevDate = dates[i - 1];
                const dayDiff = Math.floor((prevDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayDiff > 1) break;
            }

            // If the workout was today or yesterday, count it
            const dayDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff <= 1) {
                streak++;
                currentDate = workoutDate;
            } else {
                break;
            }
        }

        return streak;
    };

    const streakDays = calculateStreak(uniqueSessionDates);

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
                    <div className="flex items-center space-x-3">
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

                        <div className="relative">
                            <select
                                value={timePeriod}
                                onChange={(e) => setTimePeriod(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                                style={{ minWidth: '140px' }}
                            >
                                <option value="day" className="bg-slate-800 text-slate-100">Today</option>
                                <option value="week" className="bg-slate-800 text-slate-100">This Week</option>
                                <option value="month" className="bg-slate-800 text-slate-100">This Month</option>
                                <option value="all" className="bg-slate-800 text-slate-100">All Time</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAddSessionModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 px-4 py-2 rounded-lg"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Workout Session</span>
                    </button>
                </div>

                {/* Activity Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <SpotlightCard className="p-4 rounded-xl">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 mx-auto flex items-center justify-center mb-3">
                                <Calendar className="w-6 h-6 text-blue-400" />
                            </div>
                            <p className="text-sm text-slate-300">
                                {timePeriod === 'day' ? 'Today' :
                                    timePeriod === 'week' ? 'This Week' :
                                        timePeriod === 'month' ? 'This Month' : 'All Time'}
                            </p>
                            <p className="text-2xl font-bold mt-1">{sessionsThisWeek} Activities</p>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-4 rounded-xl">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-3">
                                <Timer className="w-6 h-6 text-green-400" />
                            </div>
                            <p className="text-sm text-slate-300">Active Time</p>
                            <p className="text-2xl font-bold mt-1">{Math.floor(totalActiveTime / 60)}h {totalActiveTime % 60}m</p>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-4 rounded-xl">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 mx-auto flex items-center justify-center mb-3">
                                <BarChart className="w-6 h-6 text-purple-400" />
                            </div>
                            <p className="text-sm text-slate-300">Calories Burned</p>
                            <p className="text-2xl font-bold mt-1">{totalCalories.toLocaleString()}</p>
                        </div>
                    </SpotlightCard>
                </div>

                {/* Activities List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">
                        {selectedFilter === 'completed' ? 'Completed Activities' :
                            selectedFilter === 'upcoming' ? 'Upcoming Activities' : 'All Activities'}
                    </h2>

                    {filteredActivities.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => setSelectedWorkout(session)}
                            className="cursor-pointer"
                        >
                            <SpotlightCard className="p-4 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-blue-400" />
                                        </div>

                                        <div>
                                            <h3 className="font-medium">{session.workoutType}</h3>
                                            <p className="text-sm text-gray-400">
                                                {formatDateForDisplay(session.session_date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className="text-sm font-medium">{session.duration_minutes} min</p>
                                            <p className="text-xs text-gray-400">
                                                {(session.duration_minutes * 8).toLocaleString()} cal
                                            </p>
                                        </div>

                                        {session.completed ? (
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-green-400" />
                                            </div>
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </SpotlightCard>
                        </div>
                    ))}

                    {filteredActivities.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No activities found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Workout Details Modal */}
            <WorkoutDetailsModal
                isOpen={!!selectedWorkout}
                onClose={() => setSelectedWorkout(null)}
                workout={selectedWorkout}
                onToggleComplete={toggleCompletion}
                onDelete={handleDeleteSession}
            />

            {/* Add Session Modal */}
            <AddSessionModal
                isOpen={isAddSessionModalOpen}
                onClose={() => setIsAddSessionModalOpen(false)}
                onAddSession={handleAddSession}
                todaySessionsCount={todaySessionsCount}
                todayActiveMinutes={todayActiveMinutes}
                onSessionAdded={handleSessionAdded}
            />
        </GridBackground>
    );
}