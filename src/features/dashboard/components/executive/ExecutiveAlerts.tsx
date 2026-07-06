import { memo, useState } from 'react';
import { ExecutiveAlerts as AlertsType } from '../../services/executiveService';
import { AlertTriangle, XCircle, Info, Clock } from 'lucide-react';

const SEVERITY_CONFIG = {
    critical: { icon: XCircle, color: 'var(--bg-error)', bg: 'rgba(244,63,94,0.05)', label: 'حرج' },
    warning: { icon: AlertTriangle, color: 'var(--bg-warning)', bg: 'rgba(245,158,11,0.05)', label: 'تحذير' },
    reminder: { icon: Clock, color: 'var(--bg-info)', bg: 'rgba(59,130,246,0.05)', label: 'تذكير' },
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
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:bg-card border border-border dark:border-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted dark:text-muted">التنبيهات</h3>
                {counts.critical > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error text-on-primary text-[10px] font-bold">
                        {counts.critical}
                    </span>
                )}
            </div>

            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                {(['all', 'critical', 'warning', 'reminder', 'info'] as const).map((key) => {
                    const isActive = filter === key;
                    const cfg = key === 'all' ? { color: 'var(--text-muted)', label: 'الكل' } : SEVERITY_CONFIG[key];
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                isActive
                                    ? 'text-on-primary'
                                    : 'bg-transparent border'
                            }`}
                            style={{
                                backgroundColor: isActive ? (cfg.color) : 'transparent',
                                borderColor: isActive ? 'transparent' : cfg.color,
                                color: isActive ? '#fff' : cfg.color,
                            }}
                        >
                            {cfg.label} ({counts[key]})
                        </button>
                    );
                })}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
                {filtered.length === 0 && (
                    <p className="text-xs text-muted dark:text-muted text-center py-4">لا توجد تنبيهات</p>
                )}
                {filtered.map((alert, i) => {
                    const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                    const Icon = cfg.icon;
                    return (
                        <div
                            key={i}
                            className="flex items-start gap-3 p-2.5 rounded-xl transition-all hover:bg-surface dark:hover:bg-card/50"
                            style={{ backgroundColor: cfg.bg + '66' }}
                        >
                            <Icon size={20} style={{ color: cfg.color }} className="mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-main dark:text-on-primary">{alert.message}</p>
                                {alert.time && <p className="text-xs text-muted mt-0.5">{alert.time}</p>}
                            </div>
                            {alert.count && (
                                <span className="text-xs font-bold text-muted dark:text-muted flex-shrink-0">+{alert.count}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
