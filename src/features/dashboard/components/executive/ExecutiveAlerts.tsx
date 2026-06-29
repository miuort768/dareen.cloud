import { memo, useState } from 'react';
import { ExecutiveAlerts as AlertsType } from '../../services/executiveService';
import { AlertTriangle, XCircle, Info, Clock } from 'lucide-react';

const SEVERITY_CONFIG = {
    critical: { icon: XCircle, color: '#ef4444', bg: '#fef2f2', label: 'حرج' },
    warning: { icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb', label: 'تحذير' },
    reminder: { icon: Clock, color: '#3b82f6', bg: '#eff6ff', label: 'تذكير' },
    info: { icon: Info, color: '#6b7280', bg: '#f9fafb', label: 'معلومة' },
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
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">التنبيهات</h3>
                {counts.critical > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {counts.critical}
                    </span>
                )}
            </div>

            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                {(['all', 'critical', 'warning', 'reminder', 'info'] as const).map((key) => {
                    const isActive = filter === key;
                    const cfg = key === 'all' ? { color: '#6b7280', label: 'الكل' } : SEVERITY_CONFIG[key];
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                isActive
                                    ? 'text-white'
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
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">لا توجد تنبيهات</p>
                )}
                {filtered.map((alert, i) => {
                    const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                    const Icon = cfg.icon;
                    return (
                        <div
                            key={i}
                            className="flex items-start gap-3 p-2.5 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            style={{ backgroundColor: cfg.bg + '66' }}
                        >
                            <Icon size={20} style={{ color: cfg.color }} className="mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-white">{alert.message}</p>
                                {alert.time && <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>}
                            </div>
                            {alert.count && (
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">+{alert.count}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
