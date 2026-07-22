import { useState, useMemo, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, Zap, Phone, ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
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
        <div className="w-full space-y-3 font-dash" dir="rtl">
            {/* Header */}
            <div className="rounded-2xl bg-card border border-border p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                            <ShieldAlert size={16} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-main">مركز العمليات الذكي</h3>
                            <p className="text-[10px] text-muted">غرفة التحكم الذكية</p>
                        </div>
                    </div>
                    <div className="flex p-0.5 rounded-xl bg-surface gap-0.5 w-fit">
                        <button
                            onClick={() => setActiveTab('smart')}
                            className={cn(
                                "px-4 py-1.5 text-[11px] font-bold transition-colors flex items-center gap-1.5 rounded-lg",
                                activeTab === 'smart' ? "bg-primary text-on-primary" : "text-muted hover:text-main"
                            )}
                        >
                            <Zap size={11} />
                            إخطارات ذكية
                        </button>
                        <button
                            onClick={() => setActiveTab('room')}
                            className={cn(
                                "px-4 py-1.5 text-[11px] font-bold transition-colors flex items-center gap-1.5 rounded-lg",
                                activeTab === 'room' ? "bg-primary text-on-primary" : "text-muted hover:text-main"
                            )}
                        >
                            <Bell size={11} />
                            غرفة التنبيهات
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* Smart Alerts */}
                <div className={cn("lg:col-span-7", activeTab !== 'smart' && "hidden lg:block")}>
                    <div className="rounded-2xl bg-card border border-border p-5 h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-main">النظام التحليلي</h4>
                            </div>
                            <Badge variant="default" className="text-[10px] h-5 px-2.5 rounded-lg bg-error-soft text-error border-error/20">
                                {smartAlerts.filter(a => a.priority === 'high').length} تنبيه حرج
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            {smartAlerts.map((alert) => (
                                <div key={alert.id} className={cn(
                                    "p-3 flex items-center justify-between rounded-xl border",
                                    alert.type === 'critical' ? "bg-error-soft border-error/20" :
                                    alert.type === 'success' ? "bg-success-soft border-success/20" :
                                    "bg-warning-soft border-warning/20"
                                )}>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                            alert.type === 'critical' ? "bg-error/15 text-error" :
                                            alert.type === 'success' ? "bg-success/15 text-success" :
                                            "bg-warning/15 text-warning"
                                        )}>
                                            {alert.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-xs text-main">{alert.title}</h3>
                                            <p className="text-[10px] text-muted mt-0.5">{alert.desc}</p>
                                        </div>
                                    </div>
                                    {typeof alert.action === 'function' && (
                                        <Button variant="ghost" size="icon" onClick={alert.action} className="h-7 w-7 rounded-lg text-primary shrink-0" aria-label="تنفيذ إجراء">
                                            <ArrowLeft size={13} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {smartAlerts.length === 0 && (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-success-soft flex items-center justify-center">
                                        <CheckCircle2 size={20} className="text-success/50" />
                                    </div>
                                    <p className="text-xs font-bold text-muted">لا توجد تنبيهات ذكية</p>
                                    <p className="text-[10px] text-muted/60 mt-0.5">جميع الأنظمة تعمل بكفاءة</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Alerts Room */}
                <div className={cn("lg:col-span-5", activeTab !== 'room' && "hidden lg:block")}>
                    <div className="rounded-2xl bg-card border border-border p-5 h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-main">غرفة العمليات</h4>
                            </div>
                            <Badge variant="default" className="text-[10px] h-5 px-2.5 rounded-lg bg-primary-soft text-primary border-primary/20">
                                {roomAlerts.length} تنبيهات
                            </Badge>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar ps-1">
                            {roomAlerts.length > 0 ? roomAlerts.map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-hover transition-colors">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                                            <alert.icon size={14} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-main truncate">{alert.title}</h4>
                                            <p className="text-[10px] text-muted truncate mt-0.5">{alert.description}</p>
                                        </div>
                                    </div>
                                    {alert.actionLabel === 'واتساب' && typeof alert.action === 'function' ? (
                                        <Button onClick={alert.action} size="sm" className="h-8 px-3 rounded-lg text-[10px] font-bold bg-success text-on-success shrink-0">
                                            واتساب
                                        </Button>
                                    ) : (
                                        <Link to={alert.link || '#'}>
                                            <Button variant="default" size="sm" className="h-8 px-3 rounded-lg text-[10px] font-bold shrink-0">
                                                عرض
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-success-soft flex items-center justify-center">
                                        <Info size={20} className="text-success/50" />
                                    </div>
                                    <p className="text-xs font-bold text-muted">كافة الأنظمة تعمل بشكل طبيعي</p>
                                    <p className="text-[10px] text-muted/60 mt-0.5">لا توجد تنبيهات حالياً</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
