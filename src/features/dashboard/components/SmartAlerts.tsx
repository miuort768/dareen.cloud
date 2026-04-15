import { useMemo } from 'react';
import { AlertTriangle, CreditCard, TrendingDown, CheckCircle2, Zap, ArrowLeft } from 'lucide-react';
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

        // 🔴 Alert 1: Students almost out of sessions
        lowBalanceStudents.forEach(s => {
            if (s.remainingSessions <= 1) {
                result.push({
                    id: `low-${s.id}-${s.subject}`,
                    type: 'critical',
                    icon: AlertTriangle,
                    color: 'rose',
                    title: `${s.studentName}`,
                    desc: `${s.subject}: باقي ${s.remainingSessions === 0 ? 'صفر حصص' : 'حصة واحدة فقط'}!`,
                    action: () => navigate('/students'),
                    actionLabel: 'تعبئة رصيد'
                });
            }
        });

        // 🟠 Alert 2: Students with high absence rate
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
                    desc: `تجاوز الغياب ${Math.round(rate)}% مؤخراً`,
                    action: () => navigate('/attendance'),
                    actionLabel: 'السجل'
                });
            }
        });

        // 🔵 Alert 3: Unpaid invoices
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
                title: `${overdueInvoices.length} فواتير متأخرة`,
                desc: `تحصيل مالي مطلوب للفواتير القديمة`,
                action: () => navigate('/studentInvoices'),
                actionLabel: 'التحصيل'
            });
        }

        if (result.length === 0) {
            result.push({
                id: 'all-good',
                type: 'success',
                icon: CheckCircle2,
                color: 'emerald',
                title: 'كل شيء يسير بمنتهى الدقة!',
                desc: 'لا توجد مشاكل معلقة حالياً.',
                action: null,
                actionLabel: ''
            });
        }

        return result;
    }, [students, sessions, studentInvoices, lowBalanceStudents, navigate]);

    const colorMap: any = {
        rose: { bg: 'bg-rose-500/5', border: 'border-rose-500/10', icon: 'bg-rose-500 text-white shadow-rose-500/20', text: 'text-rose-600', sub: 'text-rose-500/70', btn: 'bg-rose-500 text-white' },
        amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/10', icon: 'bg-amber-500 text-white shadow-amber-500/20', text: 'text-amber-600', sub: 'text-amber-500/70', btn: 'bg-amber-500 text-white' },
        indigo: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/10', icon: 'bg-indigo-500 text-white shadow-indigo-500/20', text: 'text-indigo-600', sub: 'text-indigo-500/70', btn: 'bg-indigo-500 text-white' },
        emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', icon: 'bg-emerald-500 text-white shadow-emerald-500/20', text: 'text-emerald-600', sub: 'text-emerald-500/70', btn: '' },
    };

    return (
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <Zap size={24} className="fill-indigo-600" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">التنبيهات الذكية</h4>
                        <p className="text-sm font-medium text-gray-400">إشعارات النظام العاجلة</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {alerts.map(alert => {
                    const c = colorMap[alert.color] || colorMap.indigo;
                    const Icon = alert.icon;
                    return (
                        <div key={alert.id} className={cn("p-5 border-2 flex items-center gap-5 rounded-[2rem] transition-all hover:scale-[1.02]", c.bg, c.border)}>
                            <div className={cn("w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl shadow-lg transform -rotate-3", c.icon)}>
                                <Icon size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("font-bold text-sm tracking-tight", c.text)}>{alert.title}</p>
                                <p className={cn("text-[11px] font-medium mt-1 uppercase tracking-wider", c.sub)}>{alert.desc}</p>
                            </div>
                            {alert.action && (
                                <button
                                    onClick={alert.action}
                                    className={cn("shrink-0 p-3 rounded-xl transition-all hover:scale-110", c.btn)}
                                >
                                    <ArrowLeft size={16} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
