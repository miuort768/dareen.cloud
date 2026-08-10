import { useState, useMemo, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, Zap, AlertTriangle, CheckCircle2, Phone, Info } from 'lucide-react';
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
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchDismissed = async () => {
            try {
                const data = await api.get<string[]>('/system/dismissed-notifications');
                if (Array.isArray(data)) setDismissedIds(data);
            } catch {
                // non-critical background fetch
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
        ].sort((a, b) => (a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0));
        return notifications;
    }, [tasks, lowBalanceStudents, adminPhone, navigate]);

    const criticalCount = smartAlerts.filter(a => a.priority === 'high').length;

    return (
        <div className="rounded-2xl bg-card dark:bg-card border border-border dark:border-primary/20 shadow-elevation-1 p-5 font-dash" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-warning-soft dark:bg-primary/10 flex items-center justify-center">
                        <Bell size={16} className="text-warning dark:text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main dark:text-main">التنبيهات</h3>
                        <p className="text-[10px] text-muted dark:text-muted">مراقبة الأنظمة</p>
                    </div>
                </div>
                <div className="flex p-0.5 rounded-lg bg-surface dark:bg-hover gap-0.5" role="tablist">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'smart'}
                        onClick={() => setActiveTab('smart')}
                        className={cn(
                            "px-3 py-1.5 text-[10px] font-bold transition-colors flex items-center gap-1 rounded-md",
                            activeTab === 'smart' ? "bg-primary dark:bg-primary text-on-primary dark:text-on-primary" : "text-muted dark:text-muted hover:text-main dark:hover:text-white"
                        )}
                    >
                        <Zap size={10} />
                        ذكية
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'room'}
                        onClick={() => setActiveTab('room')}
                        className={cn(
                            "px-3 py-1.5 text-[10px] font-bold transition-colors flex items-center gap-1 rounded-md",
                            activeTab === 'room' ? "bg-primary dark:bg-primary text-on-primary dark:text-on-primary" : "text-muted dark:text-muted hover:text-main dark:hover:text-white"
                        )}
                    >
                        <Bell size={10} />
                        عمليات
                    </button>
                </div>
            </div>

            {/* Smart Alerts — Timeline */}
            {activeTab === 'smart' && (
                <div className="space-y-1">
                    {criticalCount > 0 && (
                        <Badge variant="default" className="text-[10px] h-5 px-2.5 rounded-lg bg-error-soft text-error border-border mb-3">
                            {criticalCount} تنبيه حرج
                        </Badge>
                    )}
                    {smartAlerts.length > 0 ? (
                        <div className="relative">
                            <div className="absolute start-[15px] top-2 bottom-2 w-px bg-divider" />
                            {smartAlerts.map((alert, idx) => (
                                <div key={alert.id} className="flex gap-3 relative pb-3">
                                    <div className={cn(
                                        "w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 ring-2 ring-card dark:ring-card z-10",
                                        alert.type === 'critical' ? "bg-error-soft text-error" : "bg-warning-soft dark:bg-primary/10 text-warning dark:text-primary"
                                    )}>
                                        {alert.type === 'critical' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                                    </div>
                                    <div className="flex-1 min-w-0 p-3 rounded-xl border bg-card dark:bg-card border-border dark:border-primary/20 hover:bg-surface dark:hover:bg-hover transition-colors cursor-pointer"
                                        onClick={() => typeof alert.action === 'function' && alert.action()}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && typeof alert.action === 'function') alert.action(); }}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-bold text-[11px] text-main dark:text-main">{alert.title}</h3>
                                            <span className="text-[9px] text-muted dark:text-dim shrink-0">{idx === 0 ? 'الآن' : `منذ ${idx}${idx === 1 ? ' دقيقة' : ' دقائق'}`}</span>
                                        </div>
                                        <p className="text-[10px] text-muted dark:text-muted mt-0.5 line-clamp-1">{alert.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative flex gap-3 py-2">
                            <div className="w-[30px] h-[30px] rounded-lg bg-success-soft flex items-center justify-center shrink-0 ring-2 ring-card dark:ring-card">
                                <CheckCircle2 size={14} className="text-success" />
                            </div>
                            <div className="flex-1 min-w-0 p-3 rounded-xl border border-border dark:border-primary/20 bg-success-soft/50 dark:bg-success/5">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-bold text-[11px] text-success">كل الأنظمة تعمل</h3>
                                    <span className="text-[9px] text-muted dark:text-dim shrink-0">الآن</span>
                                </div>
                                <p className="text-[10px] text-muted dark:text-muted mt-0.5">لا توجد مشاكل في النظام</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Room Alerts — Timeline */}
            {activeTab === 'room' && (
                <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
                    {roomAlerts.length > 0 ? (
                        <div className="relative">
                            <div className="absolute start-[15px] top-2 bottom-2 w-px bg-divider dark:bg-primary/20" />
                            {roomAlerts.map((alert, idx) => (
                                <div key={alert.id} className="flex gap-3 relative pb-3">
                                    <div className="w-[30px] h-[30px] rounded-lg bg-primary-soft dark:bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-card dark:ring-card z-10">
                                        <alert.icon size={12} className="text-primary dark:text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0 p-3 rounded-xl border border-border dark:border-primary/20 bg-card dark:bg-card hover:bg-surface dark:hover:bg-hover transition-colors">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="text-[11px] font-bold text-main dark:text-main truncate">{alert.title}</h4>
                                            <span className="text-[9px] text-muted dark:text-dim shrink-0">{idx === 0 ? 'الآن' : `منذ ${idx}${idx === 1 ? ' دقيقة' : ' دقائق'}`}</span>
                                        </div>
                                        <p className="text-[10px] text-muted dark:text-muted line-clamp-1">{alert.description}</p>
                                        <div className="flex gap-1.5 mt-2">
                                            {alert.actionLabel === 'واتساب' ? (
                                                <Button onClick={alert.action} size="sm" className="h-6 px-2.5 rounded-lg text-[9px] font-bold bg-success text-on-success">
                                                    واتساب
                                                </Button>
                                            ) : (
                                                <Button onClick={alert.action} variant="outline" size="sm" className="h-6 px-2.5 rounded-lg text-[9px] font-bold">
                                                    عرض
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative flex gap-3 py-2">
                            <div className="w-[30px] h-[30px] rounded-lg bg-success-soft flex items-center justify-center shrink-0 ring-2 ring-card dark:ring-card">
                                <Info size={14} className="text-success" />
                            </div>
                            <div className="flex-1 min-w-0 p-3 rounded-xl border border-border dark:border-primary/20 bg-success-soft/50 dark:bg-success/5">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-bold text-[11px] text-success">كل الأنظمة تعمل</h3>
                                    <span className="text-[9px] text-muted dark:text-dim shrink-0">الآن</span>
                                </div>
                                <p className="text-[10px] text-muted dark:text-muted mt-0.5">كافة الأنظمة تعمل بشكل طبيعي</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
