import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen, BookMarked, Star } from 'lucide-react';
import { RANK_ICON_MAP } from '../../shared/utils/ranks';
import type { DashboardStats } from './types';

interface ProgressOverviewProps {
    stats: DashboardStats;
    points: number;
    rank: { name: string; icon: string };
    nextRank: { next: { name: string; minPoints: number } | null; pointsNeeded: number };
}

const ProgressBar = ({ value, max, color, label, icon: Icon }: { value: number; max: number; color: string; label: string; icon: React.ElementType }) => {
    const percent = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${color}/10 flex items-center justify-center`}>
                        <Icon size={13} className={color} />
                    </div>
                    <span className="text-xs font-bold text-main">{label}</span>
                </div>
                <span className={`text-xs font-bold ${color}`}>{percent}%</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-border overflow-hidden">
                <motion.div
                    className={`absolute inset-y-0 start-0 rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

export const ProgressOverview = ({ stats, points, rank, nextRank }: ProgressOverviewProps) => {
    const xpPercent = nextRank.next ? Math.min(Math.round((points / nextRank.next.minPoints) * 100), 100) : 100;
    const homeworkPercent = stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0;
    const RankIconComponent = RANK_ICON_MAP[rank.icon] || Star;

    return (
        <div className="rounded-2xl bg-card border border-border p-5 md:p-6 transition-all duration-300 hover:shadow-elevation-1">
            <h3 className="text-base md:text-[22px] font-bold text-main mb-5">التقدم الأكاديمي</h3>

            <div className="space-y-4">
                <ProgressBar value={stats.attendanceRate} max={100} color="text-success" label="الحضور" icon={CheckCircle2} />
                <ProgressBar value={homeworkPercent} max={100} color="text-info" label="الواجبات" icon={BookOpen} />
                <ProgressBar value={stats.curriculumProgress} max={100} color="text-primary" label="المنهج" icon={BookMarked} />
                <ProgressBar value={xpPercent} max={100} color="text-warning" label="XP" icon={Star} />
            </div>

            <div className="mt-5 p-4 rounded-xl bg-gradient-to-l from-warning/10 via-warning/[0.03] to-surface border border-warning/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                        <RankIconComponent size={20} className="text-warning" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-main">{rank.name}</p>
                        {nextRank.next && (
                            <p className="text-xs text-muted font-medium">{nextRank.pointsNeeded} نقطة للرتبة التالية</p>
                        )}
                    </div>
                </div>
                <span className="text-lg font-bold text-warning bg-warning/10 px-3 py-1.5 rounded-xl">{points}</span>
            </div>
        </div>
    );
};