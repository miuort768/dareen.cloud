import { memo } from 'react';
import type { SystemHealth } from '../../services/executiveService';
import { HardDrive, Database, Server, Cpu, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
    healthy: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
};

const STATUS_BG: Record<string, string> = {
    healthy: 'var(--bg-success)',
    warning: 'var(--bg-warning)',
    critical: 'var(--bg-error)',
};

const STATUS_TEXT: Record<string, string> = {
    healthy: 'var(--text-on-success)',
    warning: 'var(--text-on-warning)',
    critical: 'var(--text-on-error)',
};

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
    const color = STATUS_BG[status] || 'var(--text-muted)';
    const textColor = STATUS_TEXT[status] || 'var(--text-muted)';

    return (
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-all hover:bg-surface/30 dark:hover:bg-card/30">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                    <Icon size={15} style={{ color }} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-main dark:text-on-primary/90">{label}</p>
                    {detail && <p className="text-micro text-muted/60 mt-0.5">{detail}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2.5">
                {progress !== undefined && (
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-border/30 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, progress)}%`, backgroundColor: color }}
                            />
                        </div>
                        {progressLabel && <span className="text-micro font-medium tabular-nums" style={{ color }}>{progressLabel}</span>}
                    </div>
                )}
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro font-semibold backdrop-blur-sm"
                    style={{ backgroundColor: color + '20', color }}
                >
                    <StatusIcon size={10} />
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
    const dbStatus = getDbStatus();

    const getRedisStatus = () => {
        if (health.redis?.status === 'connected') return 'healthy';
        if (health.redis?.fallbacks > 0) return 'warning';
        return 'critical';
    };
    const redisStatus = getRedisStatus();

    const memPercent = health.memory?.usagePercent || 0;
    const memStatus = memPercent > 90 ? 'critical' : memPercent > 75 ? 'warning' : 'healthy';

    const cpuLoad = health.cpu?.load || 0;
    const cpuStatus = cpuLoad > 90 ? 'critical' : cpuLoad > 70 ? 'warning' : 'healthy';

    const uptimeHours = health.uptime ? Math.round(health.uptime / 3600) : 0;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 dark:border-border/50 shadow-lg shadow-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/5 via-transparent to-surface/10 dark:from-primary-soft/5 dark:to-surface/10 pointer-events-none" />
            <div className="relative p-5">
                <div className="flex items-center gap-2 mb-2">
                    <Activity size={16} className="text-muted/60" />
                    <h3 className="text-sm font-semibold text-muted dark:text-muted/80">حالة النظام</h3>
                </div>

                <div className="space-y-0">
                    <StatusRow
                        icon={Database}
                        label="قاعدة البيانات"
                        status={dbStatus}
                        detail={health.database?.latency > 0 ? `${health.database.latency}ms` : undefined}
                    />
                    <StatusRow
                        icon={HardDrive}
                        label="Redis"
                        status={redisStatus}
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

                <div className="mt-3 pt-3 border-t border-border/30 dark:border-border/20 flex items-center justify-between text-micro text-muted/50">
                    <span>مدة التشغيل: {uptimeHours}h</span>
                    <span>Node: {health.node || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
});
