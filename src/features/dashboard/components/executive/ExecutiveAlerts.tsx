import { memo, useState } from 'react';
import type { ExecutiveAlerts as AlertsType } from '../../services/executiveService';
import { AlertTriangle, XCircle, Info, Clock, Bell } from 'lucide-react';

const SEVERITY_CONFIG: Record<string, { icon: typeof XCircle; activeBg: string; rowBg: string; text: string; dot: string; label: string }> = {
    critical: { icon: XCircle, activeBg: 'bg-error', rowBg: 'bg-error/5', text: 'text-error', dot: 'bg-error', label: 'حرج' },
    warning: { icon: AlertTriangle, activeBg: 'bg-warning', rowBg: 'bg-warning/5', text: 'text-warning', dot: 'bg-warning', label: 'تحذير' },
    reminder: { icon: Clock, activeBg: 'bg-info', rowBg: 'bg-info/5', text: 'text-info', dot: 'bg-info', label: 'تذكير' },
    info: { icon: Info, activeBg: 'bg-muted', rowBg: 'bg-muted/5', text: 'text-muted', dot: 'bg-muted', label: 'معلومة' },
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
        <div className="bg-card border border-border/50 shadow-soft rounded-card p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bell size={16} className="text-muted" />
                    <h3 className="text-xs text-muted">التنبيهات</h3>
                </div>
                {counts.critical > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-error text-on-error text-micro font-bold">
                        {counts.critical}
                    </span>
                )}
            </div>

            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
                {(['all', 'critical', 'warning', 'reminder', 'info'] as const).map((key) => {
                    const isActive = filter === key;
                    const cfg = key === 'all' ? { activeBg: 'bg-muted', text: 'text-muted', label: 'الكل' } : SEVERITY_CONFIG[key];
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                                isActive
                                    ? `text-on-primary shadow-sm border-0 ${cfg.activeBg}`
                                    : 'text-muted border border-border/30 hover:bg-surface/50'
                            }`}
                        >
                            {cfg.label} ({counts[key]})
                        </button>
                    );
                })}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
                {filtered.length === 0 && (
                    <p className="text-xs text-muted text-center py-8">لا توجد تنبيهات</p>
                )}
                {filtered.map((alert, i) => {
                    const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                    const Icon = cfg.icon;
                    return (
                        <div
                            key={`alert-${i}`}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent hover:border-border/20 group ${cfg.rowBg}`}
                        >
                            <div className="relative mt-0.5 flex-shrink-0">
                                <Icon size={18} className={cfg.text} />
                                <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${cfg.dot}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-main leading-relaxed">{alert.message}</p>
                                {alert.time && <p className="text-xs text-muted mt-0.5">{alert.time}</p>}
                            </div>
                            {alert.count && (
                                <span className="text-micro font-bold text-muted flex-shrink-0 self-center">+{alert.count}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
