'use client'

import React, { useState } from 'react';
import SpotlightCard from '@/app/ui/spotlightcard';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Users, X, Check, Accessibility } from 'lucide-react';

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: new Date(),
        time: '',
        type: 'workout',
        location: '',
        participants: 0
    });


    // Mock events data
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Morning Run",
            date: new Date(2025, 3, 14), // April 14, 2025
            time: "07:00 AM",
            type: "workout",
            location: "Central Park",
            participants: 0
        },
        {
            id: 2,
            title: "5K Community Run",
            date: new Date(2025, 3, 16), // April 16, 2025
            time: "08:00 AM",
            type: "event",
            location: "Downtown Marathon Track",
            participants: 24
        },
        {
            id: 3,
            title: "HIIT Class",
            date: new Date(2025, 3, 17), // April 17, 2025
            time: "06:30 PM",
            type: "class",
            location: "Elite Fitness Center",
            participants: 12
        },
        {
            id: 4,
            title: "Weekly Weigh-in",
            date: new Date(2025, 3, 18), // April 18, 2025
            time: "09:00 AM",
            type: "personal",
            location: "Home",
            participants: 0
        }
    ]);

    // Calendar helper functions
    const getDaysInMonth = (date: any) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: any) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getPreviousDays = (date: any) => {
        const firstDay = getFirstDayOfMonth(date);
        const prevMonthDays = [];

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
        const currentDays = [];

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
        const nextDays = [];

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

    const renderCalendar = () => {
        const prevDays = getPreviousDays(currentMonth);
        const currentDays = getCurrentDays(currentMonth);
        const nextDays = getNextDays(currentMonth);

        const allDays = [...prevDays, ...currentDays, ...nextDays];

        // Group days into weeks
        const weeks = [];
        for (let i = 0; i < allDays.length; i += 7) {
            weeks.push(allDays.slice(i, i + 7));
        }

        return weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                    // Check if this day has events
                    const dayEvents = events.filter(
                        event =>
                            event.date.getDate() === day.date.getDate() &&
                            event.date.getMonth() === day.date.getMonth() &&
                            event.date.getFullYear() === day.date.getFullYear()
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

                            {dayEvents.length > 0 && (
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            className={`text-xs p-1 truncate rounded ${event.type === 'workout' ? 'bg-green-500/20 text-green-300' :
                                                event.type === 'event' ? 'bg-blue-500/20 text-blue-300' :
                                                    event.type === 'class' ? 'bg-purple-500/20 text-purple-300' :
                                                        'bg-orange-500/20 text-orange-300'
                                                }`}
                                        >
                                            {event.title}
                                        </div>
                                    ))}

                                    {dayEvents.length > 2 && (
                                        <div className="text-xs text-blue-400">
                                            +{dayEvents.length - 2} more
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

    // Get events for selected date
    const selectedDateEvents = events.filter(
        event =>
            event.date.getDate() === selectedDate.getDate() &&
            event.date.getMonth() === selectedDate.getMonth() &&
            event.date.getFullYear() === selectedDate.getFullYear()
    );

    // Handle form input changes
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setNewEvent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle adding a new event
    const handleAddEvent = () => {
        // Create a new event
        const event = {
            ...newEvent,
            id: events.length + 1,
            date: selectedDate
        };

        // Add event to events array
        setEvents([...events, event]);

        // Close modal and reset form
        setShowAddEventModal(false);
        setNewEvent({
            title: '',
            date: new Date(),
            time: '',
            type: 'workout',
            location: '',
            participants: 0
        });
    };

    // Handle event deletion
    const handleDeleteEvent = (id: any) => {
        setEvents(events.filter(event => event.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Fitness Calendar</h1>
                <button
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-400 text-gray-900 px-4 py-2 rounded-lg"
                    onClick={() => setShowAddEventModal(true)}
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Event</span>
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

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-4 border-t border-slate-700/50 pt-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500/70 mr-2"></div>
                                <span className="text-sm">Workout</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500/70 mr-2"></div>
                                <span className="text-sm">Event</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-purple-500/70 mr-2"></div>
                                <span className="text-sm">Class</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-orange-500/70 mr-2"></div>
                                <span className="text-sm">Personal</span>
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

                        {selectedDateEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateEvents.map(event => (
                                    <div key={event.id} className="bg-slate-800/30 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-medium">{event.title}</h3>
                                            <div className={`text-xs px-2 py-1 rounded ${event.type === 'workout' ? 'bg-green-500/20 text-green-300' :
                                                event.type === 'event' ? 'bg-blue-500/20 text-blue-300' :
                                                    event.type === 'class' ? 'bg-purple-500/20 text-purple-300' :
                                                        'bg-orange-500/20 text-orange-300'
                                                }`}>
                                                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center text-slate-300">
                                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                                <span>{event.time}</span>
                                            </div>

                                            <div className="flex items-center text-slate-300">
                                                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                                <span>{event.location}</span>
                                            </div>

                                            {event.participants > 0 && (
                                                <div className="flex items-center text-slate-300">
                                                    <Users className="w-4 h-4 mr-2 text-slate-400" />
                                                    <span>{event.participants} participants</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex space-x-2">
                                            <button className="px-3 py-1 text-sm bg-slate-700/50 rounded-md hover:bg-slate-600/50">
                                                Edit
                                            </button>
                                            <button
                                                className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30"
                                                onClick={() => handleDeleteEvent(event.id)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="bg-slate-800/30 rounded-lg p-6">
                                    <p className="text-slate-400 mb-4">No events scheduled for this day.</p>
                                    <button
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
                                        onClick={() => setShowAddEventModal(true)}
                                    >
                                        Add Event
                                    </button>
                                </div>
                            </div>
                        )}
                    </SpotlightCard>

                    {/* Upcoming Events Preview */}
                    <SpotlightCard className="p-6 rounded-xl mt-6">
                        <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>

                        <div className="space-y-3">
                            {events
                                .filter(event => event.date >= new Date())
                                .sort((a, b) => a.date.getTime() - b.date.getTime())
                                .slice(0, 3)
                                .map(event => (
                                    <div key={event.id} className="flex items-center space-x-3 bg-slate-800/30 p-3 rounded-lg">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${event.type === 'workout' ? 'bg-green-500/20' :
                                                event.type === 'event' ? 'bg-blue-500/20' :
                                                    event.type === 'class' ? 'bg-purple-500/20' :
                                                        'bg-orange-500/20'}`}
                                        >
                                            {event.type === 'workout' ? <Accessibility className="w-5 h-5 text-green-400" /> :
                                                event.type === 'event' ? <Users className="w-5 h-5 text-blue-400" /> :
                                                    event.type === 'class' ? <Users className="w-5 h-5 text-purple-400" /> :
                                                        <CalendarIcon className="w-5 h-5 text-orange-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{event.title}</p>
                                            <p className="text-sm text-slate-400">
                                                {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {event.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                            {events.filter(event => event.date >= new Date()).length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-slate-400">No upcoming events scheduled.</p>
                                </div>
                            )}

                            {events.filter(event => event.date >= new Date()).length > 3 && (
                                <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm mt-2">
                                    View all upcoming events
                                </button>
                            )}
                        </div>
                    </SpotlightCard>
                </div>
            </div>

            {/* Add Event Modal */}
            {showAddEventModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add New Event</h2>
                            <button
                                className="text-slate-400 hover:text-white"
                                onClick={() => setShowAddEventModal(false)}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    name="title"
                                    value={newEvent.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Event title"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <div className="text-slate-300 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
                                        {selectedDate.toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Time</label>
                                    <input
                                        name="time"
                                        value={newEvent.time}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 07:30 AM"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    name="type"
                                    value={newEvent.type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="workout">Workout</option>
                                    <option value="event">Event</option>
                                    <option value="class">Class</option>
                                    <option value="personal">Personal</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Location</label>
                                <input
                                    name="location"
                                    value={newEvent.location}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Event location"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Participants (for group activities)</label>
                                <input
                                    name="participants"
                                    type="number"
                                    value={newEvent.participants}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                                    onClick={handleAddEvent}
                                    disabled={!newEvent.title || !newEvent.time}
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Add Event
                                </button>
                                <button
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg"
                                    onClick={() => setShowAddEventModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}