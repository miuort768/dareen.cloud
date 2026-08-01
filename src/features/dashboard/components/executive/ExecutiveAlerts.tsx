import { memo, useState } from 'react';
import type { ExecutiveAlerts as AlertsType } from '../../services/executiveService';
import { AlertTriangle, XCircle, Info, Clock, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG: Record<string, { icon: typeof XCircle; rowBg: string; text: string; dot: string; label: string }> = {
    critical: { icon: XCircle, rowBg: 'bg-error-soft border-border', text: 'text-error', dot: 'bg-error', label: 'حرج' },
    warning: { icon: AlertTriangle, rowBg: 'bg-warning-soft border-border', text: 'text-warning', dot: 'bg-warning', label: 'تحذير' },
    reminder: { icon: Clock, rowBg: 'bg-info-soft border-border', text: 'text-info', dot: 'bg-info', label: 'تذكير' },
    info: { icon: Info, rowBg: 'bg-surface border-border', text: 'text-muted', dot: 'bg-muted', label: 'معلومة' },
};

type SeverityKey = keyof typeof SEVERITY_CONFIG;

export const ExecutiveAlerts = memo(function ExecutiveAlerts({ alerts }: { alerts: AlertsType }) {
    const [filter, setFilter] = useState<SeverityKey | 'all'>('all');
    if (!alerts) return null;

    const allAlerts = [
        ...(alerts.critical || []).map(a => ({ ...a, severity: 'critical' as SeverityKey })),
        ...(alerts.warning || []).map(a => ({ ...a, severity: 'warning' as SeverityKey })),
        ...(alerts.reminder || []).map(a => ({ ...a, severity: 'reminder' as SeverityKey })),
        ...(alerts.info || []).map(a => ({ ...a, severity: 'info' as SeverityKey })),
    ];

    const counts = {
        all: allAlerts.length,
        critical: alerts.critical?.length || 0,
        warning: alerts.warning?.length || 0,
        reminder: alerts.reminder?.length || 0,
        info: alerts.info?.length || 0,
    };

    const filtered = filter === 'all' ? allAlerts : allAlerts.filter(a => a.severity === filter);

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-warning-soft flex items-center justify-center">
                        <Bell size={16} className="text-warning" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main">التنبيهات</h3>
                        <p className="text-[10px] text-muted">مراقبة الأنظمة</p>
                    </div>
                </div>
                {counts.critical > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-error-soft text-error border border-border">
                        {counts.critical} حرج
                    </span>
                )}
            </div>

            <div className="flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
                {(['all', 'critical', 'warning', 'reminder', 'info'] as const).map((key) => {
                    const isActive = filter === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all",
                                isActive
                                    ? "bg-primary text-on-primary"
                                    : "text-muted hover:text-main bg-surface"
                            )}
                        >
                            {key === 'all' ? 'الكل' : SEVERITY_CONFIG[key].label} ({counts[key]})
                        </button>
                    );
                })}
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                {filtered.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-success-soft flex items-center justify-center">
                            <Info size={16} className="text-success" />
                        </div>
                        <p className="text-xs font-bold text-muted">لا توجد تنبيهات</p>
                    </div>
                )}
                {filtered.map((alert, i) => {
                    const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                    const Icon = cfg.icon;
                    return (
                        <div
                            key={`alert-${i}`}
                            className={cn("flex items-start gap-2.5 p-3 rounded-xl border transition-colors", cfg.rowBg)}
                        >
                            <div className="relative mt-0.5 shrink-0">
                                <Icon size={14} className={cfg.text} />
                                <span className={cn("absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full", cfg.dot)} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold text-main leading-relaxed">{alert.message}</p>
                                {alert.time && <p className="text-[10px] text-muted mt-0.5">{alert.time}</p>}
                            </div>
                            {alert.count && (
                                <span className="text-[10px] font-bold text-muted shrink-0">+{alert.count}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
