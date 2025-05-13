import React, { useRef } from 'react';
import { X, Check, Clock, Calendar, Activity, Trash2 } from 'lucide-react';
import SpotlightCard from './spotlightcard';

interface WorkoutDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    workout: {
        id: number;
        session_date: string;
        duration_minutes: number;
        notes: string | null;
        completed: boolean;
    } | null;
    onToggleComplete: (id: number, currentStatus: boolean) => void;
    onDelete?: (id: number) => void;
}

export default function WorkoutDetailsModal({ isOpen, onClose, workout, onToggleComplete, onDelete }: WorkoutDetailsModalProps) {
    const justCompleted = useRef(false);
    if (!isOpen || !workout) return null;

    const formattedDate = new Date(workout.session_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const caloriesBurned = workout.duration_minutes * 8; // Using same MET calculation as dashboard

    const handleToggleComplete = () => {
        if (!workout.completed) {
            onToggleComplete(workout.id, workout.completed);
            onClose();
        } else {
            onToggleComplete(workout.id, workout.completed);
        }
    };

    const handleDelete = async () => {
        onDelete?.(workout.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-2xl font-bold">Workout Details</h2>
                </div>

                {/* Action Buttons */}
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={handleToggleComplete}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${workout.completed
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                            }`}
                    >
                        {workout.completed ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Completed</span>
                            </>
                        ) : (
                            <>
                                <Activity className="w-4 h-4" />
                                <span>Mark as Complete</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Session</span>
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <SpotlightCard className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Date</p>
                                    <p className="font-medium">{formattedDate}</p>
                                </div>
                            </div>
                        </SpotlightCard>

                        <SpotlightCard className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Duration</p>
                                    <p className="font-medium">{workout.duration_minutes} minutes</p>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>

                    {/* Calories Card */}
                    <SpotlightCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Calories Burned</p>
                                <p className="font-medium">{caloriesBurned.toLocaleString()} cal</p>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* Notes Section */}
                    {workout.notes && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Notes</h3>
                            <SpotlightCard className="p-4">
                                <p className="text-gray-300 whitespace-pre-wrap">{workout.notes}</p>
                            </SpotlightCard>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 