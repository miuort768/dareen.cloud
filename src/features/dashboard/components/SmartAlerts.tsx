import { useMemo } from 'react';
import { AlertTriangle, CreditCard, TrendingDown, CheckCircle2, Zap, ArrowLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface SmartAlertsProps {
    students: Record<string, unknown>[];
    sessions: Record<string, unknown>[];
    studentInvoices: Record<string, unknown>[];
    lowBalanceStudents: { id: string; studentName: string; subject: string; remainingSessions: number }[];
}

export const SmartAlerts = ({ students, sessions, studentInvoices, lowBalanceStudents }: SmartAlertsProps) => {
    const navigate = useNavigate();

    const alerts = useMemo(() => {
        const result: { id: string; type: string; title: string; desc: string; action: () => void; priority: string }[] = [];

        lowBalanceStudents.forEach(s => {
            if (s.remainingSessions <= 1) {
                result.push({
                    id: `low-${s.id}-${s.subject}`,
                    type: 'critical',
                    icon: AlertTriangle,
                    color: 'rose',
                    title: `${s.studentName}`,
                    desc: `${s.subject}: باقي ${s.remainingSessions === 0 ? 'صفر' : '1'}!`,
                    action: () => navigate('/students'),
                    actionLabel: 'تعبئة'
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
                    icon: TrendingDown,
                    color: 'amber',
                    title: `${s.name}`,
                    desc: `غياب ${Math.round(rate)}%`,
                    action: () => navigate('/attendance'),
                    actionLabel: 'سجل'
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
                icon: CreditCard,
                color: 'indigo',
                title: `${overdueInvoices.length} فواتير`,
                desc: `تحصيل مالي مطلوب`,
                action: () => navigate('/student-invoices'),
                actionLabel: 'تحصيل'
            });
        }

        if (result.length === 0) {
            result.push({
                id: 'all-good',
                type: 'success',
                icon: CheckCircle2,
                color: 'emerald',
                title: 'النظام سليم',
                desc: 'لا توجد معلقات.',
                action: null,
                actionLabel: ''
            });
        }

        return result;
    }, [students, sessions, studentInvoices, lowBalanceStudents, navigate]);

    const colorMap: Record<string, string> = {
        rose: { bg: 'bg-rose-500/5', border: 'border-rose-500/10', icon: 'bg-rose-500 text-white shadow-none', text: 'text-rose-600', sub: 'text-rose-500/70', btn: 'bg-rose-500 text-white' },
        amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/10', icon: 'bg-amber-500 text-white shadow-none', text: 'text-amber-600', sub: 'text-amber-500/70', btn: 'bg-amber-500 text-white' },
        indigo: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/10', icon: 'bg-indigo-500 text-white shadow-none', text: 'text-indigo-600', sub: 'text-indigo-500/70', btn: 'bg-indigo-500 text-white' },
        emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', icon: 'bg-emerald-500 text-white shadow-none', text: 'text-emerald-600', sub: 'text-emerald-500/70', btn: '' },
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 shadow-sm rounded-none flex flex-col" dir="rtl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-none flex items-center justify-center border border-slate-200">
                        <Zap size={16} />
                    </div>
                    <div>
                        <h4 className="text-sm font-normal text-slate-900 dark:text-white uppercase tracking-tight">إخطارات ذكية</h4>
                    </div>
                </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {alerts.map(alert => {
                    const c = colorMap[alert.color] || colorMap.indigo;
                    const Icon = alert.icon;
                    return (
                        <div key={alert.id} className={cn("p-3 border border-slate-100 flex items-center gap-3 rounded-none transition-all hover:bg-white dark:hover:bg-slate-800", c.bg)}>
                            <div className={cn("w-8 h-8 shrink-0 flex items-center justify-center rounded-none", c.icon)}>
                                <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("font-normal text-[11px] tracking-tight truncate", c.text)}>{alert.title}</p>
                                <p className={cn("text-[9px] font-medium leading-none mt-1", c.sub)}>{alert.desc}</p>
                            </div>
                            {typeof alert.action === 'function' && (
                                <button
                                    onClick={alert.action}
                                    className={cn("shrink-0 p-2 rounded-none transition-all hover:brightness-110", c.btn)}
                                >
                                    <ArrowLeft size={12} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
