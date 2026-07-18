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
                    <div className="w-8 h-8 bg-success-light dark:bg-success/30 rounded-lg flex items-center justify-center animate-pulse border border-success dark:border-success/50">
                        <Smartphone className="text-success dark:text-success" size={16} />
                    </div>
                );
            case 'success':
                return <CheckCircle2 className="text-success" size={18} />;
            case 'warning':
                return <AlertCircle className="text-warning" size={18} />;
            case 'info':
                return <Calendar className="text-info" size={18} />;
            default:
                return <Bell className="text-muted" size={18} />;
        }
    };



    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/15 hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="إظهار الإشعارات"
                aria-expanded={isOpen}
                aria-controls="notification-panel"
            >
                <Bell size={24} className={cn(isChatPage ? "text-main dark:text-main" : "text-on-primary", unreadCount > 0 ? "animate-pulse drop-shadow-[0_0_8px_rgb(0_0_0_/_0.3)] dark:drop-shadow-[0_0_8px_rgb(255_255_255_/_0.4)]" : "")} />
                {notificationsEnabled && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -start-0.5 min-w-[20px] h-5 px-1 bg-error rounded-full text-on-error text-micro font-bold flex items-center justify-center border-2 border-white dark:border-border shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div id="notification-panel" className="fixed md:absolute inset-x-2 md:inset-auto top-[70px] md:top-full md:end-0 md:mt-3 w-auto md:w-[400px] bg-card border-2 border-border rounded-none shadow-[0_20px_50px_rgb(0_0_0_/_0.3)] z-[10000] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="absolute -top-[10px] end-4 md:end-8 w-4 h-4 bg-card border-t-2 border-e-2 border-border rotate-45 hidden md:block" />
                    
                    {/* Header */}

                    <div className="p-4 border-b-2 border-border flex items-center justify-between bg-surface">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-none flex items-center justify-center text-on-primary shadow-[2px_2px_0_black]">
                                <Bell size={16} />
                            </div>
                            <h3 className="font-medium text-xs uppercase tracking-widest text-main">الإشعارات</h3>
                            {unreadCount > 0 && (
                                <span className="bg-error text-on-error text-micro font-medium px-2 py-0.5 shadow-[1px_1px_0_black]">
                                    {unreadCount} مـهـم
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-micro sm:text-xs text-primary hover:text-primary font-medium dark:text-primary whitespace-nowrap"
                                >
                                    تحديد الكل
                                </button>
                            )}
                            {Array.isArray(notifications) && notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-micro sm:text-xs text-error hover:text-error font-medium dark:text-error whitespace-nowrap"
                                >
                                    حذف الكل
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Push Notification Activation Prompt */}
                    {Notification.permission !== 'granted' && (
                        <div className="p-3 bg-primary-soft border-b border-primary dark:bg-primary-active/20 dark:border-primary/30 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary rounded-lg text-on-primary">
                                    <Smartphone size={14} />
                                </div>
                                <p className="text-micro sm:text-xs font-normal text-primary dark:text-primary">هل تريد ميزة الإشعارات الفورية؟</p>
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
                                className="bg-primary text-on-primary text-micro font-medium px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors shadow-soft"
                            >
                                تفعيل الآن
                            </button>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="max-h-[70vh] md:max-h-96 overflow-y-auto custom-scrollbar">
                        {!notificationsEnabled ? (
                            <div className="p-12 text-center">
                                <AlertCircle size={48} className="mx-auto mb-3 text-warning opacity-50" />
                                <p className="text-sm font-normal text-main mb-1">الإشعارات معطلة</p>
                                <p className="text-xs text-muted dark:text-muted">يمكنك تفعيلها من صفحة الإعدادات</p>
                            </div>
                        ) : (Array.isArray(notifications) && notifications.length > 0) ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-border dark:border-border hover:bg-surface dark:hover:bg-card/50 transition-none cursor-pointer ${!notification.read ? 'bg-info-light/50 dark:bg-info/10' : ''
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
                                                <h4 className="font-normal text-xs sm:text-sm text-main">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="w-1.5 h-1.5 bg-info rounded-full flex-shrink-0 mt-1"></div>
                                                )}
                                            </div>
                                            <p className="text-micro sm:text-xs text-muted dark:text-muted mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-micro sm:text-xs text-muted dark:text-muted">
                                                    {formatDistanceToNow(new Date(notification.time), { addSuffix: true, locale: ar })}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="text-muted hover:text-error transition-none"
                                                    aria-label="حذف"
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
                                <Bell size={48} className="mx-auto mb-3 text-dim dark:text-main" />
                                <p className="text-sm text-muted dark:text-muted">لا توجد إشعارات</p>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};
