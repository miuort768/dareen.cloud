import { useState, useMemo, useEffect } from 'react';
import { Bell, Zap, Phone, ArrowLeft, AlertTriangle, CheckCircle2, TrendingUp, LayoutGrid } from 'lucide-react';
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

    const filteredSmartAlerts = smartAlerts;
    const filteredRoomAlerts = roomAlerts;

    return (
        <div className="w-full space-y-6" dir="rtl">
            {/* Header / Tabs Style (Mimicking Analytics) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[32px] shadow-sm">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl flex items-center justify-center">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">مركز العمليات الذكي</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ذكاء الأعمال والبيانات</p>
                    </div>
                </div>

                <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('smart')}
                        className={cn(
                            "px-6 py-2 rounded-xl font-bold text-[10px] transition-all flex items-center gap-2",
                            activeTab === 'smart' ? "bg-white dark:bg-slate-700 text-indigo-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Zap size={14} />
                        إخطارات ذكية
                    </button>
                    <button 
                        onClick={() => setActiveTab('room')}
                        className={cn(
                            "px-6 py-2 rounded-xl font-bold text-[10px] transition-all flex items-center gap-2",
                            activeTab === 'room' ? "bg-white dark:bg-slate-700 text-indigo-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Bell size={14} />
                        غرفة التنبيهات
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── 1. إخطارات ذكية (Left/Large Card) ── */}
                <div className={cn(
                    "lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm overflow-hidden transition-all",
                    activeTab !== 'smart' && "hidden lg:block opacity-40"
                )}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl flex items-center justify-center">
                                <AlertTriangle size={18} />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white">إخطارات ذكية</h4>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-xl">
                            <span className="text-[10px] font-bold text-rose-600">{filteredSmartAlerts.filter(a => a.priority === 'high').length} حرجة</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredSmartAlerts.map(alert => (
                            <div key={alert.id} className={cn(
                                "p-4 rounded-[24px] border flex items-center justify-between group transition-all hover:translate-x-[-4px]",
                                alert.type === 'critical' ? "bg-rose-50/30 border-rose-100 dark:border-rose-900/20" : 
                                alert.type === 'success' ? "bg-emerald-50/30 border-emerald-100 dark:border-emerald-900/20" :
                                "bg-amber-50/30 border-amber-100 dark:border-amber-900/20"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md",
                                        alert.type === 'critical' ? "bg-rose-500" :
                                        alert.type === 'success' ? "bg-emerald-500" : "bg-amber-500"
                                    )}>
                                        {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                    </div>
                                    <div>
                                        <h3 className={cn("font-bold text-sm", 
                                            alert.type === 'critical' ? "text-rose-700 dark:text-rose-400" :
                                            alert.type === 'success' ? "text-emerald-700 dark:text-emerald-400" : 
                                            "text-amber-700 dark:text-amber-400"
                                        )}>{alert.title}</h3>
                                        <p className={cn("text-[11px] font-bold opacity-70", 
                                            alert.type === 'critical' ? "text-rose-600" :
                                            alert.type === 'success' ? "text-emerald-600" : "text-amber-600"
                                        )}>{alert.desc}</p>
                                    </div>
                                </div>
                                {alert.action && (
                                    <button onClick={alert.action} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 rounded-lg shadow-sm">
                                        <ArrowLeft size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {filteredSmartAlerts.length === 0 && (
                            <div className="text-center py-20 opacity-30 italic text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                لا توجد تنبيهات ذكية
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 2. غرفة التنبيهات (Right Card) ── */}
                <div className={cn(
                    "lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm overflow-hidden transition-all",
                    activeTab !== 'room' && "hidden lg:block opacity-40"
                )}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2] rounded-xl flex items-center justify-center">
                                <Bell size={18} />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white">غرفة التنبيهات</h4>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-xl">
                            <span className="text-[10px] font-bold text-[#5c59f2]">{filteredRoomAlerts.length} تنبيه</span>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar">
                        {filteredRoomAlerts.length > 0 ? filteredRoomAlerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 rounded-xl flex items-center justify-center transition-all border border-transparent group-hover:border-indigo-100">
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
                                        className="h-8 px-4 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-bold transition-all"
                                    >
                                        {alert.actionLabel}
                                    </Link>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-20 opacity-30 italic text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                لا توجد تنبيهات عاجلة
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
