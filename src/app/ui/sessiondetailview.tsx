'use client'

import React, { useState, useEffect } from 'react';
import { Activity, ArrowLeft, Award, ChevronDown, ChevronUp, Clock, Dumbbell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface SessionDetailProps {
    sessionId: string;
    onBack: () => void;
}

interface Exercise {
    id: string;
    name: string;
    description: string;
    primary_muscle: string;
}

interface SessionExercise {
    workout_session_id: string;
    exercise_id: string;
    sets: number;
    reps_per_set: number;
    weight: number;
    exercise_order: number;
    exercise?: Exercise;  // Joined data
}

interface WorkoutSession {
    id: string;
    user_id: string;
    session_date: string;
    duration_minutes: number;
    notes: string;
    created_at: string;
    exercises: SessionExercise[];
}

const SessionDetailView: React.FC<SessionDetailProps> = ({ sessionId, onBack }) => {
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedMuscleGroups, setExpandedMuscleGroups] = useState<Record<string, boolean>>({});

    // Initialize Supabase client
    const supabase = createClient();

    useEffect(() => {
        const fetchSessionDetails = async () => {
            try {
                setLoading(true);

                // Fetch the session details
                const { data: sessionData, error: sessionError } = await supabase
                    .from('workout_sessions')
                    .select('*')
                    .eq('id', sessionId)
                    .single();

                if (sessionError || !sessionData) {
                    console.error('Error fetching session:', sessionError);
                    setLoading(false);
                    return;
                }

                // Fetch the exercises for this session
                const { data: exercisesData, error: exercisesError } = await supabase
                    .from('workout_session_exercises')
                    .select('*')
                    .eq('workout_session_id', sessionId);

                if (exercisesError) {
                    console.error('Error fetching session exercises:', exercisesError);
                    setLoading(false);
                    return;
                }

                // If we have exercises, fetch their details
                if (exercisesData && exercisesData.length > 0) {
                    // Extract all exercise IDs
                    const exerciseIds = exercisesData.map(ex => ex.exercise_id);

                    // Fetch exercise details
                    const { data: exerciseDetails, error: detailsError } = await supabase
                        .from('exercises')
                        .select('*')
                        .in('id', exerciseIds);

                    if (detailsError) {
                        console.error('Error fetching exercise details:', detailsError);
                    } else if (exerciseDetails) {
                        // Join exercise details with session exercises
                        const enrichedExercises = exercisesData.map(sessionExercise => ({
                            ...sessionExercise,
                            exercise: exerciseDetails.find(ex => ex.id === sessionExercise.exercise_id)
                        }));

                        // Initialize expanded state for each muscle group
                        const muscleGroups: Record<string, boolean> = {};
                        exerciseDetails.forEach(ex => {
                            if (ex.primary_muscle && !muscleGroups[ex.primary_muscle]) {
                                muscleGroups[ex.primary_muscle] = true; // Default to expanded
                            }
                        });
                        setExpandedMuscleGroups(muscleGroups);

                        // Set the complete session data
                        setSession({
                            ...sessionData,
                            exercises: enrichedExercises
                        });
                    }
                } else {
                    // No exercises, just set the session data
                    setSession({
                        ...sessionData,
                        exercises: []
                    });
                }

                setLoading(false);
            } catch (error) {
                console.error('Error in fetchSessionDetails:', error);
                setLoading(false);
            }
        };

        fetchSessionDetails();
    }, [sessionId, supabase]);

    const toggleMuscleGroup = (muscle: string) => {
        setExpandedMuscleGroups(prev => ({
            ...prev,
            [muscle]: !prev[muscle]
        }));
    };

    // Group exercises by muscle
    const getExercisesByMuscle = () => {
        if (!session || !session.exercises) return {};

        const grouped: Record<string, SessionExercise[]> = {};

        session.exercises.forEach(ex => {
            if (ex.exercise?.primary_muscle) {
                const muscle = ex.exercise.primary_muscle;
                if (!grouped[muscle]) {
                    grouped[muscle] = [];
                }
                grouped[muscle].push(ex);
            }
        });

        return grouped;
    };

    // Calculate total volume (sets * reps * weight)
    const calculateTotalVolume = () => {
        if (!session || !session.exercises) return 0;

        return session.exercises.reduce((total, ex) => {
            return total + (ex.sets * ex.reps_per_set * (ex.weight || 0));
        }, 0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="bg-slate-800 rounded-xl p-6 text-center">
                <p className="text-slate-300">Session not found or an error occurred.</p>
                <button
                    onClick={onBack}
                    className="mt-4 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center justify-center gap-2 mx-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go Back</span>
                </button>
            </div>
        );
    }

    // Known exercise IDs from your database
    const knownExerciseIds = {
        'Calf Raise': '060c00fa-68bf-4162-9cd1-2eff753c65a0',
        'Tricep Dip': '23c43fd3-ea20-4c66-bb3d-1ac665154ad6',
        'Bicep Curl': '257db6ee-3ace-4267-a985-f0efb27c2f08',
        'Lunge': '380e728c-f4de-47d4-85be-545368ea4c90',
        'Deadlift': '41f6b095-a43d-44f2-8b7a-28944d9604ab',
        'Lat Pulldown': '4721a289-c49a-4997-b273-713bf9788cac',
        'Overhead Press': '573dd9dd-e1cb-43eb-9d79-051779277ba6',
        'Chest Fly': '8319a1e4-d983-4f83-8a78-6918932d1249',
        'Squat': '88f6d1ac-e5b6-4ec1-b5a2-477921d079b2',
        'Bent-Over Row': '8b06a8e2-648d-4bab-8e86-07dd3b9dff7f',
        'Plank': '9f99dbf5-a746-43fa-9157-75da5a70cfd8',
        'Pull-Up': 'badd5d9e-334b-4947-8185-d3e0955fef76',
        'Bench Press': 'c95db049-eb7e-4e70-95fb-46033fb8a3a3',
        'Push-Up': 'd5a08f90-01d9-4a55-ac23-ff41452c21c',
        'Leg Press': 'f9508707-e99e-4f90-8dc7-fbed63b4ca2d'
    };

    const exercisesByMuscle = getExercisesByMuscle();
    const totalVolume = calculateTotalVolume();
    const sessionDate = new Date(session.session_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                <button
                    onClick={onBack}
                    className="mb-3 px-3 py-1 bg-blue-500/30 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-500/50 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to all sessions</span>
                </button>

                <h2 className="text-xl font-bold">{sessionDate}</h2>

                <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration_minutes} minutes</span>
                    </div>

                    <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full text-sm">
                        <Dumbbell className="w-4 h-4" />
                        <span>{session.exercises.length} exercises</span>
                    </div>

                    <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full text-sm">
                        <Activity className="w-4 h-4" />
                        <span>{totalVolume.toLocaleString()} lbs total volume</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {session.notes && (
                    <div className="mb-6 bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Session Notes</h3>
                        <p className="text-slate-300">{session.notes}</p>
                    </div>
                )}

                {/* Exercises by muscle group */}
                <div className="space-y-4">
                    {Object.keys(exercisesByMuscle).length > 0 ? (
                        Object.entries(exercisesByMuscle).map(([muscle, exercises]) => (
                            <div key={muscle} className="border border-slate-700 rounded-lg overflow-hidden">
                                <button
                                    className="w-full flex justify-between items-center p-3 bg-slate-700/50 text-left"
                                    onClick={() => toggleMuscleGroup(muscle)}
                                >
                                    <div className="font-medium capitalize">{muscle}</div>
                                    <div>
                                        {expandedMuscleGroups[muscle] ? (
                                            <ChevronUp className="w-5 h-5 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                        )}
                                    </div>
                                </button>

                                {expandedMuscleGroups[muscle] && (
                                    <div className="divide-y divide-slate-700/50">
                                        {exercises.map((exercise) => (
                                            <div key={exercise.exercise_id} className="p-3">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-semibold">{exercise.exercise?.name}</h4>
                                                    {exercise.weight > 0 && (
                                                        <div className="text-sm text-blue-400 font-semibold">
                                                            {exercise.weight} lbs
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-4 mt-2 text-sm text-slate-400">
                                                    <div>{exercise.sets} sets</div>
                                                    <div>{exercise.reps_per_set} reps</div>
                                                    {exercise.weight > 0 && (
                                                        <div>{(exercise.sets * exercise.reps_per_set * exercise.weight).toLocaleString()} lbs volume</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-slate-400">
                            <p>No exercises recorded for this session.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionDetailView;