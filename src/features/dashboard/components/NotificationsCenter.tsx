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
            {/* Header / Tabs Style - Premium Admin Sharp */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border-2 border-slate-800 p-6 rounded-none shadow-xl">
                <div className="flex items-center gap-5 px-2">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-none flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white leading-tight tracking-tight uppercase">مركز العمليات الذكي</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Intelligent Operations Center</p>
                    </div>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-none border border-slate-700">
                    <button 
                        onClick={() => setActiveTab('smart')}
                        className={cn(
                            "px-8 py-3 rounded-none font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                            activeTab === 'smart' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Zap size={14} />
                        إخطارات ذكية
                    </button>
                    <button 
                        onClick={() => setActiveTab('room')}
                        className={cn(
                            "px-8 py-3 rounded-none font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                            activeTab === 'room' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Bell size={14} />
                        غرفة التنبيهات
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-10">
                {/* ── 1. إخطارات ذكية (Left/Large Card) ── */}
                <div className={cn(
                    "lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-none p-8 shadow-xl transition-all relative overflow-hidden",
                    activeTab !== 'smart' && "hidden lg:block opacity-40 grayscale"
                )}>
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-600" />
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-rose-600 text-white rounded-none flex items-center justify-center">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">النظام التحليلي الذكي</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Critical AI Insights</p>
                            </div>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/20 px-4 py-1.5 border border-rose-100 dark:border-rose-900/30">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{filteredSmartAlerts.filter(a => a.priority === 'high').length} CRITICAL</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredSmartAlerts.map(alert => (
                            <div key={alert.id} className={cn(
                                "p-5 rounded-none border-2 flex items-center justify-between group transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                alert.type === 'critical' ? "bg-rose-50/20 border-rose-100 dark:border-rose-900/20" : 
                                alert.type === 'success' ? "bg-emerald-50/20 border-emerald-100 dark:border-emerald-900/20" :
                                "bg-amber-50/20 border-amber-100 dark:border-amber-900/20"
                            )}>
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-12 h-12 rounded-none flex items-center justify-center text-white shadow-xl",
                                        alert.type === 'critical' ? "bg-rose-600" :
                                        alert.type === 'success' ? "bg-emerald-600" : "bg-amber-500"
                                    )}>
                                        {alert.type === 'success' ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                                    </div>
                                    <div>
                                        <h3 className={cn("font-black text-sm uppercase tracking-tight", 
                                            alert.type === 'critical' ? "text-rose-700 dark:text-rose-400" :
                                            alert.type === 'success' ? "text-emerald-700 dark:text-emerald-400" : 
                                            "text-amber-700 dark:text-amber-400"
                                        )}>{alert.title}</h3>
                                        <p className={cn("text-[11px] font-bold mt-1", 
                                            alert.type === 'critical' ? "text-rose-600" :
                                            alert.type === 'success' ? "text-emerald-600" : "text-amber-600"
                                        )}>{alert.desc}</p>
                                    </div>
                                </div>
                                {alert.action && (
                                    <button onClick={alert.action} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {filteredSmartAlerts.length === 0 && (
                            <div className="text-center py-24 opacity-30 italic text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                No Intelligence Data Found
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 2. غرفة التنبيهات (Right Card) ── */}
                <div className={cn(
                    "lg:col-span-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-none p-8 shadow-xl transition-all relative overflow-hidden",
                    activeTab !== 'room' && "hidden lg:block opacity-40 grayscale"
                )}>
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-none flex items-center justify-center">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">غرفة التحكم والعمليات</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Live Operations Center</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1.5 border border-indigo-100 dark:border-indigo-900/30">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{filteredRoomAlerts.length} ALERTS</span>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {filteredRoomAlerts.length > 0 ? filteredRoomAlerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between group p-3 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center shadow-sm">
                                        <alert.icon size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{alert.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 truncate mt-1">{alert.description}</p>
                                    </div>
                                </div>
                                {alert.actionLabel === 'واتساب' ? (
                                    <button 
                                        onClick={alert.action} 
                                        className="h-9 px-5 bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                                    >
                                        WHATSAPP
                                    </button>
                                ) : (
                                    <Link 
                                        to={alert.link || '#'} 
                                        className="h-9 px-5 bg-slate-900 text-white hover:bg-black text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        {alert.actionLabel}
                                    </Link>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-24 opacity-30 italic text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                All Systems Nominal
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

