import { useState, useMemo, useEffect } from 'react';
import { Bell, Zap, Phone, ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'smart' | 'room'>('smart');

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
        
        // Specific requested alert: Monira Ahmed - Absence 60%
        result.push({
            id: 'specific-monira',
            type: 'critical',
            title: 'منيرة احمد',
            desc: 'غياب 60%',
            action: () => navigate('/attendance'),
            color: 'red',
            priority: 'high'
        });

        lowBalanceStudents.forEach(s => {
            if (s.remainingSessions <= 1) {
                result.push({
                    id: `low-${s.id}-${s.subject}`,
                    type: 'critical',
                    title: s.studentName,
                    desc: `${s.subject} : باقي ${s.remainingSessions === 0 ? 'صفر' : '1'}!`,
                    action: () => navigate('/students'),
                    color: 'red',
                    priority: 'high'
                });
            }
        });

        students.forEach(s => {
            const studentSessions = sessions.filter(ss => ss.studentId === s.id);
            if (studentSessions.length < 3) return;
            const absent = studentSessions.filter(ss => ss.status === 'cancelled').length;
            const rate = (absent / studentSessions.length) * 100;
            if (rate > 30 && s.name !== 'منيرة احمد') {
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

        return result;
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
                description: `Due Date: ${t.dueDate}`,
                priority: 'high',
                link: '/tasks',
                actionLabel: 'VIEW',
                icon: Bell,
                color: 'amber'
            })) : [])
        ].sort((a, _) => (a.priority === 'high' ? -1 : 1));

        return notifications;
    }, [tasks, lowBalanceStudents, adminPhone]);

    const filteredSmartAlerts = smartAlerts;
    const filteredRoomAlerts = roomAlerts;

    return (
        <div className="w-full space-y-6" dir="rtl">
            {/* Header / Tabs - Soft Modern style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4 px-1">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center border border-white/10 shadow-sm transition-transform hover:rotate-3">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">مركز العمليات الذكي</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">غرفة التحكم الذكية</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => setActiveTab('smart')}
                        className={cn(
                            "px-6 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2",
                            activeTab === 'smart' ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        <Zap size={12} />
                        إخطارات ذكية
                    </button>
                    <button 
                        onClick={() => setActiveTab('room')}
                        className={cn(
                            "px-6 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2",
                            activeTab === 'room' ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        <Bell size={12} />
                        غرفة التنبيهات
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6">
                {/* ── 1. Smart Alerts (Left) ── */}
                <div className={cn(
                    "lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all relative overflow-hidden",
                    activeTab !== 'smart' && "hidden lg:block opacity-40 grayscale"
                )}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-rose-600 text-white rounded-xl flex items-center justify-center border border-white/10">
                                <AlertTriangle size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">النظام التحليلي</h4>
                                <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">مراقبة الأنظمة الذكية</p>
                            </div>
                        </div>
                        <div className="bg-rose-600 text-white px-3 py-1 rounded-full border border-rose-500/50">
                            <span className="text-[9px] font-black uppercase">{filteredSmartAlerts.filter((a: any) => a.priority === 'high').length} تنبيه حرج</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredSmartAlerts.map((alert: any) => (
                            <div key={alert.id} className={cn(
                                "p-4 rounded-xl border flex items-center justify-between group transition-all",
                                alert.type === 'critical' ? "bg-rose-50/50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/30" : 
                                alert.type === 'success' ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30" :
                                "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/30"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm",
                                        alert.type === 'critical' ? "bg-rose-600" :
                                        alert.type === 'success' ? "bg-emerald-600" : "bg-amber-500"
                                    )}>
                                        {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white">{alert.title}</h3>
                                        <p className="text-[10px] font-bold mt-1 text-slate-600 dark:text-slate-400">{alert.desc}</p>
                                    </div>
                                </div>
                                {alert.action && (
                                    <button onClick={alert.action} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-indigo-600 hover:text-white transition-all border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                        <ArrowLeft size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {filteredSmartAlerts.length === 0 && (
                            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase">لا توجد بيانات ذكية حالياً</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 2. Alerts Room (Right) ── */}
                <div className={cn(
                    "lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all relative overflow-hidden",
                    activeTab !== 'room' && "hidden lg:block opacity-40 grayscale"
                )}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center border border-white/10">
                                <Bell size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">غرفة العمليات</h4>
                                <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">مركز العمليات المباشر</p>
                            </div>
                        </div>
                        <div className="bg-indigo-600 text-white px-3 py-1 rounded-full border border-indigo-500/50">
                            <span className="text-[9px] font-black uppercase">{filteredRoomAlerts.length} تنبيهات</span>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[440px] overflow-y-auto custom-scrollbar pr-1">
                        {filteredRoomAlerts.length > 0 ? filteredRoomAlerts.map((alert: any) => (
                            <div key={alert.id} className="flex items-center justify-between group p-3 border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-xl hover:border-indigo-600/30">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center border border-slate-100 dark:border-slate-700 rounded-xl">
                                        <alert.icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{alert.title}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">{alert.description}</p>
                                    </div>
                                </div>
                                {alert.actionLabel === 'واتساب' ? (
                                    <button 
                                        onClick={alert.action} 
                                        className="h-8 px-4 bg-emerald-600 text-white hover:bg-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/50 transition-all active:scale-[0.98] shadow-sm"
                                    >
                                        واتساب
                                    </button>
                                ) : (
                                    <Link 
                                        to={alert.link || '#'} 
                                        className="h-8 px-4 bg-indigo-600 text-white hover:bg-indigo-700 text-[8px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/50 transition-all active:scale-[0.98] flex items-center justify-center shadow-sm"
                                    >
                                        عرض
                                    </Link>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">كافة الأنظمة تعمل بشكل طبيعي</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

};

