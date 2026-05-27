import { useState, useMemo, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, Zap, Phone, ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useAdminPhone } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import type { DashboardTask as Task, LowBalanceStudent } from '../types';

interface NotificationsCenterProps {
    tasks: Task[];
    lowBalanceStudents: LowBalanceStudent[];
    students: Record<string, unknown>[];
    sessions: Record<string, unknown>[];
    studentInvoices: Record<string, unknown>[];
}

type RoomAlertItem = {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    icon: LucideIcon;
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
    const adminPhone = useAdminPhone();
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
        const result: { id: string; type: string; title: string; desc: string; action: () => void; color: string; priority: string }[] = [];
        
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
        ].sort((a) => (a.priority === 'high' ? -1 : 1));

        return notifications;
    }, [tasks, lowBalanceStudents, adminPhone]);

    const filteredSmartAlerts = smartAlerts;
    const filteredRoomAlerts = roomAlerts;

    const color = '#8B5CF6';

    return (
        <div className="w-full space-y-6" dir="rtl">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 px-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">مركز العمليات الذكي</h3>
                        <p className="text-[9px] font-medium text-[#64748B] mt-0.5">غرفة التحكم الذكية</p>
                    </div>
                </div>

                <div className="flex p-1 rounded-xl" style={{ backgroundColor: `${color}15` }}>
                    <button 
                        onClick={() => setActiveTab('smart')}
                        className={cn(
                            "px-6 py-2 font-bold text-[9px] transition-all flex items-center gap-2 rounded-lg",
                            activeTab === 'smart' ? "shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                        style={activeTab === 'smart' ? { backgroundColor: color, color: '#fff' } : {}}
                    >
                        <Zap size={12} />
                        إخطارات ذكية
                    </button>
                    <button 
                        onClick={() => setActiveTab('room')}
                        className={cn(
                            "px-6 py-2 font-bold text-[9px] transition-all flex items-center gap-2 rounded-lg",
                            activeTab === 'room' ? "shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                        style={activeTab === 'room' ? { backgroundColor: color, color: '#fff' } : {}}
                    >
                        <Bell size={12} />
                        غرفة التنبيهات
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pb-6">
                {/* Smart Alerts */}
                <div className={cn("lg:col-span-7 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all relative overflow-hidden", activeTab !== 'smart' && "hidden lg:block")}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
                                <AlertTriangle size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">النظام التحليلي</h4>
                                <p className="text-[8px] font-medium text-[#64748B] mt-0.5">مراقبة الأنظمة الذكية</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 rounded-lg shadow-sm text-white text-[9px] font-bold" style={{ backgroundColor: color }}>
                            {filteredSmartAlerts.filter(a => a.priority === 'high').length} تنبيه حرج
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredSmartAlerts.map((alert) => (
                            <div key={alert.id} className={cn("p-4 flex items-center justify-between group transition-all rounded-xl", alert.type === 'critical' ? "bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/30" : alert.type === 'success' ? "bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/30" : "bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/30")}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 flex items-center justify-center text-white shadow-sm rounded-xl", alert.type === 'critical' ? "bg-rose-600" : alert.type === 'success' ? "bg-emerald-600" : "bg-amber-500")}>
                                        {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xs text-[#0F172A] dark:text-white">{alert.title}</h3>
                                        <p className="text-[10px] font-medium mt-1 text-[#64748B]">{alert.desc}</p>
                                    </div>
                                </div>
                                {alert.action && (
                                    <button onClick={alert.action} className="w-8 h-8 flex items-center justify-center transition-all shadow-sm rounded-lg text-white" style={{ backgroundColor: color }}>
                                        <ArrowLeft size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {filteredSmartAlerts.length === 0 && (
                            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-[9px] font-bold text-[#64748B]">لا توجد بيانات ذكية حالياً</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts Room */}
                <div className={cn("lg:col-span-5 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all relative overflow-hidden", activeTab !== 'room' && "hidden lg:block")}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
                                <Bell size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">غرفة العمليات</h4>
                                <p className="text-[8px] font-medium text-[#64748B] mt-0.5">مركز العمليات المباشر</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 rounded-lg shadow-sm text-white text-[9px] font-bold" style={{ backgroundColor: color }}>
                            {filteredRoomAlerts.length} تنبيهات
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[440px] overflow-y-auto custom-scrollbar pr-1">
                        {filteredRoomAlerts.length > 0 ? filteredRoomAlerts.map((alert) => (
                            <div key={alert.id} className="flex items-center justify-between group p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 flex items-center justify-center transition-all rounded-lg" style={{ backgroundColor: `${color}12`, color }}>
                                        <alert.icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[11px] font-bold text-[#0F172A] dark:text-white truncate">{alert.title}</h4>
                                        <p className="text-[9px] font-medium text-[#64748B] truncate mt-0.5">{alert.description}</p>
                                    </div>
                                </div>
                                {alert.actionLabel === 'واتساب' ? (
                                    <button 
                                        onClick={alert.action} 
                                        className="h-8 px-4 text-white text-[8px] font-bold transition-all active:scale-[0.98] shadow-sm rounded-lg" style={{ backgroundColor: '#22C55E' }}
                                    >
                                        واتساب
                                    </button>
                                ) : (
                                    <Link to={alert.link || '#'} className="h-8 px-4 text-white text-[8px] font-bold transition-all active:scale-[0.98] flex items-center justify-center shadow-sm rounded-lg" style={{ backgroundColor: color }}>
                                        عرض
                                    </Link>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-[9px] font-bold text-[#64748B]">كافة الأنظمة تعمل بشكل طبيعي</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

};

