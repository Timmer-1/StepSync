'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TrendingUp, Clock, Activity, MessageCircle } from 'lucide-react';
import SpotlightCard from '@/app/ui/spotlightcard';
import SessionButton from '@/app/ui/sessionbutton';

export default function DashboardOverview() {
    const [user, setUser] = useState<{ id: string; email: string; first_name: string } | null>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [goals, setGoals] = useState<any[]>([])
    const [friends, setFriends] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const [session, setSession] = useState<any>(null)

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
                    .select('id, session_date, duration_minutes')
                    .eq('user_id', authUser.id)
                    .order('session_date', { ascending: false }),
                supabase
                    .from('user_goals')
                    .select('progress_value, goal:goals ( name, target_value, unit )')
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
            setGoals(goalsResponse.data || [])
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
                console.log('Creating session exercises:', sessionInput.exercises)
                const { error: exercisesError } = await supabase
                    .from('session_exercises')
                    .insert(
                        sessionInput.exercises.map(exercise => ({
                            session_id: createdSession.id,
                            exercise_id: exercise.exercise_id,
                            sets: exercise.sets,
                            reps_per_set: exercise.reps_per_set,
                            weight: exercise.weight
                        }))
                    )

                if (exercisesError) {
                    console.error('Exercises creation error:', exercisesError)
                    throw exercisesError
                }

                console.log('Session exercises created successfully')
            }

            // Refresh sessions to update the UI
            await fetchAll()
            console.log('Dashboard data refreshed')
        } catch (err) {
            console.error('Add session error:', err)
            throw err // Re-throw to let the UI handle the error
        }
    }

    if (loading) return <div>Loading your dashboard…</div>


    const todayStr = new Date().toISOString().slice(0, 10)
    const sessionsToday = sessions.filter(s => s.session_date === todayStr).length
    const stepsToday = sessions.filter(s => s.session_date === todayStr).length * 1000 // placeholder
    const caloriesBurned = sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0) * 8, 0) // placeholder MET
    const activeMins = sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0)
    const distanceKm = (activeMins / 60) * 5 // placeholder
    const weeklyGoalProgress =
        goals.length > 0
            ? Math.round((goals[0].progress_value / goals[0].goal.target_value) * 100)
            : 0
    const streakDays = sessions.length

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
                <h3 className="text-lg font-semibold mb-4">Weekly Goal Progress</h3>
                <div className="w-full bg-slate-700/50 rounded-full h-4 mb-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-teal-400 h-4 rounded-full"
                        style={{ width: `${weeklyGoalProgress}%` }}
                    />
                </div>
                <div className="flex justify-between text-sm">
                    <span>{weeklyGoalProgress}% complete</span>
                    <span>
                        Goal: {goals[0]?.goal.target_value} {goals[0]?.goal.unit}
                    </span>
                </div>
            </SpotlightCard>

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