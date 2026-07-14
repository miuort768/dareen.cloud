import { AlertCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ComponentType } from 'react';

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

    const alerts: { icon: ComponentType<{ className?: string; size?: number }>; border: string; bg: string; text: string; iconColor: string; title: string; desc: string }[] = [];

    if (expired.length > 0) {
        alerts.push({
            icon: AlertCircle,
            border: 'border-error dark:border-error/20',
            bg: 'bg-error-light dark:bg-error/10',
            text: 'text-error dark:text-error',
            iconColor: 'text-error',
            title: `${expired.length} طالب منتهي اشتراكهم`,
            desc: expired.slice(0, 3).map(s => s.studentName).join('، ') + (expired.length > 3 ? ` و${expired.length - 3} آخرين` : '')
        });
    }

    if (low.length > 0) {
        alerts.push({
            icon: Clock,
            border: 'border-warning dark:border-warning/20',
            bg: 'bg-warning-light dark:bg-warning/10',
            text: 'text-warning dark:text-warning',
            iconColor: 'text-warning',
            title: `${low.length} طالب رصيدهم على وشك النفاد`,
            desc: low.slice(0, 3).map(s => `${s.studentName} (${s.remainingSessions} حصص)`).join('، ') + (low.length > 3 ? ` و${low.length - 3} آخرين` : '')
        });
    }

    focusStudents.slice(0, 3).forEach(f => {
        alerts.push({
            icon: AlertTriangle,
            border: 'border-warning dark:border-warning/20',
            bg: 'bg-warning-light dark:bg-warning/10',
            text: 'text-warning dark:text-warning',
            iconColor: 'text-warning',
            title: f.name,
            desc: f.reason
        });
    });

    if (alerts.length === 0) {
        alerts.push({
            icon: Info,
            border: 'border-success dark:border-success/20',
            bg: 'bg-success-light dark:bg-success/10',
            text: 'text-success dark:text-success',
            iconColor: 'text-success',
            title: 'كل شيء على ما يرام',
            desc: 'لا توجد تنبيهات حالياً'
        });
    }

    return (
        <div className="bg-white dark:bg-primary-active rounded-2xl p-5 shadow-sm border border-border dark:border-border">
            <h3 className="text-xs font-bold text-muted dark:text-muted mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                مركز التنبيهات
            </h3>
            <div className="space-y-2">
                {alerts.map((alert, i) => (
                    <div key={i} className={cn("flex items-start gap-2.5 p-3 rounded-xl border", alert.bg, alert.border)}>
                        <alert.icon size={15} className={cn("shrink-0 mt-0.5", alert.iconColor)} />
                        <div className="min-w-0">
                            <p className={cn("text-micro font-bold", alert.text)}>{alert.title}</p>
                            <p className="text-micro font-medium text-muted dark:text-muted mt-0.5 line-clamp-2">{alert.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
