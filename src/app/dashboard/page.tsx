'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TrendingUp, Clock, Activity, MessageCircle } from 'lucide-react';
import SpotlightCard from '@/app/ui/spotlightcard';
import SessionButton from '@/app/ui/sessionbutton';

interface Goal {
    id: string;
    name: string;
    target_value: number;
    unit: string;
}

interface UserGoal {
    goal: Goal;
    progress_value: number;
}

export default function DashboardOverview() {
    const [user, setUser] = useState<{ id: string; email: string; first_name: string } | null>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [goals, setGoals] = useState<UserGoal[]>([])
    const [friends, setFriends] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const [session, setSession] = useState<any>(null)
    const [editingGoal, setEditingGoal] = useState(false);
    const [goalInput, setGoalInput] = useState(goals[0]?.goal.target_value || '');
    const [goalUnit, setGoalUnit] = useState(goals[0]?.goal.unit || '');
    const [goalId, setGoalId] = useState(goals[0]?.goal.id || null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    const fetchAll = async () => {
        setLoading(true)
        try {
            const {
                data: { user: authUser },
                error: userErr
            } = await supabase.auth.getUser()

            if (userErr) {
                console.error('User fetch error:', userErr)
                throw userErr
            }

            if (!authUser) {
                console.error('No authenticated user found')
                throw new Error('No user')
            }

            setUser({
                id: authUser.id,
                email: authUser.email || '',
                first_name: authUser.user_metadata.first_name
            })

            // Fetch data with proper error handling
            const [sessionsResponse, goalsResponse, friendsResponse] = await Promise.all([
                supabase
                    .from('workout_sessions')
                    .select('id, session_date, duration_minutes, completed')
                    .eq('user_id', authUser.id)
                    .order('session_date', { ascending: false }),
                supabase
                    .from('user_goals')
                    .select('progress_value, goal:goals (id, name, target_value, unit)')
                    .eq('user_id', authUser.id),
                supabase
                    .from('friendships')
                    .select('friend:users!frienships_friend_id_fkey ( id, first_name, last_name )')
                    .eq('user_id', authUser.id)
                    .eq('status', 'accepted'),
            ])

            // Check for errors in each response and throw if any exist
            if (sessionsResponse.error) {
                console.error('Sessions error:', sessionsResponse.error)
                throw sessionsResponse.error
            }
            if (goalsResponse.error) {
                console.error('Goals error:', goalsResponse.error)
                throw goalsResponse.error
            }
            if (friendsResponse.error) {
                console.error('Friends error:', friendsResponse.error)
                throw friendsResponse.error
            }

            // Log the data we received
            console.log('Fetched sessions:', sessionsResponse.data)
            console.log('Fetched goals:', goalsResponse.data)
            console.log('Fetched friends:', friendsResponse.data)

            setSessions(sessionsResponse.data || [])
            setGoals((goalsResponse.data || []).map((g: any) => ({
                progress_value: g.progress_value,
                goal: g.goal as Goal
            })))
            setFriends((friendsResponse.data || []).map((r: any) => r.friend))
        } catch (err) {
            console.error('Error in fetchAll:', err)
            // Set empty arrays on error to prevent undefined states
            setSessions([])
            setGoals([])
            setFriends([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        async function initSession() {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) {
                    console.error('Session error:', error)
                    return
                }

                setSession(session)
                if (session) {
                    await fetchAll()
                } else {
                    console.log('No active session found')
                    setLoading(false)
                }
            } catch (err) {
                console.error('Error initializing session:', err)
                setLoading(false)
            }
        }
        initSession()
    }, [])

    const handleAddSession = async (sessionInput: {
        newDate: string,
        newDuration: number,
        newNotes: string,
        exercises: Array<{
            exercise_id: string,
            sets: number,
            reps_per_set: number,
            weight: number
        }>
    }) => {
        try {
            // Get the current user first
            const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()

            if (userError || !authUser) {
                console.error('User error:', userError)
                throw new Error('No authenticated user found')
            }

            console.log('Auth User:', {
                id: authUser.id,
                email: authUser.email,
                metadata: authUser.user_metadata
            })

            // Verify user exists in users table
            let { data: userData, error: userCheckError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single()

            // If user doesn't exist in users table, create them
            if (userCheckError && userCheckError.code === 'PGRST116') {
                console.log('Creating missing user record...')
                const { error: createError } = await supabase
                    .from('users')
                    .insert({
                        id: authUser.id,
                        email: authUser.email,
                        first_name: authUser.user_metadata.first_name || '',
                        last_name: authUser.user_metadata.last_name || '',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })

                if (createError) {
                    console.error('Error creating user record:', createError)
                    throw new Error('Failed to create user record')
                }

                console.log('User record created successfully')

                // Fetch the newly created user
                const { data: newUserData, error: newUserError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()

                if (newUserError) {
                    console.error('Error fetching new user:', newUserError)
                    throw new Error('Failed to verify new user record')
                }

                userData = newUserData
                console.log('New user data fetched:', userData)
            } else if (userCheckError) {
                console.error('Error checking user:', userCheckError)
                throw new Error('Error verifying user')
            }

            if (!userData) {
                console.error('User not found in users table:', authUser.id)
                throw new Error('User not found in database')
            }

            console.log('User data from database:', userData)

            // First, create the workout session
            console.log('Creating workout session with data:', {
                user_id: authUser.id,
                session_date: sessionInput.newDate,
                duration_minutes: sessionInput.newDuration,
                notes: sessionInput.newNotes
            })

            const { data: createdSession, error: sessionError } = await supabase
                .from('workout_sessions')
                .insert({
                    user_id: authUser.id,
                    session_date: sessionInput.newDate,
                    duration_minutes: sessionInput.newDuration,
                    notes: sessionInput.newNotes
                })
                .select()
                .single()

            if (sessionError) {
                console.error('Session creation error:', sessionError)
                throw sessionError
            }

            console.log('Workout session created:', createdSession)

            // Then, if there are exercises, create the session exercises
            if (sessionInput.exercises && sessionInput.exercises.length > 0) {
                console.log('Raw exercise input:', JSON.stringify(sessionInput.exercises, null, 2));

                const exerciseData = sessionInput.exercises.map(exercise => ({
                    workout_session_id: createdSession.id,  // Changed from session_id to workout_session_id
                    exercise_id: exercise.exercise_id,
                    sets: Number(exercise.sets),
                    reps_per_set: Number(exercise.reps_per_set),
                    weight: Number(exercise.weight)
                }));

                console.log('Transformed exercise data:', JSON.stringify(exerciseData, null, 2));

                try {
                    const { data: createdExercises, error: exercisesError } = await supabase
                        .from('workout_session_exercises')  // Changed from session_exercises to workout_session_exercises
                        .insert(exerciseData)
                        .select();

                    if (exercisesError) {
                        console.error('Exercises creation error:', exercisesError);
                        console.error('Error details:', {
                            code: exercisesError.code,
                            message: exercisesError.message,
                            details: exercisesError.details,
                            hint: exercisesError.hint
                        });
                        // Log the SQL query that would have been executed
                        console.error('Failed SQL query would have been:', {
                            table: 'workout_session_exercises',
                            data: exerciseData
                        });
                    } else {
                        console.log('Session exercises created successfully:', createdExercises);
                    }
                } catch (err) {
                    console.error('Unexpected error during exercise creation:', err);
                    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace available');
                }
            }

            // Update local state with new session
            setSessions(prevSessions => [createdSession, ...prevSessions]);

            // Update goals progress if needed
            if (goals.length > 0) {
                const goal = goals[0];
                const goalType = goal.goal.unit;
                let currentValue = 0;

                // Get current week's start date (Sunday)
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekStartStr = weekStart.toISOString().split('T')[0];

                // Calculate new progress value
                switch (goalType) {
                    case 'calories':
                        currentValue = [...sessions, createdSession]
                            .filter(s => s.completed && s.session_date >= weekStartStr)
                            .reduce((sum, s) => sum + (s.duration_minutes ?? 0) * 8, 0);
                        break;
                    case 'minutes':
                        currentValue = [...sessions, createdSession]
                            .filter(s => s.completed && s.session_date >= weekStartStr)
                            .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
                        break;
                    case 'km':
                        currentValue = ([...sessions, createdSession]
                            .filter(s => s.completed && s.session_date >= weekStartStr)
                            .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) / 60) * 5;
                        break;
                    case 'workouts':
                        currentValue = [...sessions, createdSession]
                            .filter(s => s.completed && s.session_date >= weekStartStr)
                            .length;
                        break;
                }

                // Update goal progress in database
                const { error: updateError } = await supabase
                    .from('user_goals')
                    .update({ progress_value: currentValue })
                    .eq('goal_id', goal.goal.id)
                    .eq('user_id', authUser.id);

                if (updateError) {
                    console.error('Error updating goal progress:', updateError);
                } else {
                    // Update local state with new progress
                    setGoals(prevGoals => prevGoals.map(g => {
                        if (g.goal.id === goal.goal.id) {
                            return {
                                ...g,
                                progress_value: currentValue
                            };
                        }
                        return g;
                    }));
                }
            }

            if (createdSession.id) setSelectedSessionId(createdSession.id);
            return createdSession.id;
        } catch (err) {
            console.error('Add session error:', err)
            throw err // Re-throw to let the UI handle the error
        }
    }

    const handleDeleteSession = async (sessionId: string) => {
        try {
            // First delete any associated exercises
            const { error: exercisesError } = await supabase
                .from('workout_session_exercises')
                .delete()
                .eq('workout_session_id', sessionId);

            if (exercisesError) {
                console.error('Error deleting session exercises:', exercisesError);
                throw exercisesError;
            }

            // Then delete the session
            const { error: sessionError } = await supabase
                .from('workout_sessions')
                .delete()
                .eq('id', sessionId);

            if (sessionError) {
                console.error('Error deleting session:', sessionError);
                throw sessionError;
            }

            // Update local state by removing the deleted session
            setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));

            // Update goals progress if needed
            if (goals.length > 0) {
                const goal = goals[0];
                const goalType = goal.goal.unit;
                let currentValue = 0;

                // Get current week's start date (Sunday)
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekStartStr = weekStart.toISOString().split('T')[0];

                // Calculate new progress value with the deleted session removed
                const remainingSessions = sessions.filter(s => s.id !== sessionId);
                switch (goalType) {
                    case 'calories':
                        currentValue = remainingSessions
                            .filter(s => s.completed && s.session_date >= weekStartStr)
                            .reduce((sum, s) => sum + (s.duration_minutes ?? 0) * 8, 0);
                        break;
                    case 'minutes':
                        currentValue = remainingSessions
                            .filter(s => s.completed && s.session_date >= weekStartStr)
                            .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
                        break;
                    case 'km':
                        currentValue = (remainingSessions
                            .filter(s => s.completed && s.session_date >= weekStartStr)
                            .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) / 60) * 5;
                        break;
                    case 'workouts':
                        currentValue = remainingSessions
                            .filter(s => s.completed && s.session_date >= weekStartStr)
                            .length;
                        break;
                }

                // Update goal progress in database
                const { error: updateError } = await supabase
                    .from('user_goals')
                    .update({ progress_value: currentValue })
                    .eq('goal_id', goal.goal.id)
                    .eq('user_id', user?.id);

                if (updateError) {
                    console.error('Error updating goal progress:', updateError);
                } else {
                    // Update local state with new progress
                    setGoals(prevGoals => prevGoals.map(g => {
                        if (g.goal.id === goal.goal.id) {
                            return {
                                ...g,
                                progress_value: currentValue
                            };
                        }
                        return g;
                    }));
                }
            }
        } catch (err) {
            console.error('Error in handleDeleteSession:', err);
            alert('Failed to delete session. Please try again.');
        }
    };

    if (loading) return <div>Loading your dashboard…</div>


    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const sessionsToday = sessions.filter(s => s.session_date === todayStr && s.completed).length
    const stepsToday = sessions.filter(s => s.session_date === todayStr && s.completed).length * 1000 // placeholder
    const caloriesBurned = sessions
        .filter(s => s.session_date === todayStr && s.completed)
        .reduce((sum, s) => sum + (s.duration_minutes ?? 0) * 8, 0) // placeholder MET
    const activeMins = sessions
        .filter(s => s.session_date === todayStr && s.completed)
        .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0)
    const distanceKm = (activeMins / 60) * 5 // placeholder

    // Calculate goal progress based on the goal type
    const calculateGoalProgress = () => {
        if (goals.length === 0) return 0;

        const goal = goals[0];
        const goalType = goal.goal.unit;
        let currentValue = 0;

        // Get current week's start date (Sunday)
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekStartStr = weekStart.toISOString().split('T')[0];

        // Calculate weekly totals based on goal type
        switch (goalType) {
            case 'calories':
                currentValue = sessions
                    .filter(s => s.completed && s.session_date >= weekStartStr)
                    .reduce((sum, s) => sum + (s.duration_minutes ?? 0) * 8, 0);
                break;
            case 'minutes':
                currentValue = sessions
                    .filter(s => s.completed && s.session_date >= weekStartStr)
                    .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
                break;
            case 'km':
                currentValue = (sessions
                    .filter(s => s.completed && s.session_date >= weekStartStr)
                    .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) / 60) * 5;
                break;
            case 'workouts':
                currentValue = sessions
                    .filter(s => s.completed && s.session_date >= weekStartStr)
                    .length;
                break;
            default:
                currentValue = 0;
        }

        // Update the progress value in user_goals
        if (goal.progress_value !== currentValue) {
            supabase
                .from('user_goals')
                .update({ progress_value: currentValue })
                .eq('goal_id', goal.goal.id)
                .eq('user_id', user?.id)
                .then(({ error }) => {
                    if (error) {
                        console.error('Error updating goal progress:', error);
                    }
                });
        }

        // Cap the progress at 100%
        return Math.min(Math.round((currentValue / goal.goal.target_value) * 100), 100);
    };

    const weeklyGoalProgress = calculateGoalProgress();
    const isGoalCompleted = weeklyGoalProgress >= 100;

    // Get all unique session dates as YYYY-MM-DD strings
    const uniqueSessionDates = Array.from(
        new Set(sessions.filter(s => s.completed).map(s => s.session_date))
    ).sort((a, b) => b.localeCompare(a)); // Descending

    let streak = 0;
    let current = new Date();
    for (let i = 0; i < uniqueSessionDates.length; i++) {
        const dateStr = current.toISOString().slice(0, 10);
        if (uniqueSessionDates.includes(dateStr)) {
            streak++;
            // Move to previous day
            current.setDate(current.getDate() - 1);
        } else {
            break;
        }
    }
    const streakDays = streak;

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <SpotlightCard className="p-6 rounded-xl">
                <div className="flex flex-col md:flex-row justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">
                            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!
                        </h3>
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
                                    <span className="text-2xl font-bold">{streakDays} days</span>
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
                        <p className="text-slate-300">Sessions Today</p>
                        <p className="text-2xl font-bold mt-1">{sessionsToday}</p>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="p-6 rounded-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-teal-500/20 mx-auto flex items-center justify-center mb-3">
                            <Activity className="w-6 h-6 text-teal-400" />
                        </div>
                        <p className="text-slate-300">Approx. Calories</p>
                        <p className="text-2xl font-bold mt-1">{caloriesBurned.toLocaleString()}</p>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="p-6 rounded-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-3">
                            <Clock className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-slate-300">Active Minutes</p>
                        <p className="text-2xl font-bold mt-1">{activeMins}</p>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="p-6 rounded-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 mx-auto flex items-center justify-center mb-3">
                            <Activity className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="text-slate-300">Distance</p>
                        <p className="text-2xl font-bold mt-1">{distanceKm.toFixed(1)} km</p>
                    </div>
                </SpotlightCard>
            </div>

            {/* Weekly Goal Progress */}
            <SpotlightCard className="p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Weekly Goal Progress</h3>
                        <p className="text-sm text-slate-400">Track your weekly fitness goals</p>
                    </div>
                    <button
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        onClick={() => {
                            setEditingGoal(true);
                            setGoalInput(goals[0]?.goal.target_value || '');
                            setGoalUnit(goals[0]?.goal.unit || '');
                            setGoalId(goals[0]?.goal.id || null);
                        }}
                    >
                        {goals.length > 0 ? 'Edit Goal' : 'Set Goal'}
                    </button>
                </div>

                {goals.length > 0 ? (
                    <>
                        <div className="w-full bg-slate-700/50 rounded-full h-4 mb-2 overflow-hidden">
                            <div
                                className={`h-4 rounded-full transition-all duration-500 ${isGoalCompleted
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-400 animate-pulse'
                                    : 'bg-gradient-to-r from-blue-500 to-teal-400'
                                    }`}
                                style={{ width: `${weeklyGoalProgress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className={`${isGoalCompleted ? 'text-green-400' : 'text-slate-300'}`}>
                                {isGoalCompleted ? 'Goal Completed! 🎉' : `${weeklyGoalProgress}% complete`}
                            </span>
                            <span className="text-slate-300">
                                {(() => {
                                    const goal = goals[0];
                                    const goalType = goal.goal.unit;
                                    let currentValue = 0;

                                    // Get current week's start date (Sunday)
                                    const today = new Date();
                                    const weekStart = new Date(today);
                                    weekStart.setDate(today.getDate() - today.getDay());
                                    weekStart.setHours(0, 0, 0, 0);
                                    const weekStartStr = weekStart.toISOString().split('T')[0];

                                    // Calculate weekly totals based on goal type
                                    switch (goalType) {
                                        case 'calories':
                                            currentValue = sessions
                                                .filter(s => s.completed && s.session_date >= weekStartStr)
                                                .reduce((sum, s) => sum + (s.duration_minutes ?? 0) * 8, 0);
                                            break;
                                        case 'minutes':
                                            currentValue = sessions
                                                .filter(s => s.completed && s.session_date >= weekStartStr)
                                                .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
                                            break;
                                        case 'km':
                                            currentValue = (sessions
                                                .filter(s => s.completed && s.session_date >= weekStartStr)
                                                .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) / 60) * 5;
                                            break;
                                        case 'workouts':
                                            currentValue = sessions
                                                .filter(s => s.completed && s.session_date >= weekStartStr)
                                                .length;
                                            break;
                                        default:
                                            currentValue = 0;
                                    }

                                    return `${currentValue} / ${goal.goal.target_value} ${goal.goal.unit}`;
                                })()}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <p>No goal set yet. Click "Set Goal" to create your first fitness goal!</p>
                    </div>
                )}
            </SpotlightCard>

            {/* Goal Edit Modal */}
            {editingGoal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-semibold mb-4">Set Your Weekly Goal</h3>
                        <form
                            className="space-y-4"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!goalId) {
                                    // Log user authentication status
                                    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
                                    console.log('Current user:', currentUser);
                                    console.log('User error:', userError);

                                    if (!currentUser) {
                                        alert('You must be logged in to create a goal');
                                        return;
                                    }

                                    // First, check if user already has a weekly goal
                                    const { data: existingGoals, error: checkError } = await supabase
                                        .from('user_goals')
                                        .select('goal:goals(id, name, target_value, unit)')
                                        .eq('user_id', currentUser.id)
                                        .eq('goals.name', 'Weekly Goal');

                                    if (checkError) {
                                        console.error('Error checking existing goals:', checkError);
                                        alert('Error checking existing goals');
                                        return;
                                    }

                                    if (existingGoals && existingGoals.length > 0) {
                                        // Update existing goal
                                        const existingGoal = existingGoals[0].goal as unknown as Goal;
                                        const { error: updateError } = await supabase
                                            .from('goals')
                                            .update({
                                                target_value: Number(goalInput),
                                                unit: goalUnit
                                            })
                                            .eq('id', existingGoal.id);

                                        if (updateError) {
                                            console.error('Goal update error:', updateError);
                                            alert('Failed to update goal: ' + updateError.message);
                                            return;
                                        }

                                        // Update progress value in user_goals
                                        const { error: userGoalError } = await supabase
                                            .from('user_goals')
                                            .update({ progress_value: 0 })
                                            .eq('goal_id', existingGoal.id)
                                            .eq('user_id', currentUser.id);

                                        if (userGoalError) {
                                            console.error('User goal update error:', userGoalError);
                                            alert('Failed to update user goal: ' + userGoalError.message);
                                            return;
                                        }

                                        // Update local state instead of reloading
                                        setGoals(prevGoals => prevGoals.map(g => {
                                            if (g.goal.id === existingGoal.id) {
                                                return {
                                                    ...g,
                                                    goal: {
                                                        ...g.goal,
                                                        target_value: Number(goalInput),
                                                        unit: goalUnit
                                                    },
                                                    progress_value: 0
                                                };
                                            }
                                            return g;
                                        }));
                                    } else {
                                        // Create new goal with a unique name
                                        const uniqueName = `Weekly Goal ${new Date().toISOString().slice(0, 10)}`;
                                        console.log('Creating goal with data:', {
                                            name: uniqueName,
                                            target_value: Number(goalInput),
                                            unit: goalUnit
                                        });

                                        const { data: newGoal, error: createError } = await supabase
                                            .from('goals')
                                            .insert({
                                                name: uniqueName,
                                                target_value: Number(goalInput),
                                                unit: goalUnit
                                            })
                                            .select()
                                            .single();

                                        if (createError) {
                                            console.error('Goal creation error:', createError);
                                            console.error('Error details:', {
                                                code: createError.code,
                                                message: createError.message,
                                                details: createError.details,
                                                hint: createError.hint
                                            });
                                            alert('Failed to create goal: ' + createError.message);
                                            return;
                                        }

                                        console.log('Goal created successfully:', newGoal);

                                        // Create user_goal entry
                                        console.log('Creating user_goal with data:', {
                                            user_id: currentUser.id,
                                            goal_id: newGoal.id,
                                            progress_value: 0
                                        });

                                        const { error: userGoalError } = await supabase
                                            .from('user_goals')
                                            .insert({
                                                user_id: currentUser.id,
                                                goal_id: newGoal.id,
                                                progress_value: 0
                                            });

                                        if (userGoalError) {
                                            console.error('User goal creation error:', userGoalError);
                                            console.error('Error details:', {
                                                code: userGoalError.code,
                                                message: userGoalError.message,
                                                details: userGoalError.details,
                                                hint: userGoalError.hint
                                            });
                                            alert('Failed to link goal to user: ' + userGoalError.message);
                                            return;
                                        }

                                        // Update local state with new goal
                                        setGoals(prevGoals => [...prevGoals, {
                                            progress_value: 0,
                                            goal: newGoal as Goal
                                        }]);
                                    }
                                } else {
                                    // Update existing goal
                                    const { error } = await supabase
                                        .from('goals')
                                        .update({
                                            target_value: Number(goalInput),
                                            unit: goalUnit
                                        })
                                        .eq('id', goalId);

                                    if (error) {
                                        console.error('Goal update error:', error);
                                        alert('Failed to update goal: ' + error.message);
                                        return;
                                    }
                                }

                                setEditingGoal(false);
                                await fetchAll();
                            }}
                        >
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    Target Value
                                </label>
                                <input
                                    type="number"
                                    value={goalInput}
                                    onChange={e => setGoalInput(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
                                    min="0"
                                    step="any"
                                    required
                                    placeholder="Enter your target value"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    Unit
                                </label>
                                <select
                                    value={goalUnit}
                                    onChange={e => setGoalUnit(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
                                    required
                                >
                                    <option value="">Select a unit</option>
                                    <option value="workouts">Workouts</option>
                                    <option value="minutes">Minutes</option>
                                    <option value="km">Kilometers</option>
                                    <option value="calories">Calories</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                    onClick={() => setEditingGoal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    {goalId ? 'Update Goal' : 'Create Goal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Your Connections */}
            <SpotlightCard className="p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Your Connections</h3>
                    <button className="text-sm text-blue-400 hover:text-blue-300">Find Friends</button>
                </div>
                <div className="space-y-4">
                    {friends.map(f => (
                        <div
                            key={f.id}
                            className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center">
                                {f.first_name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{`${f.first_name} ${f.last_name}`}</p>
                                <p className="text-sm text-slate-400">Active now</p>
                            </div>
                            <button className="p-2 rounded-full hover:bg-slate-700/50">
                                <MessageCircle className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </SpotlightCard>

            <SpotlightCard className="p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Add Workout Session</h3>
                <SessionButton
                    onAddSession={handleAddSession}
                    todaySessionsCount={sessionsToday}
                    todayActiveMinutes={activeMins}
                    onSessionAdded={fetchAll}
                />
            </SpotlightCard>
        </div>

    )
}