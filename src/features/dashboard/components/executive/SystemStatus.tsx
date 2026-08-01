import { memo } from 'react';
import type { SystemHealth } from '../../services/executiveService';
import { HardDrive, Database, Server, Cpu, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
    healthy: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
};

const STATUS_STYLES: Record<string, { text: string; bg: string; badge: string }> = {
    healthy: { text: 'text-success', bg: 'bg-success-soft', badge: 'bg-success-soft text-success border-border' },
    warning: { text: 'text-warning', bg: 'bg-warning-soft', badge: 'bg-warning-soft text-warning border-border' },
    critical: { text: 'text-error', bg: 'bg-error-soft', badge: 'bg-error-soft text-error border-border' },
};

const DEFAULT_STYLE = { text: 'text-muted', bg: 'bg-surface', badge: 'bg-surface text-muted border-border' };

interface StatusRowProps {
    icon: typeof Server;
    label: string;
    status: string;
    detail?: string;
    progress?: number;
    progressLabel?: string;
}

const StatusRow = memo(function StatusRow({ icon: Icon, label, status, detail, progress, progressLabel }: StatusRowProps) {
    const StatusIcon = STATUS_ICONS[status] || Activity;
    const styles = STATUS_STYLES[status] || DEFAULT_STYLE;

    return (
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-surface transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", styles.bg)}>
                    <Icon size={14} className={styles.text} />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-bold text-main">{label}</p>
                    {detail && <p className="text-[9px] text-muted mt-0.5">{detail}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2.5">
                {progress !== undefined && (
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-hover overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-700", progress > 80 ? "bg-error" : progress > 60 ? "bg-warning" : "bg-success")}
                                style={{ width: `${Math.min(100, progress)}%` }}
                            />
                        </div>
                        {progressLabel && <span className={cn("text-[9px] font-bold tabular-nums", styles.text)}>{progressLabel}</span>}
                    </div>
                )}
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border", styles.badge)}>
                    <StatusIcon size={9} />
                    {status === 'healthy' ? 'سليم' : status === 'warning' ? 'تحذير' : 'خطأ'}
                </span>
            </div>
        </div>
    );
});

export const SystemStatus = memo(function SystemStatus({ health }: { health: SystemHealth }) {
    if (!health) return null;

    const getDbStatus = () => {
        if (health.database?.status === 'connected') return 'healthy';
        if (health.database?.status === 'error') return 'critical';
        return 'warning';
    };

    const getRedisStatus = () => {
        if (health.redis?.status === 'connected') return 'healthy';
        if (health.redis?.fallbacks > 0) return 'warning';
        return 'critical';
    };

    const memPercent = health.memory?.usagePercent || 0;
    const memStatus = memPercent > 90 ? 'critical' : memPercent > 75 ? 'warning' : 'healthy';

    const cpuLoad = health.cpu?.load || 0;
    const cpuStatus = cpuLoad > 90 ? 'critical' : cpuLoad > 70 ? 'warning' : 'healthy';

    const uptimeHours = health.uptime ? Math.round(health.uptime / 3600) : 0;

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-info-soft flex items-center justify-center">
                    <Activity size={16} className="text-info" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-main">حالة النظام</h3>
                    <p className="text-[10px] text-muted">البنية التحتية</p>
                </div>
            </div>

            <div className="space-y-0">
                <StatusRow
                    icon={Database}
                    label="قاعدة البيانات"
                    status={getDbStatus()}
                    detail={health.database?.latency > 0 ? `${health.database.latency}ms` : undefined}
                />
                <StatusRow
                    icon={HardDrive}
                    label="Redis"
                    status={getRedisStatus()}
                    detail={health.redis?.fallbacks > 0 ? `تجاوز ${health.redis.fallbacks}` : undefined}
                />
                <StatusRow
                    icon={Server}
                    label="الذاكرة"
                    status={memStatus}
                    progress={memPercent}
                    progressLabel={health.memory ? `${Math.round(health.memory.used / 1024 / 1024)}/${Math.round(health.memory.total / 1024 / 1024)} MB` : undefined}
                />
                <StatusRow
                    icon={Cpu}
                    label="المعالج"
                    status={cpuStatus}
                    progress={cpuLoad}
                    progressLabel={health.cpu?.cores ? `${cpuLoad.toFixed(1)}% (${health.cpu.cores} نوى)` : `${cpuLoad.toFixed(1)}%`}
                />
            </div>

            <div className="mt-3 pt-3 border-t border-divider flex items-center justify-between text-[9px] text-muted">
                <span>مدة التشغيل: {uptimeHours}h</span>
                <span>Node: {health.node || 'N/A'}</span>
            </div>
        </div>
    );
});
