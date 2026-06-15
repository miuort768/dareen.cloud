import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotificationsEnabled, useCurrentUser, useShowNotification } from '../../context/AppContext';
import { Bell, CheckCircle2, AlertCircle, Calendar, Trash2, Smartphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
    time: string;
    read: boolean;
    conversationId?: string;
    link?: string;
}

export const NotificationDropdown = () => {
    const notificationsEnabled = useNotificationsEnabled();
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const isChatPage = location.pathname === '/chat' || location.pathname.startsWith('/chat/');
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

        const startPolling = () => window.setInterval(fetchNotifications, 3000);
        const stopPolling = (id: number) => clearInterval(id);

        fetchNotifications();
        let intervalId = startPolling();

        const onVisibilityChange = () => {
            if (document.hidden) {
                stopPolling(intervalId);
            } else {
                fetchNotifications();
                intervalId = startPolling();
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            stopPolling(intervalId);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
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
            case 'live':
                return (
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center animate-pulse border border-emerald-200 dark:border-emerald-800/50">
                        <Smartphone className="text-emerald-600 dark:text-emerald-400" size={16} />
                    </div>
                );
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
                className="relative w-10 h-10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/15 hover:scale-110 active:scale-95 transition-all duration-200"
            >
                <Bell size={24} className={cn(isChatPage ? "text-[#111b21] dark:text-[#e9edef]" : "text-white", unreadCount > 0 ? "animate-pulse drop-shadow-[0_0_8px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "")} />
                {notificationsEnabled && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-red-600 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed md:absolute inset-x-2 md:inset-auto top-[70px] md:top-full md:left-0 md:mt-3 w-auto md:w-[400px] bg-white/95 dark:bg-slate-900/98  border-2 border-slate-900 dark:border-slate-800 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[10000] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="absolute -top-[10px] left-4 md:left-8 w-4 h-4 bg-white dark:bg-slate-900 border-t-2 border-l-2 border-slate-900 dark:border-slate-800 rotate-45 hidden md:block" />
                    
                    {/* Header */}

                    <div className="p-4 border-b-2 border-slate-900 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-none flex items-center justify-center text-white shadow-[2px_2px_0_rgba(0,0,0,1)]">
                                <Bell size={16} />
                            </div>
                            <h3 className="font-medium text-xs uppercase tracking-widest text-slate-900 dark:text-white">الإشعارات</h3>
                            {unreadCount > 0 && (
                                <span className="bg-rose-500 text-white text-[9px] font-medium px-2 py-0.5 shadow-[1px_1px_0_rgba(0,0,0,1)]">
                                    {unreadCount} مـهـم
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400 whitespace-nowrap"
                                >
                                    تحديد الكل
                                </button>
                            )}
                            {Array.isArray(notifications) && notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-[10px] sm:text-xs text-red-600 hover:text-red-700 font-medium dark:text-red-400 whitespace-nowrap"
                                >
                                    حذف الكل
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Push Notification Activation Prompt */}
                    {Notification.permission !== 'granted' && (
                        <div className="p-3 bg-indigo-50 border-b border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                                    <Smartphone size={14} />
                                </div>
                                <p className="text-[10px] sm:text-xs font-normal text-indigo-900 dark:text-indigo-300">هل تريد ميزة الإشعارات الفورية؟</p>
                            </div>
                            <button
                                onClick={async () => {
                                    const { pushService } = await import('../../services/pushService');
                                    const permission = await Notification.requestPermission();
                                    if (permission === 'granted' && currentUser) {
                                        await pushService.subscribeUser();
                                        showNotification('تم تفعيل التنبيهات الفورية بنجاح', 'success');
                                    }
                                }}
                                className="bg-indigo-600 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                تفعيل الآن
                            </button>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="max-h-[70vh] md:max-h-96 overflow-y-auto custom-scrollbar">
                        {!notificationsEnabled ? (
                            <div className="p-12 text-center">
                                <AlertCircle size={48} className="mx-auto mb-3 text-amber-500 opacity-50" />
                                <p className="text-sm font-normal text-gray-900 dark:text-white mb-1">الإشعارات معطلة</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">يمكنك تفعيلها من صفحة الإعدادات</p>
                            </div>
                        ) : (Array.isArray(notifications) && notifications.length > 0) ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-none cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        if (notification.link) {
                                            navigate(notification.link);
                                            setIsOpen(false);
                                        } else if (notification.conversationId) {
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
                                                <h4 className="font-normal text-[11px] sm:text-sm text-gray-900 dark:text-white">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                                                )}
                                            </div>
                                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[9px] sm:text-xs text-gray-400 dark:text-gray-500">
                                                    {formatDistanceToNow(new Date(notification.time), { addSuffix: true, locale: ar })}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-none"
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
