import { memo } from 'react';
import type { SystemHealth } from '../../services/executiveService';
import { HardDrive, Database, Server, Cpu, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { ProgressBar } from '../../../../shared/components/ui';

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
    healthy: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
};

const STATUS_STYLES: Record<string, { text: string; bg: string; bgLight: string; bgBadge: string }> = {
    healthy: { text: 'text-success', bg: 'bg-success', bgLight: 'bg-success-soft', bgBadge: 'bg-success-soft' },
    warning: { text: 'text-warning', bg: 'bg-warning', bgLight: 'bg-warning-soft', bgBadge: 'bg-warning-soft' },
    critical: { text: 'text-error', bg: 'bg-error', bgLight: 'bg-error-soft', bgBadge: 'bg-error-soft' },
};

const DEFAULT_STYLE = { text: 'text-muted', bg: 'bg-muted', bgLight: 'bg-muted/10', bgBadge: 'bg-muted/15' };

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
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-all hover:bg-surface/30">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${styles.bgLight}`}>
                    <Icon size={15} className={styles.text} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-main">{label}</p>
                    {detail && <p className="text-micro text-muted mt-0.5">{detail}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2.5">
                    {progress !== undefined && (
                    <div className="flex items-center gap-2">
                        <ProgressBar value={Math.min(100, progress)} variant={progress > 80 ? 'error' : progress > 60 ? 'warning' : 'success'} className="w-16" trackClassName="bg-border/30" />
                        {progressLabel && <span className={`text-micro font-medium tabular-nums ${styles.text}`}>{progressLabel}</span>}
                    </div>
                )}
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro font-semibold ${styles.bgBadge} ${styles.text}`}
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
        <div className="bg-card border border-border/50 shadow-soft rounded-card p-5">
            <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-muted" />
                <h3 className="text-xs text-muted">حالة النظام</h3>
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

            <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-micro text-muted">
                <span>مدة التشغيل: {uptimeHours}h</span>
                <span>Node: {health.node || 'N/A'}</span>
            </div>
        </div>
    );
});
