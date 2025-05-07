'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Dumbbell, BarChart3, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import SessionButton from '../ui/sessionbutton';
import SessionDetailView from '../ui/sessiondetailview';

// Type definitions
interface WorkoutSession {
    id: string;
    user_id: string;
    session_date: string;
    duration_minutes: number;
    notes: string;
    created_at: string;
}

interface WorkoutStats {
    thisWeekCount: number;
    thisWeekMinutes: number;
    previousWeekCount: number;
    previousWeekMinutes: number;
    totalSessions: number;
    mostFrequentExercise: {
        name: string;
        count: number;
    } | null;
}

const WorkoutTracker: React.FC = () => {
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [todaySessionsCount, setTodaySessionsCount] = useState(0);
    const [todayActiveMinutes, setTodayActiveMinutes] = useState(0);
    const [stats, setStats] = useState<WorkoutStats>({
        thisWeekCount: 0,
        thisWeekMinutes: 0,
        previousWeekCount: 0,
        previousWeekMinutes: 0,
        totalSessions: 0,
        mostFrequentExercise: null
    });
    const [loading, setLoading] = useState(true);

    // Initialize Supabase client
    const supabase = createClient();

    // Fetch all workout data
    const fetchWorkoutData = async () => {
        try {
            setLoading(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Get session data
            const { data: sessionData, error: sessionError } = await supabase
                .from('workout_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('session_date', { ascending: false });

            if (sessionError) {
                console.error('Error fetching sessions:', sessionError);
                setLoading(false);
                return;
            }

            setSessions(sessionData || []);

            // Update today's stats
            await calculateTodayStats(sessionData || []);

            // Calculate overall stats
            await calculateWorkoutStats(sessionData || [], user.id);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching workout data:', error);
            setLoading(false);
        }
    };

    // Calculate today's stats
    const calculateTodayStats = async (sessionData: WorkoutSession[]) => {
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = sessionData.filter(session => session.session_date === today);

        setTodaySessionsCount(todaySessions.length);
        const minutes = todaySessions.reduce((total, session) => total + (session.duration_minutes || 0), 0);
        setTodayActiveMinutes(minutes);
    };

    // Calculate broader workout stats
    const calculateWorkoutStats = async (sessionData: WorkoutSession[], userId: string) => {
        try {
            // Get date ranges for this week and previous week
            const today = new Date();
            const currentWeekStart = new Date(today);
            currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
            currentWeekStart.setHours(0, 0, 0, 0);

            const previousWeekStart = new Date(currentWeekStart);
            previousWeekStart.setDate(previousWeekStart.getDate() - 7);

            const previousWeekEnd = new Date(currentWeekStart);
            previousWeekEnd.setMilliseconds(-1);

            // Filter sessions for current and previous week
            const thisWeekSessions = sessionData.filter(session => {
                const sessionDate = new Date(session.session_date);
                return sessionDate >= currentWeekStart && sessionDate <= today;
            });

            const previousWeekSessions = sessionData.filter(session => {
                const sessionDate = new Date(session.session_date);
                return sessionDate >= previousWeekStart && sessionDate < currentWeekStart;
            });

            // Calculate this week's stats
            const thisWeekCount = thisWeekSessions.length;
            const thisWeekMinutes = thisWeekSessions.reduce(
                (total, session) => total + (session.duration_minutes || 0),
                0
            );

            // Calculate previous week's stats
            const previousWeekCount = previousWeekSessions.length;
            const previousWeekMinutes = previousWeekSessions.reduce(
                (total, session) => total + (session.duration_minutes || 0),
                0
            );

            // Get most frequent exercise (if available)
            let mostFrequentExercise = null;

            // Fetch all workout session exercises
            const { data: exercises, error: exercisesError } = await supabase
                .from('workout_session_exercises')
                .select(`
          exercise_id,
          workout_sessions!inner(user_id)
        `)
                .eq('workout_sessions.user_id', userId);

            if (!exercisesError && exercises && exercises.length > 0) {
                // Count frequency of each exercise
                const exerciseCounts: Record<string, number> = {};
                exercises.forEach(ex => {
                    exerciseCounts[ex.exercise_id] = (exerciseCounts[ex.exercise_id] || 0) + 1;
                });

                // Find the most frequent
                let maxCount = 0;
                let mostFrequentId = '';

                Object.entries(exerciseCounts).forEach(([id, count]) => {
                    if (count > maxCount) {
                        maxCount = count;
                        mostFrequentId = id;
                    }
                });

                if (mostFrequentId) {
                    // Get the exercise name
                    const { data: exerciseData } = await supabase
                        .from('exercises')
                        .select('name')
                        .eq('id', mostFrequentId)
                        .single();

                    if (exerciseData) {
                        mostFrequentExercise = {
                            name: exerciseData.name,
                            count: maxCount
                        };
                    }
                }
            }

            setStats({
                thisWeekCount,
                thisWeekMinutes,
                previousWeekCount,
                previousWeekMinutes,
                totalSessions: sessionData.length,
                mostFrequentExercise
            });

        } catch (error) {
            console.error('Error calculating workout stats:', error);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchWorkoutData();
    }, []);

    // Handle adding a new session
    const handleAddSession = async (sessionData: {
        newDate: string;
        newDuration: number;
        newNotes: string;
        exercises: {
            exercise_id: string;
            sets: number;
            reps_per_set: number;
            weight: number;
        }[];
    }) => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert('Please log in to add a session');
                return false;
            }

            // 1. Insert the workout session
            const { data: newSession, error: sessionError } = await supabase
                .from('workout_sessions')
                .insert({
                    user_id: user.id,
                    session_date: sessionData.newDate,
                    duration_minutes: sessionData.newDuration,
                    notes: sessionData.newNotes
                })
                .select()
                .single();

            if (sessionError || !newSession) {
                console.error('Error adding workout session:', sessionError);
                alert('Failed to add workout session');
                return false;
            }

            // 2. Insert all exercises for this session
            if (sessionData.exercises.length > 0) {
                const exercisesData = sessionData.exercises.map((exercise, index) => ({
                    workout_session_id: newSession.id,
                    exercise_id: exercise.exercise_id,
                    sets: exercise.sets,
                    reps_per_set: exercise.reps_per_set,
                    weight: exercise.weight,
                    exercise_order: index
                }));

                const { error: exercisesError } = await supabase
                    .from('workout_session_exercises')
                    .insert(exercisesData);

                if (exercisesError) {
                    console.error('Error adding exercises to session:', exercisesError);
                    // Consider rolling back the session insert if needed
                }
            }

            // 3. Refresh the data
            await fetchWorkoutData();

            return true;
        } catch (error) {
            console.error('Error in handleAddSession:', error);
            alert('An unexpected error occurred');
            return false;
        }
    };

    // Update today's stats when a new session is added
    const handleSessionAdded = (duration: number) => {
        // Update the UI immediately (optimistic update)
        setTodaySessionsCount(prev => prev + 1);
        setTodayActiveMinutes(prev => prev + duration);
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    // Get CSS class for growth indicators
    const getGrowthClass = (growthPercent: number) => {
        if (growthPercent > 0) return 'text-green-400';
        if (growthPercent < 0) return 'text-red-400';
        return 'text-slate-400';
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left sidebar */}
                <div className="md:col-span-1 space-y-6">
                    {/* Session Button */}
                    <div className="bg-slate-900 rounded-xl shadow-lg p-4">
                        <h2 className="text-xl font-bold mb-4">Track Your Progress</h2>

                        <SessionButton
                            onAddSession={handleAddSession}
                            todaySessionsCount={todaySessionsCount}
                            todayActiveMinutes={todayActiveMinutes}
                            onSessionAdded={handleSessionAdded}
                        />
                    </div>

                    {/* Weekly Stats */}
                    <div className="bg-slate-900 rounded-xl shadow-lg p-4">
                        <h2 className="text-xl font-bold mb-4">Weekly Stats</h2>

                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-slate-400">Workouts</div>
                                    <div className="flex items-center gap-1">
                                        {stats.thisWeekCount > 0 && (
                                            <>
                                                <span className={getGrowthClass(calculateGrowth(stats.thisWeekCount, stats.previousWeekCount))}>
                                                    {calculateGrowth(stats.thisWeekCount, stats.previousWeekCount) > 0 ? '+' : ''}
                                                    {calculateGrowth(stats.thisWeekCount, stats.previousWeekCount)}%
                                                </span>
                                                <BarChart3 className="w-3 h-3 text-slate-400" />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-2xl font-semibold">{stats.thisWeekCount}</div>
                                <div className="text-xs text-slate-500 mt-1">vs {stats.previousWeekCount} last week</div>
                            </div>

                            <div className="bg-slate-800/50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-slate-400">Active Minutes</div>
                                    <div className="flex items-center gap-1">
                                        {stats.thisWeekMinutes > 0 && (
                                            <>
                                                <span className={getGrowthClass(calculateGrowth(stats.thisWeekMinutes, stats.previousWeekMinutes))}>
                                                    {calculateGrowth(stats.thisWeekMinutes, stats.previousWeekMinutes) > 0 ? '+' : ''}
                                                    {calculateGrowth(stats.thisWeekMinutes, stats.previousWeekMinutes)}%
                                                </span>
                                                <BarChart3 className="w-3 h-3 text-slate-400" />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-2xl font-semibold">{stats.thisWeekMinutes}</div>
                                <div className="text-xs text-slate-500 mt-1">vs {stats.previousWeekMinutes} last week</div>
                            </div>

                            {stats.mostFrequentExercise && (
                                <div className="bg-slate-800/50 p-3 rounded-lg">
                                    <div className="text-sm text-slate-400">Most Performed Exercise</div>
                                    <div className="text-lg font-semibold mt-1">{stats.mostFrequentExercise.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        Performed {stats.mostFrequentExercise.count} times
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-800/50 p-3 rounded-lg">
                                <div className="text-sm text-slate-400">Total Sessions</div>
                                <div className="text-2xl font-semibold mt-1">{stats.totalSessions}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="md:col-span-2">
                    {selectedSessionId ? (
                        <SessionDetailView
                            sessionId={selectedSessionId}
                            onBack={() => setSelectedSessionId(null)}
                        />
                    ) : (
                        <div className="bg-slate-900 rounded-xl shadow-lg">
                            <div className="p-4 border-b border-slate-800">
                                <h2 className="text-xl font-bold">Recent Workout Sessions</h2>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : sessions.length > 0 ? (
                                <div className="divide-y divide-slate-800">
                                    {sessions.map(session => (
                                        <button
                                            key={session.id}
                                            className="w-full p-4 text-left hover:bg-slate-800/50 transition-colors flex items-center"
                                            onClick={() => setSelectedSessionId(session.id)}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-400" />
                                                    <span className="font-semibold">{formatDate(session.session_date)}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{session.duration_minutes} minutes</span>
                                                    </div>

                                                    {session.notes && (
                                                        <div className="line-clamp-1 max-w-xs">
                                                            {session.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <ChevronRight className="w-5 h-5 text-slate-600" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <Dumbbell className="w-12 h-12 text-slate-600 mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No workout sessions yet</h3>
                                    <p className="text-slate-400 max-w-md">
                                        Start tracking your fitness journey by adding your first workout session.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutTracker;