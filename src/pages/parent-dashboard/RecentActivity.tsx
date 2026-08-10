import { Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { PointLogEntry } from './types';

interface RecentActivityProps {
    allPointLogs: PointLogEntry[];
}

const formatDate = (timestamp: string) => {
    try {
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '';
        return format(d, 'eeee, d MMMM HH:mm', { locale: ar });
    } catch {
        return '';
    }
};

export const RecentActivity = ({ allPointLogs }: RecentActivityProps) => {
    const recent = allPointLogs.slice(0, 5);

    return (
        <div className="bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 rounded-2xl p-5">
            <h3 className="text-[13px] font-bold text-main dark:text-white mb-3">آخر النشاطات</h3>

            <div className="relative">
                <div className="absolute top-0 bottom-0 end-[11px] w-px bg-border dark:bg-[#D4AF37]/15" />

                <div className="space-y-3">
                    {recent.map((log, i) => (
                        <div key={log.id || `log-${i}`} className="flex items-start gap-3 relative">
                            <div className="w-6 h-6 rounded-lg bg-success-soft dark:bg-[#D4AF37]/15 flex items-center justify-center shrink-0 z-10">
                                <Star size={11} className="text-success dark:text-[#D4AF37]" />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-main dark:text-white truncate">{log.action}</p>
                                    <p className="text-[11px] text-muted dark:text-zinc-400 font-medium">{log.studentName}</p>
                                    {log.timestamp && (
                                        <p className="text-[10px] text-muted dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                                            <Clock size={9} /> {formatDate(log.timestamp)}
                                        </p>
                                    )}
                                </div>
                                <span className="text-[11px] font-bold text-success bg-success-soft px-2 py-0.5 rounded-lg shrink-0">
                                    +{log.amount || log.points || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {recent.length === 0 && (
                <div className="py-8 text-center">
                    <Star size={24} className="mx-auto text-muted dark:text-zinc-500 mb-2" />
                    <p className="text-muted dark:text-zinc-500 font-medium text-[11px]">لا توجد نشاطات حديثة</p>
                </div>
            )}
        </div>
    );
};
