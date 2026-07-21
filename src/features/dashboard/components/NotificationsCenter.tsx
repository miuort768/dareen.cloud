import { useState, useMemo, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, Zap, Phone, ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert, Info, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useAdminPhone } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const GlassBox = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        "rounded-3xl p-6",
        "bg-card/70 backdrop-blur-xl",
        "border border-white/20 dark:border-white/10",
        "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.04)]",
        "font-dash",
        className
    )}>
        {children}
    </div>
);

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
                    title: s.name as string,
                    desc: `غياب ${Math.round(rate)}%`,
                    action: () => navigate('/attendance'),
                    color: 'amber',
                    priority: 'medium'
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
                action: () => navigate('/student-invoices'),
                color: 'indigo',
                priority: 'medium'
            });
        }
        return result;
    }, [students, sessions, studentInvoices, lowBalanceStudents, navigate]);

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
                color: 'rose',
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
                color: 'amber',
            })) : [])
        ].sort((a) => (a.priority === 'high' ? -1 : 1));
        return notifications;
    }, [tasks, lowBalanceStudents, adminPhone]);

    return (
        <div className="w-full space-y-4" dir="rtl">
            {/* Header */}
            <GlassBox className="!p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShieldAlert size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-main">مركز العمليات الذكي</h3>
                            <p className="text-xs text-muted">غرفة التحكم الذكية</p>
                        </div>
                    </div>
                    <div className="flex p-1 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 gap-1 w-fit">
                        <button
                            onClick={() => setActiveTab('smart')}
                            className={cn(
                                "px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 rounded-xl",
                                activeTab === 'smart' ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-md" : "text-muted hover:text-main"
                            )}
                        >
                            <Zap size={12} />
                            إخطارات ذكية
                        </button>
                        <button
                            onClick={() => setActiveTab('room')}
                            className={cn(
                                "px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 rounded-xl",
                                activeTab === 'room' ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-md" : "text-muted hover:text-main"
                            )}
                        >
                            <Bell size={12} />
                            غرفة التنبيهات
                        </button>
                    </div>
                </div>
            </GlassBox>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Smart Alerts */}
                <div className={cn("lg:col-span-7", activeTab !== 'smart' && "hidden lg:block")}>
                    <GlassBox className="h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-primary" />
                                <h4 className="text-sm font-bold text-main">النظام التحليلي</h4>
                            </div>
                            <Badge variant="default" className="text-[10px] h-6 px-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 border-0 text-white">
                                {smartAlerts.filter(a => a.priority === 'high').length} تنبيه حرج
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            {smartAlerts.map((alert) => (
                                <div key={alert.id} className={cn(
                                    "p-4 flex items-center justify-between rounded-2xl border backdrop-blur-sm",
                                    alert.type === 'critical' ? "bg-error/5 border-error/20" :
                                    alert.type === 'success' ? "bg-success/5 border-success/20" :
                                    "bg-warning/5 border-warning/20"
                                )}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                            alert.type === 'critical' ? "bg-error/20 text-error" :
                                            alert.type === 'success' ? "bg-success/20 text-success" :
                                            "bg-warning/20 text-warning"
                                        )}>
                                            {alert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-sm text-main">{alert.title}</h3>
                                            <p className="text-xs text-muted mt-0.5">{alert.desc}</p>
                                        </div>
                                    </div>
                                    {typeof alert.action === 'function' && (
                                        <Button variant="ghost" size="icon" onClick={alert.action} className="h-8 w-8 rounded-xl text-primary hover:text-primary hover:bg-primary/10 shrink-0" aria-label="تنفيذ إجراء">
                                            <ArrowLeft size={14} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {smartAlerts.length === 0 && (
                                <div className="text-center py-14">
                                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-success/10 to-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle2 size={24} className="text-success/40" />
                                    </div>
                                    <p className="text-sm font-bold text-muted">لا توجد تنبيهات ذكية</p>
                                    <p className="text-xs text-muted/60 mt-0.5">جميع الأنظمة تعمل بكفاءة</p>
                                </div>
                            )}
                        </div>
                    </GlassBox>
                </div>

                {/* Alerts Room */}
                <div className={cn("lg:col-span-5", activeTab !== 'room' && "hidden lg:block")}>
                    <GlassBox className="h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Bell size={16} className="text-primary" />
                                <h4 className="text-sm font-bold text-main">غرفة العمليات</h4>
                            </div>
                            <Badge variant="default" className="text-[10px] h-6 px-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 border-0 text-white">
                                {roomAlerts.length} تنبيهات
                            </Badge>
                        </div>
                        <div className="space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar ps-1">
                            {roomAlerts.length > 0 ? roomAlerts.map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center shrink-0">
                                            <alert.icon size={15} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-main truncate">{alert.title}</h4>
                                            <p className="text-xs text-muted truncate mt-0.5">{alert.description}</p>
                                        </div>
                                    </div>
                                    {alert.actionLabel === 'واتساب' && typeof alert.action === 'function' ? (
                                        <Button onClick={alert.action} size="sm" className="h-9 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-success to-emerald-500 hover:from-success-dark hover:to-emerald-600 text-white shadow-md border-0 shrink-0">
                                            واتساب
                                        </Button>
                                    ) : (
                                        <Link to={alert.link || '#'}>
                                            <Button variant="default" size="sm" className="h-9 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 shadow-md border-0 shrink-0">
                                                عرض
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-14">
                                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-success/10 to-emerald-500/10 flex items-center justify-center">
                                        <Info size={24} className="text-success/40" />
                                    </div>
                                    <p className="text-sm font-bold text-muted">كافة الأنظمة تعمل بشكل طبيعي</p>
                                    <p className="text-xs text-muted/60 mt-0.5">لا توجد تنبيهات حالياً</p>
                                </div>
                            )}
                        </div>
                    </GlassBox>
                </div>
            </div>
        </div>
    );
};
