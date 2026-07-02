import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, ListTodo, Phone, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import type { DashboardTask as Task, LowBalanceStudent } from '../types';
import { api } from '../../../lib/api';
import { useAdminPhone } from '../../../context/AppContext';

interface ImportantNotificationsProps {
    tasks: Task[];
    lowBalanceStudents: LowBalanceStudent[];
}

interface BaseNotification {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionLabel: string;
    icon: LucideIcon;
    color: string;
}

interface ActionNotification extends BaseNotification {
    action: () => void;
    link?: never;
}

interface LinkNotification extends BaseNotification {
    link: string;
    action?: never;
}

type NotificationItem = ActionNotification | LinkNotification;

export const ImportantNotifications = ({
    tasks,
    lowBalanceStudents,
}: ImportantNotificationsProps) => {
    const adminPhone = useAdminPhone();
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchDismissed = async () => {
            try {
                const data = await api.get<string[]>('/system/dismissed-notifications');
                if (Array.isArray(data)) {
                    setDismissedIds(data);
                }
            } catch (e) {
                console.error('Failed to fetch dismissed notifications', e);
            }
        };
        fetchDismissed();
    }, []);

    const handleDismiss = async (id: string) => {
        try {
            await api.post('/system/dismissed-notifications', { id });
            setDismissedIds(prev => [...prev, id]);
        } catch (e) {
            console.error('Failed to dismiss notification', e);
        }
    };

    const notifications: NotificationItem[] = [
        ...(Array.isArray(lowBalanceStudents) ? lowBalanceStudents.map(s => ({
            id: `lb-${s.id}-${s.subject}`,
            type: 'low_balance',
            title: `${s.studentName}`,
            description: `${s.remainingSessions} حِصص - ${s.subject}`,
            priority: (s.remainingSessions === 0 ? 'high' : 'medium') as 'high' | 'medium',
            action: () => sendWhatsAppReminder(s, undefined, adminPhone),
            actionLabel: 'واتساب',
            icon: Phone,
            color: 'rose'
        })) : []),
        ...(Array.isArray(tasks) ? tasks.filter(t =>
            ['high', 'عالية', 'urgent', 'عاجل'].includes(t.priority?.toLowerCase())
        ).map(t => ({
            id: `task-${t.id}`,
            type: 'task',
            title: `${t.title}`,
            description: `تاريخ: ${t.dueDate}`,
            priority: 'high' as const,
            link: '/tasks',
            actionLabel: 'عرض',
            icon: ListTodo,
            color: 'amber'
        })) : [])
    ].sort((a) => (a.priority === 'high' ? -1 : 1)) as NotificationItem[];

    const visibleNotifications = Array.isArray(notifications)
        ? notifications.filter(n => !dismissedIds.includes(n.id))
        : [];

    return (
        <div className="bg-white dark:bg-primary-active/50 border border-border dark:border-border p-5 shadow-sm rounded-none flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border dark:border-border">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-on-primary rounded-none flex items-center justify-center border border-border shadow-none">
                        <Bell size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-normal text-main dark:text-on-primary uppercase tracking-tight">غرفة التنبيهات</h3>
                    </div>
                </div>
                <div className="text-[10px] font-medium text-muted border border-border dark:border-border px-2 py-0.5">
                    {visibleNotifications.length} حرجة
                </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {visibleNotifications.length > 0 ? (
                    visibleNotifications.map((note) => (
                        <div key={note.id} className="p-3 bg-background/50 dark:bg-primary-active/30 rounded-none border border-border dark:border-border transition-all hover:bg-white flex items-center gap-3 group relative">
                            <div className={cn(
                                "w-8 h-8 shrink-0 flex items-center justify-center rounded-none border",
                                note.color === 'rose' ? "bg-error-light text-error border-error" : "bg-warning-light text-warning border-warning"
                            )}>
                                <note.icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-normal text-main dark:text-on-primary text-[11px] mb-1 truncate pr-4">
                                    {note.title}
                                </h4>
                                <p className="text-[9px] text-muted dark:text-muted leading-none">{note.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {'action' in note && note.action ? (
                                    <button onClick={note.action} className="text-[9px] font-normal text-primary border border-primary px-2 py-1 hover:bg-primary-soft">
                                        {note.actionLabel}
                                    </button>
                                ) : 'link' in note && note.link ? (
                                    <Link to={note.link} className="text-[9px] font-normal text-primary border border-primary px-2 py-1 hover:bg-primary-soft">
                                        {note.actionLabel}
                                    </Link>
                                ) : null}
                                <button onClick={() => handleDismiss(note.id)} className="text-dim hover:text-error p-1">
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center border border-dashed border-border">
                        <p className="text-[10px] font-normal text-muted">لا توجد تنبيهات نشطة</p>
                    </div>
                )}
            </div>
        </div>
    );
};
