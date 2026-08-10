import { AlertCircle, Clock, AlertTriangle, Info, ChevronLeft } from 'lucide-react';
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
            desc: expired.slice(0, 2).map(s => s.studentName).join('، ') + (expired.length > 2 ? ` و${expired.length - 2} آخرين` : '')
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
            desc: low.slice(0, 2).map(s => `${s.studentName} (${s.remainingSessions} حصص)`).join('، ') + (low.length > 2 ? ` و${low.length - 2} آخرين` : '')
        });
    }

    focusStudents.slice(0, 2).forEach(f => {
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
            <h3 className="text-[13px] font-bold text-main dark:text-main mb-3 flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", expired.length > 0 ? 'bg-error' : low.length > 0 ? 'bg-warning' : 'bg-success')} />
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
            <div className="space-y-2.5">
                {alerts.map((alert, i) => (
                    <div key={`alert-${i}`} className={cn(
                        "relative flex items-start gap-3 p-3.5 rounded-xl border overflow-hidden group cursor-pointer transition-all duration-200 hover:shadow-sm",
                        alert.bg, alert.border
                    )}>
                        <div className={cn("absolute start-0 top-0 bottom-0 w-0.5", alert.accent, "dark:bg-primary/60")} />
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", alert.bg.replace('/0.04', '/0.08'), "dark:bg-primary/5")}>
                            <alert.icon size={16} className={alert.iconColor} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={cn("text-[13px] font-bold mb-0.5", alert.text)}>{alert.title}</p>
                            <p className="text-[11px] font-medium text-muted dark:text-muted line-clamp-2 leading-relaxed">{alert.desc}</p>
                        </div>
                        <ChevronLeft size={14} className="text-muted dark:text-muted shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
    );
};