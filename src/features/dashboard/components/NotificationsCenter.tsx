import { useState, useMemo, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, Zap, ArrowLeft, AlertTriangle, CheckCircle2, Phone, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

type AlertItem = {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    icon: LucideIcon;
    action: () => void;
    actionLabel: string;
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
    const [activeTab, setActiveTab] = useState<'smart' | 'room'>('smart');

    useEffect(() => {
        const fetchDismissed = async () => {
            try {
                await api.get<string[]>('/system/dismissed-notifications');
            } catch {
                // ignore
            }
        };
        fetchDismissed();
    }, []);

    const smartAlerts = useMemo(() => {
        const result: { id: string; type: string; title: string; desc: string; action: () => void; priority: string }[] = [];
        lowBalanceStudents.forEach(s => {
            if (s.remainingSessions <= 1) {
                result.push({
                    id: `low-${s.id}-${s.subject}`,
                    type: 'critical',
                    title: s.studentName,
                    desc: `${s.subject} : باقي ${s.remainingSessions === 0 ? 'صفر' : '1'}!`,
                    action: () => navigate('/students'),
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
                desc: 'مطلوب تحصيل مالي عاجل',
                action: () => navigate('/student-invoices'),
                priority: 'medium'
            });
        }
        return result;
    }, [students, sessions, studentInvoices, lowBalanceStudents, navigate]);

    const roomAlerts = useMemo<AlertItem[]>(() => {
        const notifications: AlertItem[] = [
            ...(Array.isArray(lowBalanceStudents) ? lowBalanceStudents.map(s => ({
                id: `lb-${s.id}-${s.subject}`,
                type: 'low_balance',
                title: s.studentName,
                description: `${s.subject} - باقي ${s.remainingSessions}`,
                priority: s.remainingSessions === 0 ? 'high' : 'medium',
                action: () => sendWhatsAppReminder(s, undefined, adminPhone),
                actionLabel: 'واتساب',
                icon: Phone,
            })) : []),
            ...(Array.isArray(tasks) ? tasks.filter(t =>
                ['high', 'عالية', 'urgent', 'عاجل'].includes(t.priority?.toLowerCase())
            ).map(t => ({
                id: `task-${t.id}`,
                type: 'task',
                title: t.title,
                description: `تاريخ الاستحقاق: ${t.dueDate}`,
                priority: 'high',
                action: () => navigate('/tasks'),
                actionLabel: 'عرض',
                icon: Bell,
            })) : [])
        ].sort((a) => (a.priority === 'high' ? -1 : 1));
        return notifications;
    }, [tasks, lowBalanceStudents, adminPhone, navigate]);

    const criticalCount = smartAlerts.filter(a => a.priority === 'high').length;

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-warning-soft flex items-center justify-center">
                        <Bell size={16} className="text-warning" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main">التنبيهات</h3>
                        <p className="text-[10px] text-muted">مراقبة الأنظمة</p>
                    </div>
                </div>
                <div className="flex p-0.5 rounded-lg bg-surface gap-0.5">
                    <button
                        onClick={() => setActiveTab('smart')}
                        className={cn(
                            "px-3 py-1.5 text-[10px] font-bold transition-colors flex items-center gap-1 rounded-md",
                            activeTab === 'smart' ? "bg-primary text-on-primary" : "text-muted hover:text-main"
                        )}
                    >
                        <Zap size={10} />
                        ذكية
                    </button>
                    <button
                        onClick={() => setActiveTab('room')}
                        className={cn(
                            "px-3 py-1.5 text-[10px] font-bold transition-colors flex items-center gap-1 rounded-md",
                            activeTab === 'room' ? "bg-primary text-on-primary" : "text-muted hover:text-main"
                        )}
                    >
                        <Bell size={10} />
                        عمليات
                    </button>
                </div>
            </div>

            {/* Smart Alerts */}
            {activeTab === 'smart' && (
                <div className="space-y-2">
                    {criticalCount > 0 && (
                        <Badge variant="default" className="text-[10px] h-5 px-2.5 rounded-lg bg-error-soft text-error border-error/20 mb-2">
                            {criticalCount} تنبيه حرج
                        </Badge>
                    )}
                    {smartAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={cn(
                                "p-3 flex items-center justify-between rounded-xl border",
                                alert.type === 'critical' ? "bg-error/10 border-error/20" :
                                "bg-warning/10 border-warning/20"
                            )}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                                    alert.type === 'critical' ? "bg-error/15 text-error" :
                                    "bg-warning/15 text-warning"
                                )}>
                                    {alert.type === 'critical' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-[11px] text-main">{alert.title}</h3>
                                    <p className="text-[10px] text-muted mt-0.5">{alert.desc}</p>
                                </div>
                            </div>
                            {typeof alert.action === 'function' && (
                                <Button variant="ghost" size="icon" onClick={alert.action} className="h-7 w-7 rounded-lg text-primary shrink-0" aria-label="تنفيذ إجراء">
                                    <ArrowLeft size={12} />
                                </Button>
                            )}
                        </div>
                    ))}
                    {smartAlerts.length === 0 && (
                        <div className="text-center py-8">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-success-soft flex items-center justify-center">
                                <CheckCircle2 size={24} className="text-success/40" />
                            </div>
                            <p className="text-sm font-bold text-muted">لا توجد تنبيهات</p>
                            <p className="text-[11px] text-muted/60 mt-1">كل شيء يعمل بشكل ممتاز ✅</p>
                        </div>
                    )}
                </div>
            )}

            {/* Room Alerts */}
            {activeTab === 'room' && (
                <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                    {roomAlerts.length > 0 ? roomAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-hover transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                                    <alert.icon size={12} className="text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-[11px] font-bold text-main truncate">{alert.title}</h4>
                                    <p className="text-[10px] text-muted truncate mt-0.5">{alert.description}</p>
                                </div>
                            </div>
                            {alert.actionLabel === 'واتساب' ? (
                                <Button onClick={alert.action} size="sm" className="h-7 px-2.5 rounded-lg text-[10px] font-bold bg-success text-on-success shrink-0">
                                    واتساب
                                </Button>
                            ) : (
                                <Button onClick={alert.action} variant="outline" size="sm" className="h-7 px-2.5 rounded-lg text-[10px] font-bold shrink-0">
                                    عرض
                                </Button>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-success-soft flex items-center justify-center">
                                <Info size={16} className="text-success/50" />
                            </div>
                            <p className="text-xs font-bold text-muted">لا توجد تنبيهات</p>
                            <p className="text-[10px] text-muted/60 mt-0.5">كافة الأنظمة تعمل بشكل طبيعي</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
