import { Award, Flame, Star } from 'lucide-react';
import type { Rank } from '../../shared/utils/ranks';

interface AchievementsSectionProps {
    points: number;
    rank: Rank;
    nextRank: { next: { name: string; minPoints: number } | null; pointsNeeded: number };
}

export const AchievementsSection = ({ points, rank, nextRank }: AchievementsSectionProps) => {
    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-main">الإنجازات</h3>
                <Award size={16} className="text-primary" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex flex-col items-center gap-2 p-3 bg-surface rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-warning-soft flex items-center justify-center">
                        <Star size={18} className="text-warning" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-main">{points}</p>
                        <p className="text-micro text-muted">النقاط</p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 p-3 bg-surface rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                        <span className="text-lg">{rank.icon}</span>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-main leading-tight">{rank.name}</p>
                        <p className="text-micro text-muted">اللقب الحالي</p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 p-3 bg-surface rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center">
                        <Flame size={18} className="text-success" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-main">
                            {nextRank.next ? nextRank.pointsNeeded : '—'}
                        </p>
                        <p className="text-micro text-muted">للرتبة التالية</p>
                    </div>
                </div>
            </div>

            {nextRank.next && (
                <div className="p-3 bg-surface rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-micro text-muted">التقدم نحو {nextRank.next.name}</span>
                        <span className="text-micro font-bold text-primary">
                            {Math.round((points / nextRank.next.minPoints) * 100)}%
                        </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${Math.min((points / nextRank.next.minPoints) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
