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
        ...(Array.isArray(tasks) ? tasks.filter(t => t.priority === 'high').map(t => ({
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
        <div className="bg-white border border-primary-200 dark:bg-gray-900 dark:border-gray-800 shadow-xl overflow-hidden relative group h-full">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary-600"></div>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-primary-50/30 dark:bg-primary-900/10">
                <div className="flex items-center gap-4">
                    <div className="relative p-2.5 bg-primary-600 shadow-lg shadow-primary-600/20 flex items-center justify-center">
                        <Bell size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-sm tracking-tight uppercase">الإشعارات والتنبيهات الهامة</h3>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest opacity-80">تحتاج إلى انتباهك الفوري</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="bg-rose-600 text-white px-3 py-1 text-[10px] font-black uppercase">
                        {visibleNotifications.length} تنبيه
                    </span>
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800 h-[240px] overflow-y-auto custom-scrollbar">
                {visibleNotifications.length > 0 ? (
                    visibleNotifications.map((note) => (
                        <div key={note.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group/item relative">
                            <button
                                onClick={() => handleDismiss(note.id)}
                                className="absolute top-4 left-4 text-gray-300 hover:text-rose-500 transition-colors p-1 opacity-100 sm:opacity-0 group-hover/item:opacity-100"
                                title="حذف الإشعار"
                            >
                                <X size={16} />
                            </button>
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-3 shrink-0",
                                    note.color === 'rose' ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                                )}>
                                    <note.icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-black text-gray-900 dark:text-white text-sm truncate uppercase tracking-tight text-right pl-6">
                                            {note.title}
                                        </h4>
                                        {note.priority === 'high' && (
                                            <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 uppercase animate-pulse shrink-0">
                                                <AlertCircle size={12} />
                                                عاجل
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 mt-1.5 text-right leading-relaxed">{note.description}</p>

                                    <div className="mt-4 flex justify-end gap-2">
                                        {'action' in note && note.action ? (
                                            <button
                                                onClick={note.action}
                                                className="flex items-center gap-1 text-xs font-black text-primary-600 hover:text-primary-700 uppercase"
                                            >
                                                {note.actionLabel}
                                                <ArrowUpRight size={14} />
                                            </button>
                                        ) : 'link' in note && note.link ? (
                                            <Link
                                                to={note.link}
                                                className="flex items-center gap-1 text-xs font-black text-primary-600 hover:text-primary-700 uppercase"
                                            >
                                                {note.actionLabel}
                                                <ArrowUpRight size={14} />
                                            </Link>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 mx-auto flex items-center justify-center mb-4">
                            <Bell size={32} className="text-gray-200" />
                        </div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest">لا توجد تنبيهات جديدة حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
};
