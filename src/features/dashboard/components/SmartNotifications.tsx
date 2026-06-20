import { AlertCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface LowBalanceStudent {
    id: string;
    studentName: string;
    remainingSessions: number;
}

interface FocusStudent {
    id: string;
    name: string;
    reason: string;
    type: string;
}

interface SmartNotificationsProps {
    lowBalanceStudents: LowBalanceStudent[];
    focusStudents: FocusStudent[];
}

export const SmartNotifications = ({ lowBalanceStudents, focusStudents }: SmartNotificationsProps) => {
    const expired = lowBalanceStudents.filter(s => s.remainingSessions === 0);
    const low = lowBalanceStudents.filter(s => s.remainingSessions > 0 && s.remainingSessions <= 2);

    const alerts: { icon: any; border: string; bg: string; text: string; iconColor: string; title: string; desc: string }[] = [];

    if (expired.length > 0) {
        alerts.push({
            icon: AlertCircle,
            border: 'border-rose-100 dark:border-rose-500/20',
            bg: 'bg-rose-50 dark:bg-rose-500/10',
            text: 'text-rose-700 dark:text-rose-300',
            iconColor: 'text-rose-500',
            title: `${expired.length} طالب منتهي اشتراكهم`,
            desc: expired.slice(0, 3).map(s => s.studentName).join('، ') + (expired.length > 3 ? ` و${expired.length - 3} آخرين` : '')
        });
    }

    if (low.length > 0) {
        alerts.push({
            icon: Clock,
            border: 'border-amber-100 dark:border-amber-500/20',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            text: 'text-amber-700 dark:text-amber-300',
            iconColor: 'text-amber-500',
            title: `${low.length} طالب رصيدهم على وشك النفاد`,
            desc: low.slice(0, 3).map(s => `${s.studentName} (${s.remainingSessions} حصص)`).join('، ') + (low.length > 3 ? ` و${low.length - 3} آخرين` : '')
        });
    }

    focusStudents.slice(0, 3).forEach(f => {
        alerts.push({
            icon: AlertTriangle,
            border: 'border-amber-100 dark:border-amber-500/20',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            text: 'text-amber-700 dark:text-amber-300',
            iconColor: 'text-amber-500',
            title: f.name,
            desc: f.reason
        });
    });

    if (alerts.length === 0) {
        alerts.push({
            icon: Info,
            border: 'border-emerald-100 dark:border-emerald-500/20',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            text: 'text-emerald-700 dark:text-emerald-300',
            iconColor: 'text-emerald-500',
            title: 'كل شيء على ما يرام',
            desc: 'لا توجد تنبيهات حالياً'
        });
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                مركز التنبيهات
            </h3>
            <div className="space-y-2">
                {alerts.map((alert, i) => (
                    <div key={i} className={cn("flex items-start gap-2.5 p-3 rounded-xl border", alert.bg, alert.border)}>
                        <alert.icon size={15} className={cn("shrink-0 mt-0.5", alert.iconColor)} />
                        <div className="min-w-0">
                            <p className={cn("text-[10px] font-bold", alert.text)}>{alert.title}</p>
                            <p className="text-[8px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{alert.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
