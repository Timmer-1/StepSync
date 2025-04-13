'use client'

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Star, User, FileText, Calendar, Settings, Filter } from 'lucide-react';
import GridBackground from '@/app/ui/background';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Mock notification data
const mockNotifications = [
    {
        id: 1,
        type: 'mention',
        content: 'Sarah mentioned you in a comment: "Great job on that workout yesterday @username!"',
        timestamp: '2h ago',
        read: false,
        action: '/dashboard/social'
    },
    {
        id: 2,
        type: 'achievement',
        content: 'You\'ve unlocked the "Early Bird" badge by completing 5 workouts before 8 AM!',
        timestamp: '1d ago',
        read: false,
        action: '/dashboard/achievements'
    },
    {
        id: 3,
        type: 'challenge',
        content: 'New Challenge: "Spring Step-Up" starts tomorrow. Join now to compete with friends!',
        timestamp: '2d ago',
        read: true,
        action: '/dashboard/challenges'
    },
    {
        id: 4,
        type: 'friend',
        content: 'Mike Johnson accepted your friend request. You can now share workout stats!',
        timestamp: '3d ago',
        read: true,
        action: '/dashboard/social'
    },
    {
        id: 5,
        type: 'system',
        content: 'Your monthly fitness report is ready to view. See your progress for April!',
        timestamp: '1w ago',
        read: true,
        action: '/dashboard/reports'
    },
    {
        id: 6,
        type: 'event',
        content: 'Reminder: You signed up for "Community 5K Run" happening this Saturday at 9 AM.',
        timestamp: '1w ago',
        read: false,
        action: '/dashboard/calendar'
    }
];

type Notification = {
    id: number;
    type: string;
    content: string;
    timestamp: string;
    read: boolean;
    action: string;
};

type FilterOptions = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = useState<FilterOptions>('all');
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check if user is authenticated
        async function getUserData() {
            setLoading(true);
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                router.push('/auth/login');
                return;
            }

            setUserData(user);
            setLoading(false);
        }

        getUserData();

        // In a real application, you would fetch notifications from your API here
    }, [router]);

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true;
    });

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(notification => notification.id !== id));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    };

    const deleteAllNotifications = () => {
        setNotifications([]);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'mention':
                return <User className="w-5 h-5 text-blue-400" />;
            case 'achievement':
                return <Star className="w-5 h-5 text-yellow-400" />;
            case 'challenge':
                return <Bell className="w-5 h-5 text-purple-400" />;
            case 'friend':
                return <User className="w-5 h-5 text-green-400" />;
            case 'system':
                return <Settings className="w-5 h-5 text-gray-400" />;
            case 'event':
                return <Calendar className="w-5 h-5 text-red-400" />;
            default:
                return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    if (loading) {
        return (
            <GridBackground>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
                </div>
            </GridBackground>
        );
    }

    return (
        <GridBackground>
            <div className="min-h-screen max-w-4xl mx-auto p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Bell className="w-6 h-6 text-green-400" />
                            Notifications
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <select
                                    className="appearance-none bg-slate-800/80 border border-slate-600 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as FilterOptions)}
                                >
                                    <option value="all">All</option>
                                    <option value="unread">Unread</option>
                                    <option value="read">Read</option>
                                </select>
                                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <button
                                onClick={markAllAsRead}
                                className="text-sm px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-gray-200 flex items-center gap-1"
                            >
                                <Check className="w-4 h-4" /> Mark all read
                            </button>
                            <button
                                onClick={deleteAllNotifications}
                                className="text-sm px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-gray-200 flex items-center gap-1"
                            >
                                <Trash2 className="w-4 h-4" /> Clear all
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-2">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg border transition-colors ${notification.read
                                        ? 'bg-slate-800/30 border-slate-700/50'
                                        : 'bg-slate-800/50 border-slate-600'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-700/50 p-2 rounded-lg">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between">
                                                <Link
                                                    href={notification.action}
                                                    className="text-md font-medium hover:text-green-400 transition-colors"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    {notification.content}
                                                </Link>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {notification.timestamp}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-700/80 text-gray-300"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-1.5 rounded-lg hover:bg-slate-700/80 text-gray-300"
                                                title="Delete notification"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-300 mb-2">No notifications</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    You don't have any notifications at the moment. We'll notify you when there's activity related to your account.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Page Navigation */}
                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/dashboard"
                            className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </GridBackground>
    );
}