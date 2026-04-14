import { useState, useEffect } from 'react';
import { Bell, AlertCircle, ListTodo, Phone, ArrowUpRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import type { DashboardTask as Task, LowBalanceStudent } from '../types';
import { api } from '../../../lib/api';
import { useApp } from '../../../context/AppContext';

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
    icon: any;
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
    const { adminPhone } = useApp();
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

    // Combine notifications
    const notifications: NotificationItem[] = [
        ...(Array.isArray(lowBalanceStudents) ? lowBalanceStudents.map(s => ({
            id: `lb - ${s.id} -${s.subject} `,
            type: 'low_balance',
            title: `رصيد منخفض: ${s.studentName} `,
            description: `المتبقي ${s.remainingSessions} حِصص في مادة ${s.subject} `,
            priority: (s.remainingSessions === 0 ? 'high' : 'medium') as 'high' | 'medium',
            action: () => sendWhatsAppReminder(s, undefined, adminPhone),
            actionLabel: 'تذكير واتساب',
            icon: Phone,
            color: 'rose'
        })) : []),
        ...(Array.isArray(tasks) ? tasks.filter(t =>
            ['high', 'عالية', 'urgent', 'عاجل'].includes(t.priority?.toLowerCase())
        ).map(t => ({
            id: `task - ${t.id} `,
            type: 'task',
            title: `مهمة عاجلة: ${t.title} `,
            description: `تاريخ الاستحقاق: ${t.dueDate} `,
            priority: 'high' as const,
            link: '/tasks',
            actionLabel: 'عرض المهام',
            icon: ListTodo,
            color: 'amber'
        })) : [])
    ].sort((a, _) => (a.priority === 'high' ? -1 : 1)) as NotificationItem[];

    const visibleNotifications = Array.isArray(notifications)
        ? notifications.filter(n => !dismissedIds.includes(n.id))
        : [];

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden relative group h-full">
            <div className="absolute top-0 right-0 w-1 h-full bg-primary-600"></div>
            <div className="p-4 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between bg-primary-50/20 dark:bg-primary-900/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-600 rounded-lg shadow-sm flex items-center justify-center">
                        <Bell size={14} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xs tracking-tight">التنبيهات الهامة</h3>
                        <p className="text-[9px] font-medium text-primary-600/70 uppercase tracking-tighter">تحتاج إلى انتباهك</p>
                    </div>
                </div>
                <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                    {visibleNotifications.length}
                </span>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-slate-800 h-[300px] overflow-y-auto custom-scrollbar">
                {visibleNotifications.length > 0 ? (
                    visibleNotifications.map((note) => (
                        <div key={note.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all group/item relative">
                            <button
                                onClick={() => handleDismiss(note.id)}
                                className="absolute top-2 left-2 text-gray-300 hover:text-rose-500 transition-colors p-1"
                                title="حذف"
                            >
                                <X size={14} />
                            </button>
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl shrink-0",
                                    note.color === 'rose' ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                                )}>
                                    <note.icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-[11px] leading-tight mb-1">
                                        {note.title}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 leading-normal">{note.description}</p>

                                    <div className="mt-2 text-left">
                                        {'action' in note && note.action ? (
                                            <button
                                                onClick={note.action}
                                                className="text-[10px] font-bold text-primary-600 hover:text-primary-700"
                                            >
                                                {note.actionLabel}
                                            </button>
                                        ) : 'link' in note && note.link ? (
                                            <Link
                                                to={note.link}
                                                className="text-[10px] font-bold text-primary-600 hover:text-primary-700"
                                            >
                                                {note.actionLabel}
                                            </Link>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-10 text-center">
                        <Bell size={24} className="text-gray-100 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-400 font-medium">لا توجد تنبيهات</p>
                    </div>
                )}
            </div>
        </div>
    );
};
