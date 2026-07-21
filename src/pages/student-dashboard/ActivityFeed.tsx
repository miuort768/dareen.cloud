import { GlassCard } from '@/shared/components/ui';

interface PointLog {
    amount: number;
    action: string;
}

interface ActivityFeedProps {
    pointLogs: PointLog[];
}

export const ActivityFeed = ({ pointLogs }: ActivityFeedProps) => {
    if (pointLogs.length === 0) return null;

    return (
        <div className="px-4 py-3">
            <h2 className="text-lg font-bold text-main mb-3 text-start">آخر النشاطات</h2>
            <div className="space-y-2">
                {pointLogs.slice(0, 3).map((log, i) => (
                    <GlassCard key={`item-${i}`} className="px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-success bg-success-soft px-2 py-1 rounded-card">+{log.amount} نقطة</span>
                        <span className="text-xs text-muted font-medium">{log.action}</span>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
