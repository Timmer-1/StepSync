'use client'

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, X, Check, Activity, Accessibility } from 'lucide-react';
import SpotlightCard from '@/app/ui/spotlightcard';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import SessionButton from '@/app/ui/sessionbutton';
import AddSessionModal from '@/app/ui/addsessionmodal';
import WorkoutDetailsModal from '@/app/ui/workoutdetailsmodal';
import Link from 'next/link';

interface WorkoutSession {
    id: string;
    session_date: string;
    duration_minutes: number;
    notes: string;
    completed: boolean;
    created_at: string;
}

interface CalendarDay {
    day: number;
    month: string;
    date: Date;
}

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
    const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
    const [viewFilter, setViewFilter] = useState('all'); // Filter state variable
    const router = useRouter();
    const supabase = createClient();

    // Today's stats for session button
    const [todaySessionsCount, setTodaySessionsCount] = useState(0);
    const [todayActiveMinutes, setTodayActiveMinutes] = useState(0);

    useEffect(() => {
        async function getUserData() {
            try {
                setLoading(true);
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    console.error('Error fetching user:', error);
                    router.push('/auth/login');
                    return;
                }

                setUserData(user);
                await fetchWorkoutSessions(user.id);
            } catch (err) {
                console.error('Error initializing data:', err);
            } finally {
                setLoading(false);
            }
        }

        getUserData();
    }, [router]);

    // Fetch workout sessions from Supabase
    const fetchWorkoutSessions = async (userId: string) => {
        try {
            // Get all workout sessions for the user
            const { data: sessions, error } = await supabase
                .from('workout_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('session_date', { ascending: false });

            if (error) {
                console.error('Error fetching workout sessions:', error);
                return;
            }

            setWorkoutSessions(sessions || []);

            // Calculate today's stats correctly
            const today = new Date().toISOString().split('T')[0];
            const todaySessions = (sessions || []).filter(
                session => session.session_date === today && session.completed
            );

            setTodaySessionsCount(todaySessions.length);
            const minutes = todaySessions.reduce(
                (total, session) => total + (session.duration_minutes || 0), 0
            );
            setTodayActiveMinutes(minutes);
        } catch (error) {
            console.error('Error in fetchWorkoutSessions:', error);
        }
    };

    // Calendar helper functions
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getPreviousDays = (date: Date) => {
        const firstDay = getFirstDayOfMonth(date);
        const prevMonthDays: CalendarDay[] = [];

        if (firstDay > 0) {
            const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
            const daysInPrevMonth = getDaysInMonth(prevMonth);

            for (let i = daysInPrevMonth - firstDay + 1; i <= daysInPrevMonth; i++) {
                prevMonthDays.push({
                    day: i,
                    month: 'prev',
                    date: new Date(date.getFullYear(), date.getMonth() - 1, i)
                });
            }
        }

        return prevMonthDays;
    };

    const getCurrentDays = (date: Date) => {
        const daysInMonth = getDaysInMonth(date);
        const currentDays: CalendarDay[] = [];

        for (let i = 1; i <= daysInMonth; i++) {
            currentDays.push({
                day: i,
                month: 'current',
                date: new Date(date.getFullYear(), date.getMonth(), i)
            });
        }

        return currentDays;
    };

    const getNextDays = (date: Date) => {
        const daysInMonth = getDaysInMonth(date);
        const firstDay = getFirstDayOfMonth(date);
        const nextDays: CalendarDay[] = [];

        const totalCells = 42; // 6 rows, 7 days
        const remainingCells = totalCells - (firstDay + daysInMonth);

        for (let i = 1; i <= remainingCells; i++) {
            nextDays.push({
                day: i,
                month: 'next',
                date: new Date(date.getFullYear(), date.getMonth() + 1, i)
            });
        }

        return nextDays;
    };

    // Get filtered workout sessions based on current view filter
    const getFilteredWorkoutSessions = () => {
        switch (viewFilter) {
            case 'completed':
                return workoutSessions.filter(session => session.completed);
            case 'upcoming':
                return workoutSessions.filter(session => !session.completed);
            case 'all':
            default:
                return workoutSessions;
        }
    };

    const renderCalendar = () => {
        const prevDays = getPreviousDays(currentMonth);
        const currentDays = getCurrentDays(currentMonth);
        const nextDays = getNextDays(currentMonth);

        const allDays = [...prevDays, ...currentDays, ...nextDays];
        const filteredSessions = getFilteredWorkoutSessions();

        // Group days into weeks
        const weeks = [];
        for (let i = 0; i < allDays.length; i += 7) {
            weeks.push(allDays.slice(i, i + 7));
        }

        return weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                    // Format the date to YYYY-MM-DD for comparison with session_date
                    const formattedDate = day.date.toISOString().split('T')[0];

                    // Check if this day has workout sessions (using filtered sessions)
                    const daySessions = filteredSessions.filter(
                        session => session.session_date === formattedDate
                    );

                    // Check if this is today
                    const isToday =
                        day.date.getDate() === new Date().getDate() &&
                        day.date.getMonth() === new Date().getMonth() &&
                        day.date.getFullYear() === new Date().getFullYear();

                    // Check if this is the selected date
                    const isSelected =
                        day.date.getDate() === selectedDate.getDate() &&
                        day.date.getMonth() === selectedDate.getMonth() &&
                        day.date.getFullYear() === selectedDate.getFullYear();

                    return (
                        <div
                            key={dayIndex}
                            className={`h-24 p-1 border ${day.month === 'current'
                                ? 'border-slate-700/50'
                                : 'border-slate-800/50 bg-slate-800/20'} 
                ${isToday ? 'ring-2 ring-blue-500' : ''} 
                ${isSelected ? 'bg-slate-700/30' : ''} 
                rounded-lg transition-all hover:bg-slate-700/20 cursor-pointer`}
                            onClick={() => setSelectedDate(day.date)}
                        >
                            <div className={`text-sm mb-1 ${day.month !== 'current' ? 'text-slate-500' : ''}`}>
                                {day.day}
                            </div>

                            {daySessions.length > 0 && (
                                <div className="space-y-1">
                                    {daySessions.slice(0, 2).map(session => (
                                        <div
                                            key={session.id}
                                            className={`text-xs p-1 truncate rounded ${session.completed
                                                ? 'bg-green-500/20 text-green-300'
                                                : 'bg-blue-500/20 text-blue-300'
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedWorkout(session);
                                            }}
                                        >
                                            <span className="font-medium">{session.duration_minutes} min</span> workout
                                        </div>
                                    ))}

                                    {daySessions.length > 2 && (
                                        <div className="text-xs text-blue-400">
                                            +{daySessions.length - 2} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        ));
    };

    // Format month and year
    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Go to previous month
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    // Go to next month
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Get sessions for selected date (filtered by the current filter)
    const getSelectedDateSessions = () => {
        const filteredSessions = getFilteredWorkoutSessions();
        return filteredSessions.filter(
            session => session.session_date === selectedDate.toISOString().split('T')[0]
        );
    };

    // Handle adding a new session
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
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert('Please log in to add a session');
                return false;
            }

            // Insert the workout session
            const { data: newSession, error: sessionError } = await supabase
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

            if (sessionError || !newSession) {
                console.error('Error adding workout session:', sessionError);
                alert('Failed to add workout session');
                return false;
            }

            // Insert all exercises for this session
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
                }
            }

            // Refresh the workout sessions
            await fetchWorkoutSessions(user.id);

            return true;
        } catch (error) {
            console.error('Error in handleAddSession:', error);
            alert('An unexpected error occurred');
            return false;
        }
    };

    // Toggle workout completion status
    const toggleWorkoutCompletion = async (id: string, currentStatus: boolean) => {
        try {
            console.log(`Toggling completion for session ID: ${id}, current status: ${currentStatus}`);

            const { error } = await supabase
                .from('workout_sessions')
                .update({ completed: !currentStatus })
                .eq('id', id);

            if (error) {
                console.error('Error updating workout session:', error);
                return;
            }

            // Update local state
            setWorkoutSessions(prevSessions =>
                prevSessions.map(session =>
                    session.id === id
                        ? { ...session, completed: !currentStatus }
                        : session
                )
            );

            // If the selected workout is the one being updated, update it too
            if (selectedWorkout && selectedWorkout.id === id) {
                setSelectedWorkout({
                    ...selectedWorkout,
                    completed: !currentStatus
                });
            }

            // Refresh workout sessions to ensure data consistency
            if (userData) {
                await fetchWorkoutSessions(userData.id);
            }

            console.log(`Successfully toggled completion for session ID: ${id}`);
        } catch (error) {
            console.error('Error toggling workout completion:', error);
        }
    };

    // Delete workout session
    const handleDeleteWorkout = async (id: string) => {
        try {
            console.log(`Deleting workout session with ID: ${id}`);

            // First delete any associated exercises
            const { error: exercisesError } = await supabase
                .from('workout_session_exercises')
                .delete()
                .eq('workout_session_id', id);

            if (exercisesError) {
                console.error('Error deleting session exercises:', exercisesError);
            }

            // Then delete the session
            const { error } = await supabase
                .from('workout_sessions')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting workout session:', error);
                return;
            }

            // Update local state to remove the deleted session
            setWorkoutSessions(prevSessions =>
                prevSessions.filter(session => session.id !== id)
            );

            // If the deleted workout was the selected one, clear the selection
            if (selectedWorkout && selectedWorkout.id === id) {
                setSelectedWorkout(null);
            }

            // Refresh workout sessions to ensure data consistency
            if (userData) {
                await fetchWorkoutSessions(userData.id);
            }

            console.log(`Successfully deleted session ID: ${id}`);
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
    };

    // Handle session added callback
    const handleSessionAdded = async (duration: number) => {
        // Update today's stats immediately (optimistic update)
        const today = new Date().toISOString().split('T')[0];
        const newSessionDate = selectedDate.toISOString().split('T')[0];

        // Only update today's count if the new session is for today
        if (newSessionDate === today) {
            setTodaySessionsCount(prev => prev + 1);
            setTodayActiveMinutes(prev => prev + duration);
        }

        // Close the modal
        setShowAddWorkoutModal(false);

        // Refresh sessions
        if (userData) {
            await fetchWorkoutSessions(userData.id);
        }
    };

    // Get filtered upcoming workouts based on current view and month
    const getUpcomingWorkouts = () => {
        // Get today's date at midnight for proper comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get last day of current month
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        return workoutSessions
            .filter(session => {
                // Parse the session date
                const sessionDate = new Date(session.session_date);
                sessionDate.setHours(0, 0, 0, 0);

                // Include sessions that are:
                // 1. Not completed
                // 2. In the current month
                // 3. Today or in the future
                return !session.completed &&
                    sessionDate >= today &&
                    sessionDate <= lastDayOfMonth;
            })
            .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
    };

    // Helper function to determine workout type description based on session data
    const getWorkoutDescription = (session: WorkoutSession) => {
        // Default label is just "Workout Session"
        // In a real app, you'd use the associated exercise types or categories
        return `Workout Session`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Get selected date sessions based on current filter
    const selectedDateSessions = getSelectedDateSessions();

    return (
        <div className="space-y-6">
            {/* Header area with title and button */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Fitness Calendar</h1>
                <button
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-400 text-gray-900 px-4 py-2 rounded-lg"
                    onClick={() => setShowAddWorkoutModal(true)}
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Workout</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex space-x-3">
                <button
                    onClick={() => setViewFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${viewFilter === 'all'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                >
                    All Workouts
                </button>
                <button
                    onClick={() => setViewFilter('completed')}
                    className={`px-4 py-2 rounded-lg transition-colors ${viewFilter === 'completed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                >
                    Completed
                </button>
                <button
                    onClick={() => setViewFilter('upcoming')}
                    className={`px-4 py-2 rounded-lg transition-colors ${viewFilter === 'upcoming'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                >
                    Upcoming
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Section */}
                <div className="lg:col-span-2">
                    <SpotlightCard className="p-6 rounded-xl">
                        {/* Calendar Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">{formatMonthYear(currentMonth)}</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={prevMonth}
                                    className="p-2 rounded-full hover:bg-slate-700/50"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentMonth(new Date())}
                                    className="px-3 py-1 text-sm bg-slate-700/50 rounded-md hover:bg-slate-600/50"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={nextMonth}
                                    className="p-2 rounded-full hover:bg-slate-700/50"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="mb-4">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-sm font-medium text-slate-400 p-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar dates */}
                            <div className="space-y-1">
                                {renderCalendar()}
                            </div>
                        </div>

                        {/* Filter description */}
                        <div className="mb-4 text-sm text-slate-400">
                            {viewFilter === 'all' && 'Showing all workouts in the calendar'}
                            {viewFilter === 'completed' && 'Showing only completed workouts in the calendar'}
                            {viewFilter === 'upcoming' && 'Showing only upcoming workouts in the calendar'}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-4 border-t border-slate-700/50 pt-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500/70 mr-2"></div>
                                <span className="text-sm">Completed Workout</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500/70 mr-2"></div>
                                <span className="text-sm">Upcoming Workout</span>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>

                {/* Selected Day Details */}
                <div>
                    <SpotlightCard className="p-6 rounded-xl">
                        <div className="flex items-center space-x-2 mb-4">
                            <CalendarIcon className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-semibold">
                                {selectedDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h2>
                        </div>

                        {selectedDateSessions.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateSessions.map(session => (
                                    <div key={session.id} className="bg-slate-800/30 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-medium">{getWorkoutDescription(session)}</h3>
                                            <div className={`text-xs px-2 py-1 rounded ${session.completed
                                                ? 'bg-green-500/20 text-green-300'
                                                : 'bg-blue-500/20 text-blue-300'
                                                }`}>
                                                {session.completed ? 'Completed' : 'Planned'}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center text-slate-300">
                                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                                <span>{session.duration_minutes} minutes</span>
                                            </div>

                                            {session.notes && (
                                                <div className="text-slate-300 mt-2 p-2 bg-slate-700/30 rounded">
                                                    <p className="text-sm italic">"{session.notes}"</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                className={`px-3 py-1 text-sm rounded-md ${session.completed
                                                    ? 'bg-slate-700/50 hover:bg-slate-600/50'
                                                    : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                                    }`}
                                                onClick={() => toggleWorkoutCompletion(session.id, session.completed)}
                                            >
                                                {session.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                            </button>
                                            <button
                                                className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30"
                                                onClick={() => handleDeleteWorkout(session.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="bg-slate-800/30 rounded-lg p-6">
                                    {viewFilter !== 'all' ? (
                                        <p className="text-slate-400 mb-4">
                                            No {viewFilter === 'completed' ? 'completed' : 'upcoming'} workouts for this day.
                                        </p>
                                    ) : (
                                        <p className="text-slate-400 mb-4">No workouts scheduled for this day.</p>
                                    )}
                                    <button
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
                                        onClick={() => setShowAddWorkoutModal(true)}
                                    >
                                        Add Workout Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </SpotlightCard>

                    {/* Upcoming Workouts Preview */}
                    <SpotlightCard className="p-6 rounded-xl mt-6">
                        <h3 className="text-lg font-semibold mb-4">Upcoming Workouts</h3>

                        <div className="space-y-3">
                            {getUpcomingWorkouts()
                                .slice(0, 5)
                                .map(session => (
                                    <div
                                        key={session.id}
                                        className="flex items-center space-x-3 bg-slate-800/30 p-3 rounded-lg hover:bg-slate-700/30 cursor-pointer"
                                        onClick={() => {
                                            setSelectedWorkout(session);
                                            // Set the calendar date to this session's date
                                            const sessionDate = new Date(session.session_date);
                                            setSelectedDate(sessionDate);

                                            // If session date is in a different month, update currentMonth
                                            const currMonth = currentMonth.getMonth();
                                            const sessionMonth = sessionDate.getMonth();
                                            if (currMonth !== sessionMonth) {
                                                setCurrentMonth(new Date(sessionDate.getFullYear(), sessionMonth, 1));
                                            }
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/20">
                                            <Activity className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{getWorkoutDescription(session)}</p>
                                            <p className="text-sm text-slate-400">
                                                {new Date(session.session_date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })} · {session.duration_minutes} min
                                            </p>
                                        </div>
                                    </div>
                                ))}

                            {getUpcomingWorkouts().length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-slate-400">No upcoming workouts scheduled for this month.</p>
                                </div>
                            )}

                            {getUpcomingWorkouts().length > 5 && (
                                <button
                                    className="w-full text-center text-blue-400 hover:text-blue-300 text-sm mt-2"
                                    onClick={() => {
                                        // Set filter to show only upcoming workouts
                                        setViewFilter('upcoming');
                                    }}
                                >
                                    View all upcoming workouts
                                </button>
                            )}
                        </div>
                    </SpotlightCard>

                    {/* Quick navigation to Activity page */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/dashboard/activity"
                            className="inline-flex items-center justify-center px-4 py-2 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            View All Activities
                        </Link>
                    </div>
                </div>
            </div>

            <AddSessionModal
                isOpen={showAddWorkoutModal}
                onClose={() => setShowAddWorkoutModal(false)}
                onAddSession={handleAddSession}
                todaySessionsCount={todaySessionsCount}
                todayActiveMinutes={todayActiveMinutes}
                onSessionAdded={handleSessionAdded}
            />

            {/* Workout Details Modal */}
            {selectedWorkout && (
                <WorkoutDetailsModal
                    isOpen={!!selectedWorkout}
                    onClose={() => setSelectedWorkout(null)}
                    workout={{
                        id: Number(selectedWorkout.id), // Convert to number for the modal
                        session_date: selectedWorkout.session_date,
                        duration_minutes: selectedWorkout.duration_minutes,
                        notes: selectedWorkout.notes || '',
                        completed: selectedWorkout.completed
                    }}
                    onToggleComplete={(id, currentStatus) => {
                        // Convert id back to string when calling our function
                        toggleWorkoutCompletion(String(id), currentStatus);
                    }}
                    onDelete={(id) => {
                        // Convert id back to string when calling our function
                        handleDeleteWorkout(String(id));
                    }}
                />
            )}
        </div>
    );
}