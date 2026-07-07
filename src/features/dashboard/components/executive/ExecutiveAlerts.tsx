import { memo, useState } from 'react';
import { ExecutiveAlerts as AlertsType } from '../../services/executiveService';
import { AlertTriangle, XCircle, Info, Clock, Bell } from 'lucide-react';

const SEVERITY_CONFIG = {
    critical: { icon: XCircle, color: 'var(--bg-error)', bg: 'rgba(244,63,94,0.08)', label: 'حرج' },
    warning: { icon: AlertTriangle, color: 'var(--bg-warning)', bg: 'rgba(245,158,11,0.08)', label: 'تحذير' },
    reminder: { icon: Clock, color: 'var(--bg-info)', bg: 'rgba(59,130,246,0.08)', label: 'تذكير' },
    info: { icon: Info, color: 'var(--text-muted)', bg: 'var(--bg-surface)', label: 'معلومة' },
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
        <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 dark:border-border/50 shadow-lg shadow-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-error/5 via-transparent to-warning/5 dark:from-error/5 dark:to-warning/5 pointer-events-none" />
            <div className="relative p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Bell size={16} className="text-muted/60" />
                        <h3 className="text-sm font-semibold text-muted dark:text-muted/80">التنبيهات</h3>
                    </div>
                    {counts.critical > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-error text-on-primary text-micro font-bold">
                            {counts.critical}
                        </span>
                    )}
                </div>

                <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
                    {(['all', 'critical', 'warning', 'reminder', 'info'] as const).map((key) => {
                        const isActive = filter === key;
                        const cfg = key === 'all' ? { color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.08)', label: 'الكل' } : SEVERITY_CONFIG[key];
                        return (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 backdrop-blur-sm ${
                                    isActive
                                        ? 'text-on-primary shadow-sm border-0'
                                        : 'text-muted/70 dark:text-muted/50 border border-border/30 hover:bg-surface/50 dark:hover:bg-card/30'
                                }`}
                                style={{
                                    backgroundColor: isActive ? cfg.color : 'transparent',
                                }}
                            >
                                {cfg.label} ({counts[key]})
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filtered.length === 0 && (
                        <p className="text-xs text-muted/50 dark:text-muted/30 text-center py-8">لا توجد تنبيهات</p>
                    )}
                    {filtered.map((alert, i) => {
                        const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-surface/50 dark:hover:bg-card/30 border border-transparent hover:border-border/20 group"
                                style={{ backgroundColor: cfg.bg }}
                            >
                                <div className="relative mt-0.5 flex-shrink-0">
                                    <Icon size={18} style={{ color: cfg.color }} />
                                    <span
                                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                                        style={{ backgroundColor: cfg.color }}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-main dark:text-on-primary/90 leading-relaxed">{alert.message}</p>
                                    {alert.time && <p className="text-xs text-muted/60 mt-0.5">{alert.time}</p>}
                                </div>
                                {alert.count && (
                                    <span className="text-micro font-bold text-muted/50 dark:text-muted/30 flex-shrink-0 self-center">+{alert.count}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
