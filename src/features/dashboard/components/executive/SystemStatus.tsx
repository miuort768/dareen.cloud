import { memo } from 'react';
import { SystemHealth } from '../../services/executiveService';
import { HardDrive, Database, Server, Cpu, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
    healthy: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
};

export const SystemStatus = memo(function SystemStatus({ health }: { health: SystemHealth }) {
    if (!health) return null;

    const getDbStatus = () => {
        if (health.database?.status === 'connected') return 'healthy';
        if (health.database?.status === 'error') return 'critical';
        return 'warning';
    };
    const dbStatus = getDbStatus();
    const dbCfg = STATUS_ICONS[dbStatus];
    const DbIcon = dbCfg;

    const getRedisStatus = () => {
        if (health.redis?.status === 'connected') return 'healthy';
        if (health.redis?.fallbacks > 0) return 'warning';
        return 'critical';
    };
    const redisStatus = getRedisStatus();
    const redisCfg = STATUS_ICONS[redisStatus];
    const RedisIcon = redisCfg;

    const memPercent = health.memory?.usagePercent || 0;
    const memStatus = memPercent > 90 ? 'critical' : memPercent > 75 ? 'warning' : 'healthy';
    const memCfg = STATUS_ICONS[memStatus];
    const MemIcon = memCfg;

    const cpuLoad = health.cpu?.load || 0;
    const cpuStatus = cpuLoad > 90 ? 'critical' : cpuLoad > 70 ? 'warning' : 'healthy';
    const cpuCfg = STATUS_ICONS[cpuStatus];
    const CpuIconC = cpuCfg;

    const uptimeHours = Math.round(health.uptime / 3600);

    const statusColor = (s: string) => s === 'healthy' ? '#22c55e' : s === 'warning' ? '#f59e0b' : '#ef4444';

    return (
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">حالة النظام</h3>
                <Server size={18} className="text-gray-500" />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">قاعدة البيانات</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <DbIcon size={16} style={{ color: statusColor(dbStatus) }} />
                        <span className="text-xs" style={{ color: statusColor(dbStatus) }}>
                            {health.database?.status === 'connected' ? 'متصل' : health.database?.status === 'error' ? 'خطأ' : 'غير معروف'}
                        </span>
                        {health.database?.latency > 0 && (
                            <span className="text-[10px] text-gray-400">{health.database.latency}ms</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HardDrive size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Redis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <RedisIcon size={16} style={{ color: statusColor(redisStatus) }} />
                        <span className="text-xs" style={{ color: statusColor(redisStatus) }}>
                            {health.redis?.status === 'connected' ? 'متصل' : health.redis?.fallbacks > 0 ? `تجاوز ${health.redis.fallbacks}` : 'غير متصل'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Server size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">الذاكرة</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MemIcon size={16} style={{ color: statusColor(memStatus) }} />
                        <span className="text-xs" style={{ color: statusColor(memStatus) }}>
                            {health.memory ? `${Math.round(health.memory.used / 1024 / 1024)}/${Math.round(health.memory.total / 1024 / 1024)} MB` : 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">المعالج</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium" style={{ color: statusColor(cpuStatus) }}>
                            {cpuLoad.toFixed(1)}% {health.cpu?.cores && `(${health.cpu.cores} نوى)`}
                        </span>
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>مدة التشغيل: {uptimeHours}h</span>
                        <span>Node: {health.node || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});
