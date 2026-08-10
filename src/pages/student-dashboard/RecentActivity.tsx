import { Star, Clock } from 'lucide-react';
import type { PointLog } from './types';

interface RecentActivityProps {
    pointLogs: PointLog[];
}

export const RecentActivity = ({ pointLogs }: RecentActivityProps) => {
    const recent = pointLogs.slice(0, 5);

    return (
        <div className="bg-card dark:bg-card border border-border dark:border-primary/20 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-main dark:text-main mb-3">آخر النشاطات</h3>

            <div className="relative">
                <div className="absolute top-0 bottom-0 end-[11px] w-px bg-border dark:bg-primary/15" />

                <div className="space-y-3">
                    {recent.map((log, i) => (
                        <div key={log.id || `log-${i}`} className="flex items-start gap-3 relative">
                            <div className="w-6 h-6 rounded-lg bg-success-soft dark:bg-primary/15 flex items-center justify-center shrink-0 z-10">
                                <Star size={11} className="text-success dark:text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-main dark:text-main truncate">{log.action}</p>
                                    {log.date && (
                                        <p className="text-micro text-muted dark:text-muted flex items-center gap-1">
                                            <Clock size={9} /> {log.date}
                                        </p>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-success bg-success-soft px-2 py-0.5 rounded-lg shrink-0">
                                    +{log.amount}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
