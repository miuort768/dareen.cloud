import { useState, useEffect } from 'react';
import { Bell, ListTodo, Phone, X, ShieldAlert } from 'lucide-react';
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

    const notifications: NotificationItem[] = [
        ...(Array.isArray(lowBalanceStudents) ? lowBalanceStudents.map(s => ({
            id: `lb-${s.id}-${s.subject}`,
            type: 'low_balance',
            title: `${s.studentName}`,
            description: `باقي ${s.remainingSessions} حِصص في ${s.subject}`,
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
            description: `استحقاق: ${t.dueDate}`,
            priority: 'high' as const,
            link: '/tasks',
            actionLabel: 'عرض',
            icon: ListTodo,
            color: 'amber'
        })) : [])
    ].sort((a, _) => (a.priority === 'high' ? -1 : 1)) as NotificationItem[];

    const visibleNotifications = Array.isArray(notifications)
        ? notifications.filter(n => !dismissedIds.includes(n.id))
        : [];

    return (
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-500/20">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">غرفة التنبيهات</h3>
                        <p className="text-sm font-medium text-gray-400">إجراءات حرجة مطلوبة</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-sm text-slate-400">
                    {visibleNotifications.length}
                </div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                {visibleNotifications.length > 0 ? (
                    visibleNotifications.map((note) => (
                        <div key={note.id} className="p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 group relative">
                            <button
                                onClick={() => handleDismiss(note.id)}
                                className="absolute top-4 left-4 text-slate-300 hover:text-rose-500 transition-colors p-2"
                            >
                                <X size={16} />
                            </button>
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl border transition-all duration-500",
                                    note.color === 'rose' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                )}>
                                    <note.icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1 line-clamp-1 pr-6">
                                        {note.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3">{note.description}</p>

                                    <div className="flex items-center gap-2">
                                        {'action' in note && note.action ? (
                                            <button
                                                onClick={note.action}
                                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors"
                                            >
                                                {note.actionLabel}
                                            </button>
                                        ) : 'link' in note && note.link ? (
                                            <Link
                                                to={note.link}
                                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors"
                                            >
                                                {note.actionLabel}
                                            </Link>
                                        ) : null}
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full animate-pulse",
                                            note.priority === 'high' ? "bg-rose-500" : "bg-amber-500"
                                        )}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <Bell size={32} className="text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-400">غرفة التنبيهات نظيفة حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
};
