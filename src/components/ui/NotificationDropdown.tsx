import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
    time: string;
    read: boolean;
    conversationId?: string;
}

export const NotificationDropdown = () => {
    const { notificationsEnabled, currentUser, showNotification } = useApp();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const lastNotifIdRef = useRef<string | null>(null);

    // Fetch notifications from server
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            return;
        }

        const fetchNotifications = async () => {
            try {
                const data = await api.get<Notification[]>(`/notifications?receiverId=${currentUser.id}`);

                if (Array.isArray(data)) {
                    // Detect NEW unread notifications to show toast
                    if (data.length > 0) {
                        const latestNotif = data[0];
                        if (!latestNotif.read && latestNotif.id !== lastNotifIdRef.current) {
                            // Only show toast if it's actually new and unread
                            if (lastNotifIdRef.current !== null) {
                                showNotification(`إشعار جديد: ${latestNotif.title}`, 'info');
                            }
                            lastNotifIdRef.current = latestNotif.id;
                        }
                    }
                    setNotifications(data);
                } else {
                    setNotifications([]);
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        };

        fetchNotifications();

        // Refresh every 3 seconds for a more real-time feel
        const intervalId = setInterval(fetchNotifications, 3000);

        return () => clearInterval(intervalId);
    }, [currentUser, showNotification]);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}`, { read: true });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!Array.isArray(notifications)) return;
        for (const n of notifications.filter(n => !n.read)) {
            markAsRead(n.id);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const clearAll = async () => {
        try {
            await api.delete(`/notifications?receiverId=${currentUser?.id}`);
            setNotifications([]);
        } catch (err) {
            console.error('Failed to clear notifications:', err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'warning':
                return <AlertCircle className="text-amber-500" size={18} />;
            case 'info':
                return <Calendar className="text-blue-500" size={18} />;
            default:
                return <Bell className="text-gray-500" size={18} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 transition-colors dark:hover:bg-gray-800 dark:text-gray-400"
            >
                <Bell size={20} />
                {notificationsEnabled && unreadCount > 0 && (
                    <span className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-96 bg-white border border-gray-200 rounded-none shadow-xl dark:bg-gray-900 dark:border-gray-700 animate-in slide-in-from-top-4 z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-indigo-600" />
                            <h3 className="font-bold text-gray-900 dark:text-white">الإشعارات</h3>
                            {unreadCount > 0 && (
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
                                    {unreadCount} جديد
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold dark:text-indigo-400"
                                >
                                    تحديد الكل كمقروء
                                </button>
                            )}
                            {Array.isArray(notifications) && notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-red-600 hover:text-red-700 font-bold dark:text-red-400"
                                >
                                    حذف الكل
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {!notificationsEnabled ? (
                            <div className="p-12 text-center">
                                <AlertCircle size={48} className="mx-auto mb-3 text-amber-500 opacity-50" />
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">الإشعارات معطلة</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">يمكنك تفعيلها من صفحة الإعدادات</p>
                            </div>
                        ) : (Array.isArray(notifications) && notifications.length > 0) ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        if (notification.conversationId) {
                                            navigate(`/chat?conversationId=${notification.conversationId}`);
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {notification.time}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Bell size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد إشعارات</p>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};
