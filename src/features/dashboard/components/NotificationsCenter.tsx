import { useState, useMemo, useEffect } from 'react';
import { Bell, Zap, Phone, ArrowLeft, AlertTriangle, ChevronDown, CheckCircle2 } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'smart' | 'alerts'>('smart');
    const [isAlertsExpanded, setIsAlertsExpanded] = useState(true);
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
                title: `${overdueInvoices.length} فواتير`,
                desc: `تحصيل مالي مطلوب`,
                action: () => navigate('/studentInvoices'),
                color: 'indigo'
            });
        }

        return result.length > 0 ? result : [{
            id: 'all-good',
            type: 'success',
            title: 'النظام سليم',
            desc: 'لا توجد معلقات.',
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
                description: `تاريخ الحصاد: ${t.dueDate}`,
                priority: 'high',
                link: '/tasks',
                actionLabel: 'عرض',
                icon: Bell,
                color: 'amber'
            })) : [])
        ].sort((a, _) => (a.priority === 'high' ? -1 : 1));

        return notifications; // We removed dismiss logic for now to fix errors quickly
    }, [tasks, lowBalanceStudents, adminPhone]);

    // Filters State
    const [smartFilter, setSmartFilter] = useState<'all' | 'balance' | 'attendance' | 'invoices'>('all');
    const [roomFilter, setRoomFilter] = useState<'all' | 'low_balance' | 'task'>('all');

    // 1. Filtered Smart Alerts
    const filteredSmartAlerts = useMemo(() => {
        if (smartFilter === 'all') return smartAlerts;
        if (smartFilter === 'balance') return smartAlerts.filter(a => a.id.startsWith('low-'));
        if (smartFilter === 'attendance') return smartAlerts.filter(a => a.id.startsWith('absent-'));
        if (smartFilter === 'invoices') return smartAlerts.filter(a => a.id === 'overdue-invoices');
        return smartAlerts;
    }, [smartAlerts, smartFilter]);

    // 2. Filtered Room Alerts
    const filteredRoomAlerts = useMemo(() => {
        if (roomFilter === 'all') return roomAlerts;
        return roomAlerts.filter(a => a.type === roomFilter);
    }, [roomAlerts, roomFilter]);

    return (
        <div className="w-full space-y-6" dir="rtl">
            {/* --- DESKTOP VIEW --- */}
            <div className="hidden lg:grid grid-cols-12 gap-6 items-start">
                
                {/* 1. Smart Notifications Column */}
                <div className="col-span-12 xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">إخطارات ذكية</h2>
                            
                            {/* Desktop Filter Menu */}
                            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                                {[
                                    { id: 'all', label: 'الكل' },
                                    { id: 'balance', label: 'الرصيد' },
                                    { id: 'attendance', label: 'الغياب' },
                                    { id: 'invoices', label: 'الفواتير' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setSmartFilter(f.id as any)}
                                        className={cn(
                                            "px-3 py-1 text-[10px] font-bold rounded-lg transition-all",
                                            smartFilter === f.id ? "bg-white dark:bg-slate-700 text-[#ff4d4f] shadow-sm" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <Zap size={18} className="text-slate-400" />
                            </div>
                            <div className="w-9 h-9 flex items-center justify-center bg-[#5c59f2] text-white rounded-xl relative">
                                <Bell size={18} />
                                {filteredSmartAlerts.length > 0 && filteredSmartAlerts[0].id !== 'all-good' && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                        {filteredSmartAlerts.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Container */}
                    <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                        {filteredSmartAlerts.length > 0 ? filteredSmartAlerts.map(alert => (
                            <div key={alert.id} className="group relative flex items-center bg-[#fff8f8] dark:bg-red-900/10 border border-red-50 dark:border-red-900/20 p-4 rounded-2xl transition-all hover:translate-x-[-4px]">
                                {alert.action && (
                                    <button 
                                        onClick={alert.action}
                                        className="w-10 h-10 flex items-center justify-center bg-[#ff4d4f] text-white rounded-xl ml-4 hover:scale-105 transition-transform"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <div className="flex-1 text-right">
                                    <h3 className="font-bold text-[#ff4d4f] text-lg">{alert.title}</h3>
                                    <p className="text-red-400 text-sm font-medium">{alert.desc}</p>
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center bg-[#ff4d4f] text-white rounded-xl mr-4">
                                    <AlertTriangle size={20} />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 opacity-40">
                                <CheckCircle2 className="mx-auto mb-2 text-emerald-500" />
                                <p className="text-sm font-bold">لا توجد تنبيهات لهذا القسم</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Alerts Room Column */}
                <div className="col-span-12 xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">غرفة التنبيهات</h2>
                             <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                                {[
                                    { id: 'all', label: 'الكل' },
                                    { id: 'low_balance', label: 'الأرصدة' },
                                    { id: 'task', label: 'المهام' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setRoomFilter(f.id as any)}
                                        className={cn(
                                            "px-2 py-0.5 text-[9px] font-bold rounded-lg transition-all",
                                            roomFilter === f.id ? "bg-white dark:bg-slate-700 text-[#5c59f2] shadow-sm" : "text-slate-400"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="text-slate-500 text-xs font-bold">{filteredRoomAlerts.length} حرجة</span>
                        </div>
                    </div>

                    {/* Scrollable Container */}
                    <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                        {filteredRoomAlerts.length > 0 ? filteredRoomAlerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between p-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 rounded-2xl transition-all">
                                {alert.actionLabel === 'واتساب' ? (
                                    <button 
                                        onClick={() => alert.action?.()}
                                        className="bg-[#eef2ff] text-[#5c59f2] px-5 py-2 rounded-xl font-bold hover:bg-[#5c59f2] hover:text-white transition-all text-[11px]"
                                    >
                                        {alert.actionLabel}
                                    </button>
                                ) : (
                                    <Link 
                                        to={alert.link || '#'}
                                        className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-5 py-2 rounded-xl font-bold hover:bg-slate-100 transition-all text-[11px]"
                                    >
                                        {alert.actionLabel}
                                    </Link>
                                )}
                                
                                <div className="flex-1 text-right px-4">
                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">{alert.title}</h3>
                                    <p className="text-slate-400 text-[10px]">{alert.description}</p>
                                </div>

                                <div className="text-[#5c59f2]">
                                    <alert.icon size={20} />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 opacity-40">
                                <CheckCircle2 className="mx-auto mb-2 text-emerald-500" />
                                <p className="text-sm font-bold">كل شيء على ما يرام</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MOBILE VIEW --- */}
            <div className="lg:hidden space-y-4">
                {/* Mobile Tab Options Selector */}
                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl grid grid-cols-2 gap-2 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('smart')}
                        className={cn(
                            "py-3 rounded-xl font-bold text-sm transition-all flex flex-col items-center gap-1",
                            activeTab === 'smart' ? "bg-red-50 text-red-600 shadow-sm" : "text-slate-400"
                        )}
                    >
                        <Zap size={16} />
                        إخطارات ذكية
                    </button>
                    <button 
                        onClick={() => setActiveTab('alerts')}
                        className={cn(
                            "py-3 rounded-xl font-bold text-sm transition-all flex flex-col items-center gap-1",
                            activeTab === 'alerts' ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-400"
                        )}
                    >
                        <Bell size={16} />
                        غرفة التنبيهات
                    </button>
                </div>

                {activeTab === 'smart' ? (
                    <div className="space-y-3">
                         {/* Mobile Smart Filters */}
                         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {[
                                { id: 'all', label: 'الكل' },
                                { id: 'balance', label: 'رصيد' },
                                { id: 'attendance', label: 'غياب' },
                                { id: 'invoices', label: 'فواتير' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setSmartFilter(f.id as any)}
                                    className={cn(
                                        "px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap",
                                        smartFilter === f.id ? "bg-red-500 text-white shadow-md" : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-100"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {filteredSmartAlerts.map(alert => (
                                <div key={alert.id} className="bg-[#fff8f8] border border-red-50 p-4 rounded-2xl flex items-center group shadow-sm">
                                    {alert.action && (
                                        <button onClick={alert.action} className="w-9 h-9 bg-[#ff4d4f] text-white rounded-xl ml-3">
                                            <ArrowLeft size={16} className="mx-auto" />
                                        </button>
                                    )}
                                    <div className="flex-1 text-right">
                                        <h4 className="font-bold text-[#ff4d4f] text-base">{alert.title}</h4>
                                        <p className="text-red-300 text-xs">{alert.desc}</p>
                                    </div>
                                    <div className="w-10 h-10 flex items-center justify-center bg-[#ff4d4f] text-white rounded-xl">
                                        <AlertTriangle size={18} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
                                className="w-full flex items-center justify-between p-5 border-b border-slate-50 dark:border-slate-800"
                            >
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                                        <Zap size={18} />
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">غرفة التنبيهات</h3>
                                 </div>
                                 <ChevronDown className={cn("text-slate-300 transition-transform", isAlertsExpanded && "rotate-180")} />
                            </button>
                            
                            {isAlertsExpanded && (
                                 <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                                    {roomAlerts.map(alert => (
                                        <div key={alert.id} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                                             <button onClick={() => alert.action?.()} className="bg-[#eef2ff] text-[#5c59f2] px-4 py-2 rounded-xl font-bold text-xs">
                                                {alert.actionLabel}
                                            </button>
                                            <div className="flex-1 text-right px-3">
                                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{alert.title}</h4>
                                                <p className="text-slate-400 text-[10px]">{alert.description}</p>
                                            </div>
                                            <div className="w-8 h-8 flex items-center justify-center text-[#5c59f2]">
                                                <alert.icon size={18} />
                                            </div>
                                        </div>
                                    ))}
                                 </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
