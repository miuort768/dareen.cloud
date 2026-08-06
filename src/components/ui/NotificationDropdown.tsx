import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsEnabled, useCurrentUser, useShowNotification } from '../../context/AppContext';
import { Bell, CheckCircle2, AlertCircle, Calendar, Trash2, Smartphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

export const NotificationDropdown = ({ showLabel = false }: { showLabel?: boolean }) => {
    const notificationsEnabled = useNotificationsEnabled();
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const lastNotifIdRef = useRef<string | null>(null);

    const { data: notifications = [] } = useQuery<Notification[]>({
        queryKey: ['notifications', currentUser?.id],
        queryFn: async () => {
            const data = await api.get<Notification[]>(`/notifications?receiverId=${currentUser?.id}`);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!currentUser,
        refetchInterval: 3000,
        refetchIntervalInBackground: true,
    });

    // Detect NEW unread notifications to show toast
    useEffect(() => {
        if (!notificationsEnabled || notifications.length === 0) return;

        const latestNotif = notifications[0];
        if (!latestNotif.read && latestNotif.id !== lastNotifIdRef.current) {
            if (lastNotifIdRef.current !== null) {
                showNotification(`إشعار جديد: ${latestNotif.title}`, 'info');
            }
            lastNotifIdRef.current = latestNotif.id;
        }
    }, [notifications, notificationsEnabled, showNotification]);

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

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => api.put(`/notifications/${id}`, { read: true }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/notifications/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const clearAllMutation = useMutation({
        mutationFn: () => api.delete(`/notifications?receiverId=${currentUser?.id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const markAsRead = (id: string) => {
        markAsReadMutation.mutate(id);
    };

    const markAllAsRead = () => {
        if (!Array.isArray(notifications)) return;
        for (const n of notifications.filter(n => !n.read)) {
            markAsReadMutation.mutate(n.id);
        }
    };

    const deleteNotification = (id: string) => {
        deleteMutation.mutate(id);
    };

    const clearAll = () => {
        clearAllMutation.mutate();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'live':
                return (
                    <div className="w-8 h-8 bg-success-light dark:bg-success/30 rounded-lg flex items-center justify-center animate-pulse border border-success dark:border-success/50">
                        <Smartphone className="text-success" size={16} />
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
                className={cn(
                    "relative flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg transition-all duration-200",
                    "text-muted hover:text-main hover:bg-accent/10"
                )}
                aria-label="إظهار الإشعارات"
                aria-expanded={isOpen}
                aria-controls="notification-panel"
            >
                <Bell size={16} className={cn(unreadCount > 0 ? "animate-pulse" : "")} style={unreadCount > 0 ? { filter: 'var(--drop-shadow-bell)' } : undefined} />
                {showLabel && <span className="text-xs font-medium hidden sm:inline">الإشعارات</span>}
                {notificationsEnabled && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -start-0.5 min-w-[20px] h-5 px-1 bg-error rounded-full text-on-error text-micro font-bold flex items-center justify-center border-2 border-surface shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div id="notification-panel" className="fixed md:absolute inset-x-2 md:inset-auto top-[70px] md:top-full md:end-0 md:mt-3 w-auto md:w-[400px] bg-card border-2 border-border rounded-none shadow-[var(--shadow-panel)] z-[200] animate-in fade-in slide-in-from-top-2 duration-300">
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
                                    className="text-micro sm:text-xs text-primary hover:text-primary font-medium whitespace-nowrap"
                                >
                                    تحديد الكل
                                </button>
                            )}
                            {Array.isArray(notifications) && notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-micro sm:text-xs text-error hover:text-error font-medium whitespace-nowrap"
                                >
                                    حذف الكل
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Push Notification Activation Prompt */}
                    {Notification.permission !== 'granted' && (
                        <div className="p-3 bg-primary-soft border-b border-primary dark:border-primary/30 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary rounded-lg text-on-primary">
                                    <Smartphone size={14} />
                                </div>
                                <p className="text-micro sm:text-xs font-normal text-primary">هل تريد ميزة الإشعارات الفورية؟</p>
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
                                <p className="text-xs text-muted">يمكنك تفعيلها من صفحة الإعدادات</p>
                            </div>
                        ) : (Array.isArray(notifications) && notifications.length > 0) ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-border hover:bg-surface dark:hover:bg-card/50 transition-none cursor-pointer ${!notification.read ? 'bg-info-light/50 dark:bg-info/10' : ''
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
                                            <p className="text-micro sm:text-xs text-muted mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-micro sm:text-xs text-muted">
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
                                <p className="text-sm text-muted">لا توجد إشعارات</p>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};
