import React from 'react';
import Link from 'next/link';
import { Check, Trash2 } from 'lucide-react';

// Re-define Notification type here or import from a shared types file
export type Notification = {
    id: number;
    type: string;
    content: string;
    timestamp: string;
    read: boolean;
    action: string;
};

type NotificationsListProps = {
    notifications: Notification[];
    onMarkAsRead: (id: number) => void;
    onDeleteNotification: (id: number) => void;
    getNotificationIcon: (type: string) => React.ReactNode;
};

export default function NotificationsList({
    notifications,
    onMarkAsRead,
    onDeleteNotification,
    getNotificationIcon,
}: NotificationsListProps) {
    if (notifications.length === 0) {
        return (
            <div className="text-center py-8 px-4">
                <p className="text-sm text-gray-400">No notifications right now.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1"> {/* Added max-height and scroll */}
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors text-sm ${notification.read
                        ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50' // Slightly lighten on hover even if read
                        : 'bg-slate-800/60 border-slate-600 hover:bg-slate-700/80' // More pronounced hover for unread
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="bg-slate-700/50 p-1.5 rounded-md mt-0.5"> {/* Adjusted padding/margin */}
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <Link
                                href={notification.action}
                                className="font-medium hover:text-green-400 transition-colors block leading-snug"
                                onClick={() => onMarkAsRead(notification.id)} // Mark as read when clicked
                            >
                                {notification.content}
                            </Link>
                            <p className="text-xs text-gray-400 mt-1">
                                {notification.timestamp}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0"> {/* Reduced gap */}
                            {!notification.read && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent link navigation if clicking button
                                        onMarkAsRead(notification.id);
                                    }}
                                    className="p-1 rounded-md hover:bg-slate-600/80 text-gray-300"
                                    title="Mark as read"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent link navigation
                                    onDeleteNotification(notification.id);
                                }}
                                className="p-1 rounded-md hover:bg-slate-600/80 text-gray-300 hover:text-red-400"
                                title="Delete notification"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}