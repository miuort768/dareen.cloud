import { AlertCircle, Clock, AlertTriangle, Info, ChevronLeft, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';
import type { LowBalanceStudent } from '../types';

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

    const alerts: { icon: ComponentType<{ className?: string; size?: number }>; border: string; bg: string; text: string; iconColor: string; accent: string; title: string; desc: string }[] = [];

    if (expired.length > 0) {
        alerts.push({
            icon: AlertCircle,
            border: 'border-error/30',
            bg: 'bg-error/[0.04]',
            text: 'text-error',
            iconColor: 'text-error',
            accent: 'bg-error',
            title: `${expired.length} طالب منتهي اشتراكهم`,
            desc: expired.slice(0, 3).map(s => s.studentName).join('، ') + (expired.length > 3 ? ` و${expired.length - 3} آخرين` : '')
        });
    }

    if (low.length > 0) {
        alerts.push({
            icon: Clock,
            border: 'border-warning/30',
            bg: 'bg-warning/[0.04]',
            text: 'text-warning',
            iconColor: 'text-warning',
            accent: 'bg-warning',
            title: `${low.length} طالب رصيدهم على وشك النفاد`,
            desc: low.slice(0, 3).map(s => `${s.studentName} (${s.remainingSessions} حصص)`).join('، ') + (low.length > 3 ? ` و${low.length - 3} آخرين` : '')
        });
    }

    focusStudents.slice(0, 3).forEach(f => {
        alerts.push({
            icon: AlertTriangle,
            border: 'border-warning/40',
            bg: 'bg-warning/[0.04]',
            text: 'text-warning',
            iconColor: 'text-warning',
            accent: 'bg-warning',
            title: f.name,
            desc: f.reason
        });
    });

    if (alerts.length === 0) {
        alerts.push({
            icon: Info,
            border: 'border-success/30',
            bg: 'bg-success/[0.04]',
            text: 'text-success',
            iconColor: 'text-success',
            accent: 'bg-success',
            title: 'كل شيء على ما يرام',
            desc: 'لا توجد تنبيهات حالياً'
        });
    }

    const urgencyLabel = expired.length > 0 ? 'عاجل' : low.length > 0 ? 'مهم' : '';

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-main dark:text-main flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft dark:bg-primary/10 flex items-center justify-center shrink-0">
                        <BellRing size={15} className="text-primary dark:text-primary" />
                    </div>
                    مركز التنبيهات
                    {urgencyLabel && (
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold",
                            expired.length > 0 ? 'bg-error/15 text-error' : 'bg-warning/15 text-warning'
                        )}>
                            {urgencyLabel}
                        </span>
                    )}
                </h3>
                <span className="text-[10px] font-bold text-muted dark:text-muted px-2.5 py-1 rounded-lg bg-surface dark:bg-hover border border-border dark:border-border">
                    {alerts.length} تنبيه
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {alerts.map((alert, i) => (
                    <div
                        key={`alert-${i}`}
                        className={cn(
                            "relative flex items-start gap-3 p-4 rounded-xl border overflow-hidden group cursor-pointer transition-all duration-200 hover:shadow-sm",
                            alert.bg, alert.border
                        )}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); }}
                    >
                        <div className={cn("absolute start-0 top-0 bottom-0 w-1", alert.accent)} />
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-card dark:bg-hover border border-border dark:border-border")}>
                            <alert.icon size={17} className={alert.iconColor} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={cn("text-[13px] font-bold mb-1 flex items-center gap-1.5", alert.text)}>
                                {alert.title}
                            </p>
                            <p className="text-[11px] font-medium text-muted dark:text-muted line-clamp-2 leading-relaxed">{alert.desc}</p>
                        </div>
                        <ChevronLeft size={14} className="text-muted dark:text-muted shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
    );
};