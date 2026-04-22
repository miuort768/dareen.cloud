import { useState, useMemo, useEffect } from 'react';
import { Bell, Zap, Phone, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import type { DashboardTask as Task, LowBalanceStudent } from '../types';

interface NotificationsCenterProps {
    tasks: Task[];
    lowBalanceStudents: LowBalanceStudent[];
    students: any[];
    sessions: any[];
    studentInvoices: any[];
}

type RoomAlertItem = {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    icon: any;
    color: string;
    actionLabel: string;
    action?: () => void;
    link?: string;
};

export const NotificationsCenter = ({
    tasks,
    lowBalanceStudents,
    students,
    sessions,
    studentInvoices,
}: NotificationsCenterProps) => {
    const { adminPhone } = useApp();
    const navigate = useNavigate();
    const [, setDismissedIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchDismissed = async () => {
            try {
                const data = await api.get<string[]>('/system/dismissed-notifications');
                if (Array.isArray(data)) setDismissedIds(data);
            } catch (e) {
                console.error('Failed to fetch dismissed notifications', e);
            }
        };
        fetchDismissed();
    }, []);

    // 1. Smart Alerts Logic
    const smartAlerts = useMemo(() => {
        const result: any[] = [];
        lowBalanceStudents.forEach(s => {
            if (s.remainingSessions <= 1) {
                result.push({
                    id: `low-${s.id}-${s.subject}`,
                    type: 'critical',
                    title: s.studentName,
                    desc: `${s.subject} : باقي ${s.remainingSessions === 0 ? 'صفر' : '1'}!`,
                    action: () => navigate('/students'),
                    color: 'red'
                });
            }
        });

        students.forEach(s => {
            const studentSessions = sessions.filter(ss => ss.studentId === s.id);
            if (studentSessions.length < 3) return;
            const absent = studentSessions.filter(ss => ss.status === 'cancelled').length;
            const rate = (absent / studentSessions.length) * 100;
            if (rate > 30) {
                result.push({
                    id: `absent-${s.id}`,
                    type: 'warning',
                    title: s.name,
                    desc: `غياب ${Math.round(rate)}%`,
                    action: () => navigate('/attendance'),
                    color: 'amber'
                });
            }
        });

        const overdueInvoices = studentInvoices.filter(inv => {
            if (!['unpaid', 'pending', 'overdue'].includes(inv.status?.toLowerCase())) return false;
            const now = Date.now();
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            const created = new Date(inv.date || inv.created_at || 0).getTime();
            return (now - created) > sevenDays;
        });

        if (overdueInvoices.length > 0) {
            result.push({
                id: 'overdue-invoices',
                type: 'warning',
                title: `${overdueInvoices.length} فواتير متأخرة`,
                desc: `مطلوب تحصيل مالي عاجل`,
                action: () => navigate('/studentInvoices'),
                color: 'indigo'
            });
        }

        return result.length > 0 ? result : [{
            id: 'all-good',
            type: 'success',
            title: 'النظام في حالة ممتازة',
            desc: 'لا توجد تنبيهات حرجة حالياً.',
            action: null,
            color: 'emerald'
        }];
    }, [students, sessions, studentInvoices, lowBalanceStudents, navigate]);

    // 2. Alerts Room Logic
    const roomAlerts = useMemo<RoomAlertItem[]>(() => {
        const notifications: RoomAlertItem[] = [
            ...(Array.isArray(lowBalanceStudents) ? lowBalanceStudents.map(s => ({
                id: `lb-${s.id}-${s.subject}`,
                type: 'low_balance',
                title: s.studentName,
                description: `${s.subject} - باقي ${s.remainingSessions}`,
                priority: s.remainingSessions === 0 ? 'high' : 'medium',
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
                title: t.title,
                description: `تاريخ الاستحقاق: ${t.dueDate}`,
                priority: 'high',
                link: '/tasks',
                actionLabel: 'عرض',
                icon: Bell,
                color: 'amber'
            })) : [])
        ].sort((a, _) => (a.priority === 'high' ? -1 : 1));

        return notifications;
    }, [tasks, lowBalanceStudents, adminPhone]);

    const [smartFilter, setSmartFilter] = useState<'all' | 'balance' | 'attendance' | 'invoices'>('all');

    const filteredSmartAlerts = useMemo(() => {
        if (smartFilter === 'all') return smartAlerts;
        if (smartFilter === 'balance') return smartAlerts.filter(a => a.id.startsWith('low-'));
        if (smartFilter === 'attendance') return smartAlerts.filter(a => a.id.startsWith('absent-'));
        if (smartFilter === 'invoices') return smartAlerts.filter(a => a.id === 'overdue-invoices');
        return smartAlerts;
    }, [smartAlerts, smartFilter]);

    const filteredRoomAlerts = roomAlerts;

    return (
        <div className="w-full space-y-6" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Smart Notifications */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">إخطارات ذكية</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ذكاء النظام الاصطناعي</p>
                            </div>
                        </div>

                        <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl">
                            {['all', 'balance', 'attendance', 'invoices'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setSmartFilter(f as any)}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-bold rounded-lg transition-all capitalize",
                                        smartFilter === f ? "bg-white dark:bg-slate-700 text-rose-500 shadow-sm" : "text-slate-400"
                                    )}
                                >
                                    {f === 'all' ? 'الكل' : f === 'balance' ? 'رصيد' : f === 'attendance' ? 'غياب' : 'فواتير'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {filteredSmartAlerts.map(alert => (
                            <div key={alert.id} className={cn(
                                "p-4 rounded-2xl border flex items-center justify-between group transition-all hover:translate-x-[-4px]",
                                alert.type === 'success' ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20" : "bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm",
                                        alert.type === 'success' ? "bg-emerald-500" : "bg-rose-500"
                                    )}>
                                        {alert.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div>
                                        <h3 className={cn("font-bold text-sm", alert.type === 'success' ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>{alert.title}</h3>
                                        <p className={cn("text-[11px] font-bold opacity-70", alert.type === 'success' ? "text-emerald-600" : "text-rose-600")}>{alert.desc}</p>
                                    </div>
                                </div>
                                {alert.action && (
                                    <button onClick={alert.action} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-lg shadow-sm transition-all">
                                        <ArrowLeft size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alerts Room */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2] rounded-2xl flex items-center justify-center">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">غرفة العمليات</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">تنبيهات حرجة</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl">
                            <span className="text-[10px] font-bold text-indigo-500">{filteredRoomAlerts.length} تنبيه</span>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {filteredRoomAlerts.length > 0 ? filteredRoomAlerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 rounded-xl flex items-center justify-center transition-all">
                                        <alert.icon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{alert.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{alert.description}</p>
                                    </div>
                                </div>
                                {alert.actionLabel === 'واتساب' ? (
                                    <button 
                                        onClick={alert.action} 
                                        className="h-8 px-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-bold transition-all"
                                    >
                                        {alert.actionLabel}
                                    </button>
                                ) : (
                                    <Link 
                                        to={alert.link || '#'} 
                                        className="h-8 px-4 bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-bold transition-all"
                                    >
                                        {alert.actionLabel}
                                    </Link>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-20 opacity-30 italic text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                لا توجد تنبيهات حرجة
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
