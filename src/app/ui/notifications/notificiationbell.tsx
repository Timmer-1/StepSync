'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, Star, User, FileText, Calendar, Settings } from 'lucide-react';
import NotificationModal from './notificationmodal'; // Import the modal
import { Notification } from './notificationslist'; // Import the type

// Mock data - in a real app, fetch this
const mockNotifications: Notification[] = [
    { id: 1, type: 'mention', content: 'Sarah mentioned you: "Great job @username!"', timestamp: '2h ago', read: false, action: '/dashboard/social' },
    { id: 2, type: 'achievement', content: 'Unlocked "Early Bird" badge!', timestamp: '1d ago', read: false, action: '/dashboard/achievements' },
    { id: 3, type: 'challenge', content: 'New Challenge: "Spring Step-Up" starts tomorrow.', timestamp: '2d ago', read: true, action: '/dashboard/challenges' },
    { id: 4, type: 'friend', content: 'Mike Johnson accepted your friend request.', timestamp: '3d ago', read: true, action: '/dashboard/social' },
    { id: 5, type: 'system', content: 'Your monthly fitness report is ready.', timestamp: '1w ago', read: true, action: '/dashboard/reports' },
    { id: 6, type: 'event', content: 'Reminder: "Community 5K Run" this Saturday.', timestamp: '1w ago', read: false, action: '/dashboard/calendar' }
];

type FilterOptions = 'all' | 'unread' | 'read';

export default function NotificationBell() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<FilterOptions>('all');
    const [loading, setLoading] = useState(true); // To simulate initial fetch

    // Simulate fetching notifications on mount
    useEffect(() => {
        // Replace with actual API call
        setLoading(true);
        setTimeout(() => {
            setNotifications(mockNotifications);
            setLoading(false);
        }, 500); // Simulate network delay
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const markAsRead = useCallback((id: number) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
        // Add API call here to update status on the backend
    }, []);

    const deleteNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Add API call here
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        // Add API call here
    }, []);

    const deleteAllNotifications = useCallback(() => {
        setNotifications([]);
        // Add API call here
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close modal if Escape key is pressed
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCloseModal();
            }
        };
        if (isModalOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isModalOpen]);


    return (
        <div className="relative">
            <button
                onClick={handleOpenModal}
                className="relative p-2 rounded-full hover:bg-slate-700/80 text-gray-300 hover:text-gray-100 transition-colors"
                aria-label={`Notifications (${unreadCount} unread)`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] leading-tight text-center ring-2 ring-slate-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <NotificationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                notifications={notifications}
                filter={filter}
                onFilterChange={setFilter}
                onMarkAsRead={markAsRead}
                onDeleteNotification={deleteNotification}
                onMarkAllRead={markAllAsRead}
                onDeleteAll={deleteAllNotifications}
            />
        </div>
    );
}