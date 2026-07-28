import { Trophy, Star, TrendingUp } from 'lucide-react';

interface AchievementsSectionProps {
    points: number;
    rank: { name: string };
}

export const AchievementsSection = ({ points, rank }: AchievementsSectionProps) => {
    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-xl bg-warning-soft flex items-center justify-center">
                    <Trophy size={13} className="text-warning" />
                </div>
                <h3 className="text-sm font-bold text-main">الإنجازات</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-2 p-3 bg-surface rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-warning-soft flex items-center justify-center ring-1 ring-warning/20">
                        <Star size={18} className="text-warning" />
                    </div>
                    <span className="text-sm font-bold text-main">{points}</span>
                    <span className="text-micro text-muted font-medium">النقاط</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-surface rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center ring-1 ring-primary/20">
                        <TrendingUp size={18} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold text-main">{rank.name}</span>
                    <span className="text-micro text-muted font-medium">اللقب</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-surface rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center ring-1 ring-success/20">
                        <Trophy size={18} className="text-success" />
                    </div>
                    <span className="text-sm font-bold text-main">0</span>
                    <span className="text-micro text-muted font-medium">الشهادات</span>
                </div>
            </div>
        </div>
    );
};
