import { useMemo } from 'react';
import { AlertTriangle, CreditCard, TrendingDown, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface SmartAlertsProps {
    students: any[];
    sessions: any[];
    studentInvoices: any[];
    lowBalanceStudents: any[];
}

export const SmartAlerts = ({ students, sessions, studentInvoices, lowBalanceStudents }: SmartAlertsProps) => {
    const navigate = useNavigate();

    const alerts = useMemo(() => {
        const result: any[] = [];

        // 🔴 Alert 1: Students almost out of sessions (1 or 0 remaining)
        lowBalanceStudents.forEach(s => {
            if (s.remainingSessions <= 1) {
                result.push({
                    id: `low-${s.id}-${s.subject}`,
                    type: 'critical',
                    icon: AlertTriangle,
                    color: 'rose',
                    title: `${s.studentName} — ${s.subject}`,
                    desc: `باقي ${s.remainingSessions === 0 ? 'صفر حصص' : 'حصة واحدة فقط'} من رصيده!`,
                    action: () => navigate('/students'),
                    actionLabel: 'عرض الطالب'
                });
            }
        });

        // 🟠 Alert 2: Students with high absence rate (>30%)
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
                    title: `${s.name} — غياب مرتفع`,
                    desc: `نسبة الغياب ${Math.round(rate)}% (${absent} من ${studentSessions.length} حصة)`,
                    action: () => navigate('/attendance'),
                    actionLabel: 'سجل الحضور'
                });
            }
        });

        // 🔵 Alert 3: Unpaid invoices older than 7 days
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const overdueInvoices = studentInvoices.filter(inv => {
            if (!['unpaid', 'pending', 'overdue'].includes(inv.status?.toLowerCase())) return false;
            const created = new Date(inv.date || inv.created_at || 0).getTime();
            return (now - created) > sevenDays;
        });

        if (overdueInvoices.length > 0) {
            result.push({
                id: 'overdue-invoices',
                type: 'warning',
                icon: CreditCard,
                color: 'blue',
                title: `${overdueInvoices.length} فاتورة متأخرة`,
                desc: `فواتير غير مدفوعة منذ أكثر من أسبوع تحتاج متابعة`,
                action: () => navigate('/studentInvoices'),
                actionLabel: 'عرض الفواتير'
            });
        }

        // 🟢 Alert 4: All good!
        if (result.length === 0) {
            result.push({
                id: 'all-good',
                type: 'success',
                icon: CheckCircle2,
                color: 'emerald',
                title: 'كل شيء على ما يرام!',
                desc: 'لا توجد تنبيهات حرجة تحتاج إلى تدخل الآن.',
                action: null,
                actionLabel: ''
            });
        }

        return result;
    }, [students, sessions, studentInvoices, lowBalanceStudents]);

    const colorMap: any = {
        rose: { bg: 'bg-rose-50 dark:bg-rose-900/10', border: 'border-rose-200 dark:border-rose-800/40', icon: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-900 dark:text-rose-200', sub: 'text-rose-600 dark:text-rose-400', btn: 'bg-rose-600 hover:bg-rose-700 text-white' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800/40', icon: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-900 dark:text-amber-200', sub: 'text-amber-600 dark:text-amber-400', btn: 'bg-amber-600 hover:bg-amber-700 text-white' },
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800/40', icon: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-900 dark:text-blue-200', sub: 'text-blue-600 dark:text-blue-400', btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800/40', icon: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-900 dark:text-emerald-200', sub: 'text-emerald-600 dark:text-emerald-400', btn: '' },
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm" dir="rtl">
            <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500" />
                    مركز التنبيهات الذكية
                </h4>
                <span className={cn(
                    "text-[10px] font-black px-2 py-1 tracking-widest",
                    alerts.some(a => a.type === 'critical') ? 'bg-rose-100 text-rose-700' :
                    alerts.some(a => a.type === 'warning') ? 'bg-amber-100 text-amber-700' : 
                    'bg-emerald-100 text-emerald-700'
                )}>
                    {alerts.filter(a => a.type !== 'success').length > 0 
                        ? `${alerts.filter(a => a.type !== 'success').length} تنبيه` 
                        : 'لا توجد مشاكل'}
                </span>
            </div>
            <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
                {alerts.map(alert => {
                    const c = colorMap[alert.color] || colorMap.blue;
                    const Icon = alert.icon;
                    return (
                        <div key={alert.id} className={cn("p-4 border flex items-start gap-4", c.bg, c.border)}>
                            <div className={cn("p-2 flex-shrink-0", c.icon)}>
                                <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("font-black text-sm truncate", c.text)}>{alert.title}</p>
                                <p className={cn("text-[11px] font-bold mt-1", c.sub)}>{alert.desc}</p>
                            </div>
                            {alert.action && (
                                <button
                                    onClick={alert.action}
                                    className={cn("flex-shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all", c.btn)}
                                >
                                    {alert.actionLabel}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
