import React from 'react';
import { X } from 'lucide-react';
import SessionButton from './sessionbutton';

interface AddSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSession: (sessionData: {
        newDate: string;
        newDuration: number;
        newNotes: string;
        exercises: Array<{
            exercise_id: string;
            sets: number;
            reps_per_set: number;
            weight: number;
        }>;
    }) => void;
    todaySessionsCount: number;
    todayActiveMinutes: number;
    onSessionAdded: (duration: number) => void;
}

export default function AddSessionModal({
    isOpen,
    onClose,
    onAddSession,
    todaySessionsCount,
    todayActiveMinutes,
    onSessionAdded
}: AddSessionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Add Workout Session</h2>
                    <p className="text-slate-400 mt-1">Track your workout progress and exercises</p>
                </div>

                {/* Session Button Component */}
                <SessionButton
                    onAddSession={onAddSession}
                    todaySessionsCount={todaySessionsCount}
                    todayActiveMinutes={todayActiveMinutes}
                    onSessionAdded={(duration) => {
                        onSessionAdded(duration);
                        onClose();
                    }}
                />
            </div>
        </div>
    );
} 