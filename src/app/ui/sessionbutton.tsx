'use client'

import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, Calendar, MessageSquare, X, Dumbbell } from 'lucide-react';

interface Exercise {
    id: string;
    name: string;
    description: string;
    primary_muscle: string;
}

interface SessionExercise {
    exercise_id: string;
    sets: number;
    reps_per_set: number;
    weight: number;
}

interface SessionButtonProps {
    onAddSession: (sessionData: {
        newDate: string;
        newDuration: number;
        newNotes: string;
        exercises: SessionExercise[];
    }) => void;
    todaySessionsCount: number;
    todayActiveMinutes: number;
    onSessionAdded: (duration: number) => void;
}

const SessionButton: React.FC<SessionButtonProps> = ({
    onAddSession,
    todaySessionsCount,
    todayActiveMinutes,
    onSessionAdded
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newDuration, setNewDuration] = useState<number>(0);
    const [newNotes, setNewNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<SessionExercise[]>([]);

    // Set today's date as default when form opens
    useEffect(() => {
        if (isFormOpen) {
            const today = new Date().toISOString().split('T')[0];
            setNewDate(today);
        }
    }, [isFormOpen]);

    // Fetch exercises from database
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                // In a real app, you would fetch this from your Supabase database
                // For this implementation, we're using the actual exercise IDs you provided
                const exercisesData: Exercise[] = [
                    { id: '88f6d1ac-e5b6-4ec1-b5a2-477921d079b2', name: 'Squat', description: 'Barbell back squat targeting quadriceps, glutes, and hamstrings', primary_muscle: 'quads' },
                    { id: '41f6b095-a43d-44f2-8b7a-28944d9604ab', name: 'Deadlift', description: 'Conventional deadlift working posterior chain: hamstrings, glutes, back', primary_muscle: 'hamstrings' },
                    { id: 'c95db049-eb7e-4e70-95fb-46033fb8a3a3', name: 'Bench Press', description: 'Barbell bench press for chest, shoulders, and triceps', primary_muscle: 'chest' },
                    { id: '573dd9dd-e1cb-43eb-9d79-051779277ba6', name: 'Overhead Press', description: 'Standing barbell press pressing overhead to work shoulders and triceps', primary_muscle: 'shoulders' },
                    { id: 'badd5d9e-334b-4947-8185-d3e0955fef76', name: 'Pull-Up', description: 'Bodyweight pull-up for lats, biceps, and upper back', primary_muscle: 'lats' },
                    { id: 'd5a08f90-01d9-4a55-ac23-ff41452c21c', name: 'Push-Up', description: 'Bodyweight push-up for chest, shoulders, and triceps', primary_muscle: 'chest' },
                    { id: '8b06a8e2-648d-4bab-8e86-07dd3b9dff7f', name: 'Bent-Over Row', description: 'Barbell row hinging at hips to target mid-back and biceps', primary_muscle: 'back' },
                    { id: '380e728c-f4de-47d4-85be-545368ea4c90', name: 'Lunge', description: 'Split stance lunge to work quads, glutes, and balance', primary_muscle: 'quads' },
                    { id: 'f9508707-e99e-4f90-8dc7-fbed63b4ca2d', name: 'Leg Press', description: 'Machine leg press for quads and glutes', primary_muscle: 'quads' },
                    { id: '4721a289-c49a-4997-b273-713bf9788cac', name: 'Lat Pulldown', description: 'Cable lat pulldown for lats and upper back', primary_muscle: 'lats' },
                    { id: '257db6ee-3ace-4267-a985-f0efb27c2f08', name: 'Bicep Curl', description: 'Dumbbell curl isolating the biceps', primary_muscle: 'biceps' },
                    { id: '23c43fd3-ea20-4c66-bb3d-1ac665154ad6', name: 'Tricep Dip', description: 'Parallel-bar dip for triceps and chest', primary_muscle: 'triceps' },
                    { id: '060c00fa-68bf-4162-9cd1-2eff753c65a0', name: 'Calf Raise', description: 'Standing calf raise for gastrocnemius and soleus', primary_muscle: 'calves' },
                    { id: '9f99dbf5-a746-43fa-9157-75da5a70cfd8', name: 'Plank', description: 'Isometric core hold for abdominals and spinal stabilizers', primary_muscle: 'abs' },
                    { id: '8319a1e4-d983-4f83-8a78-6918932d1249', name: 'Chest Fly', description: 'Dumbbell or machine fly for chest isolation', primary_muscle: 'chest' }
                ];
                setExercises(exercisesData);
            } catch (error) {
                console.error('Error fetching exercises:', error);
            }
        };

        if (isFormOpen) {
            fetchExercises();
        }
    }, [isFormOpen]);

    const handleExerciseSelect = (exercise: Exercise) => {
        // Check if exercise is already selected
        const isAlreadySelected = selectedExercises.some(
            (selected) => selected.exercise_id === exercise.id
        );

        if (isAlreadySelected) {
            // Remove the exercise
            setSelectedExercises(
                selectedExercises.filter((selected) => selected.exercise_id !== exercise.id)
            );
        } else {
            // Add the exercise with default values
            setSelectedExercises([
                ...selectedExercises,
                {
                    exercise_id: exercise.id,
                    sets: 3,
                    reps_per_set: 10,
                    weight: 0
                }
            ]);
        }
    };

    const updateExerciseDetails = (
        exerciseId: string,
        field: 'sets' | 'reps_per_set' | 'weight',
        value: number
    ) => {
        setSelectedExercises(
            selectedExercises.map((exercise) =>
                exercise.exercise_id === exerciseId
                    ? { ...exercise, [field]: value }
                    : exercise
            )
        );
    };

    const handleFormSubmit = async () => {
        if (!newDate || newDuration <= 0) {
            alert('Please enter a valid date and duration');
            return;
        }

        setIsSubmitting(true);

        // Submit to parent component which handles the Supabase logic
        await onAddSession({
            newDate,
            newDuration,
            newNotes,
            exercises: selectedExercises
        });

        // Update today's stats
        onSessionAdded(newDuration);

        // Reset form
        setNewDate('');
        setNewDuration(0);
        setNewNotes('');
        setSelectedExercises([]);
        setIsFormOpen(false);
        setIsSubmitting(false);
    };

    const groupExercisesByMuscle = () => {
        const grouped: Record<string, Exercise[]> = {};

        exercises.forEach(exercise => {
            if (!grouped[exercise.primary_muscle]) {
                grouped[exercise.primary_muscle] = [];
            }
            grouped[exercise.primary_muscle].push(exercise);
        });

        return grouped;
    };

    return (
        <div className="relative">
            {!isFormOpen ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div>
                            <h3 className="text-lg font-medium">Today's Progress</h3>
                            <div className="flex gap-4 mt-2">
                                <div>
                                    <span className="text-sm text-slate-400">Sessions</span>
                                    <p className="text-2xl font-semibold text-blue-400">{todaySessionsCount}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-400">Active Minutes</span>
                                    <p className="text-2xl font-semibold text-green-400">{todayActiveMinutes}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="group relative w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-lg text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <PlusCircle className="w-5 h-5" />
                        <span>Add Workout Session</span>
                    </button>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700/50 shadow-xl p-5 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Add New Session</h3>
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="p-1 rounded-full hover:bg-slate-700/70 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm text-slate-300 mb-2" htmlFor="date">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                <span>Date</span>
                            </label>
                            <input
                                id="date"
                                type="date"
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                                className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm text-slate-300 mb-2" htmlFor="duration">
                                <Clock className="w-4 h-4 text-green-400" />
                                <span>Duration (minutes)</span>
                            </label>
                            <input
                                id="duration"
                                type="number"
                                min={1}
                                value={newDuration}
                                onChange={e => setNewDuration(Number(e.target.value))}
                                className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                                <Dumbbell className="w-4 h-4 text-orange-400" />
                                <span>Exercises</span>
                            </label>

                            <div className="max-h-48 overflow-y-auto pr-2 space-y-4">
                                {Object.entries(groupExercisesByMuscle()).map(([muscle, muscleExercises]) => (
                                    <div key={muscle} className="space-y-2">
                                        <h4 className="text-sm font-medium text-slate-300 capitalize">{muscle}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {muscleExercises.map(exercise => {
                                                const isSelected = selectedExercises.some(
                                                    selected => selected.exercise_id === exercise.id
                                                );
                                                return (
                                                    <button
                                                        key={exercise.id}
                                                        onClick={() => handleExerciseSelect(exercise)}
                                                        className={`text-left p-2 rounded text-sm transition-colors ${isSelected
                                                                ? 'bg-blue-500/30 border border-blue-500/50'
                                                                : 'bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                                                            }`}
                                                        title={exercise.description}
                                                    >
                                                        {exercise.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedExercises.length > 0 && (
                            <div className="border-t border-slate-700 pt-4 mt-4">
                                <h4 className="text-sm font-medium text-slate-300 mb-3">Exercise Details</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {selectedExercises.map(selectedExercise => {
                                        const exerciseDetails = exercises.find(ex => ex.id === selectedExercise.exercise_id);
                                        return (
                                            <div key={selectedExercise.exercise_id} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{exerciseDetails?.name}</span>
                                                    <button
                                                        onClick={() => handleExerciseSelect(exerciseDetails as Exercise)}
                                                        className="text-xs text-slate-400 hover:text-red-400"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="text-xs text-slate-400">Sets</label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={selectedExercise.sets}
                                                            onChange={e => updateExerciseDetails(
                                                                selectedExercise.exercise_id,
                                                                'sets',
                                                                Number(e.target.value)
                                                            )}
                                                            className="w-full p-1 text-sm rounded bg-slate-600 border border-slate-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400">Reps</label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={selectedExercise.reps_per_set}
                                                            onChange={e => updateExerciseDetails(
                                                                selectedExercise.exercise_id,
                                                                'reps_per_set',
                                                                Number(e.target.value)
                                                            )}
                                                            className="w-full p-1 text-sm rounded bg-slate-600 border border-slate-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400">Weight (lbs)</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={selectedExercise.weight}
                                                            onChange={e => updateExerciseDetails(
                                                                selectedExercise.exercise_id,
                                                                'weight',
                                                                Number(e.target.value)
                                                            )}
                                                            className="w-full p-1 text-sm rounded bg-slate-600 border border-slate-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="flex items-center gap-2 text-sm text-slate-300 mb-2" htmlFor="notes">
                                <MessageSquare className="w-4 h-4 text-purple-400" />
                                <span>Notes</span>
                            </label>
                            <textarea
                                id="notes"
                                value={newNotes}
                                onChange={e => setNewNotes(e.target.value)}
                                className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleFormSubmit}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 rounded-lg text-white font-medium shadow-md shadow-blue-500/20 hover:shadow-blue-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Session'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionButton;