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
        <div className="w-full space-y-6 font-sans" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ── 1. إخطارات ذكية (Left Pane) ── */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
                    {/* Header with Tabs */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b-2 border-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-none shadow-lg">
                                <Bell size={18} />
                            </div>
                            <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter">إخطارات ذكية</h2>
                            <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                <Zap size={16} className="text-slate-400" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-none text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {filteredSmartAlerts.length} حرجة
                             </div>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                        {filteredSmartAlerts.map(alert => (
                            <div key={alert.id} className={cn(
                                "relative p-5 rounded-none border flex items-center justify-between transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
                                alert.type === 'success' 
                                    ? "bg-emerald-50/30 border-emerald-100 dark:border-emerald-900/20" 
                                    : "bg-rose-50/50 border-rose-100 dark:border-rose-900/20"
                            )}>
                                {/* Right warning icon */}
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-10 h-10 flex items-center justify-center text-white rounded-none shadow-md",
                                        alert.type === 'success' ? "bg-emerald-500" : "bg-rose-500"
                                    )}>
                                        {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                    </div>
                                    <div className="text-right">
                                        <h3 className={cn("font-black text-sm uppercase tracking-tighter mb-1", alert.type === 'success' ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>{alert.title}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alert.desc}</p>
                                    </div>
                                </div>

                                {/* Left action button */}
                                {alert.action && (
                                    <button 
                                        onClick={alert.action} 
                                        className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-none shadow-lg hover:bg-rose-600 transition-colors"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 2. غرفة التنبيهات (Right Pane) ── */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b-2 border-slate-950">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter">غرفة التنبيهات</h2>
                            <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                <Zap size={16} className="text-indigo-600" />
                            </div>
                        </div>
                        <div className="bg-slate-950 text-white px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest">
                            {filteredRoomAlerts.length} عاجل
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {filteredRoomAlerts.length > 0 ? filteredRoomAlerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                {/* Left Action (WhatsApp) */}
                                {alert.actionLabel === 'واتساب' ? (
                                    <button 
                                        onClick={alert.action} 
                                        className="h-10 px-6 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                    >
                                        {alert.actionLabel}
                                    </button>
                                ) : (
                                    <Link 
                                        to={alert.link || '#'} 
                                        className="h-10 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all"
                                    >
                                        {alert.actionLabel}
                                    </Link>
                                )}

                                {/* Name & Details in Middle/Right */}
                                <div className="flex items-center gap-4 text-right min-w-0">
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-black text-slate-950 dark:text-white truncate uppercase tracking-tighter">{alert.title}</h4>
                                        <p className="text-[10px] font-black text-slate-400 truncate mt-1 uppercase tracking-widest">{alert.description}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-none flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:text-indigo-600 transition-colors">
                                        <Phone size={16} className="text-rose-500" />
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-24 opacity-20 flex flex-col items-center">
                                <Zap size={48} className="text-slate-300 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">العمليات في حالة استقرار</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
