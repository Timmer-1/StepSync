import React from 'react';
import { Bell, Check, Trash2, Filter, X, Star, User, FileText, Calendar, Settings } from 'lucide-react';
import NotificationsList, { Notification } from './notificationslist'; // Import the list component

type FilterOptions = 'all' | 'unread' | 'read';

type NotificationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    filter: FilterOptions;
    onFilterChange: (filter: FilterOptions) => void;
    onMarkAsRead: (id: number) => void;
    onDeleteNotification: (id: number) => void;
    onMarkAllRead: () => void;
    onDeleteAll: () => void;
};

// Keep the icon mapping logic, maybe move to a shared utils file later
const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'mention': return <User className="w-4 h-4 text-blue-400" />; // Smaller icons for modal
        case 'achievement': return <Star className="w-4 h-4 text-yellow-400" />;
        case 'challenge': return <Bell className="w-4 h-4 text-purple-400" />;
        case 'friend': return <User className="w-4 h-4 text-green-400" />;
        case 'system': return <Settings className="w-4 h-4 text-gray-400" />;
        case 'event': return <Calendar className="w-4 h-4 text-red-400" />;
        default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
};

export default function NotificationModal({
    isOpen,
    onClose,
    notifications,
    filter,
    onFilterChange,
    onMarkAsRead,
    onDeleteNotification,
    onMarkAllRead,
    onDeleteAll,
}: NotificationModalProps) {
    if (!isOpen) return null;

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true;
    });

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose} // Close modal on backdrop click
                aria-hidden="true"
            />

            {/* Modal Panel */}
            <div
                className="fixed top-16 right-4 md:right-8 w-full max-w-md bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="notification-modal-title"
            >
                <div className="p-4 border-b border-slate-700">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                        <h2 id="notification-modal-title" className="text-lg font-semibold flex items-center gap-2">
                            <Bell className="w-5 h-5 text-green-400" />
                            Notifications
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-slate-700 text-gray-400 hover:text-gray-200"
                            aria-label="Close notifications"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-between items-center gap-2">
                        <div className="relative">
                            <select
                                className="appearance-none bg-slate-800/80 border border-slate-600 rounded-md py-1.5 pl-3 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                                value={filter}
                                onChange={(e) => onFilterChange(e.target.value as FilterOptions)}
                            >
                                <option value="all">All</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onMarkAllRead}
                                className="text-xs px-2 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-md text-gray-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={filteredNotifications.filter(n => !n.read).length === 0} // Disable if no unread
                                title="Mark all visible as read"
                            >
                                <Check className="w-3.5 h-3.5" /> Mark all read
                            </button>
                            <button
                                onClick={onDeleteAll}
                                className="text-xs px-2 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-md text-gray-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={notifications.length === 0} // Disable if no notifications at all
                                title="Delete all notifications"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Clear all
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications List Area */}
                <div className="p-4">
                    <NotificationsList
                        notifications={filteredNotifications}
                        onMarkAsRead={onMarkAsRead}
                        onDeleteNotification={onDeleteNotification}
                        getNotificationIcon={getNotificationIcon}
                    />
                </div>
            </div>
        </>
    );
}