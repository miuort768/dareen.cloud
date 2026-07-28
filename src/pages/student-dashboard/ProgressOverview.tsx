import { BookOpen, CheckCircle, Trophy, Target } from 'lucide-react';
import type { DashboardStats } from './types';

interface ProgressOverviewProps {
    stats: DashboardStats;
    points: number;
    rank: { name: string; icon: string };
    nextRank: { next: { name: string; minPoints: number } | null; pointsNeeded: number };
}

const Ring = ({ value, size = 56, stroke = 5, color = 'var(--bg-primary)', label, icon: Icon }: {
    value: number; size?: number; stroke?: number; color?: string; label: string; icon: typeof BookOpen;
}) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(value, 100) / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
                    <circle
                        cx={size / 2} cy={size / 2} r={radius} fill="none"
                        stroke={color} strokeWidth={stroke} strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        className="transition-all duration-700"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon size={12} className="text-muted mb-0.5" />
                    <span className="text-micro font-bold text-main">{value}%</span>
                </div>
            </div>
            <span className="text-micro text-muted font-bold text-center">{label}</span>
        </div>
    );
};

export const ProgressOverview = ({ stats, points, rank, nextRank }: ProgressOverviewProps) => {
    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-main mb-4">مستوى التقدم</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <Ring value={stats.curriculumProgress} color="var(--bg-primary)" label="المنهج" icon={BookOpen} />
                <Ring value={stats.attendanceRate} color="var(--bg-success)" label="الحضور" icon={CheckCircle} />
                <Ring value={stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0} color="var(--bg-info)" label="الواجبات" icon={Target} />
                <Ring value={nextRank.next ? Math.round((points / nextRank.next.minPoints) * 100) : 100} color="var(--bg-warning)" label="XP" icon={Trophy} />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{rank.icon}</span>
                    <div>
                        <p className="text-xs font-bold text-main">{rank.name}</p>
                        {nextRank.next && (
                            <p className="text-micro text-muted">{nextRank.pointsNeeded} نقطة للرتبة التالية</p>
                        )}
                    </div>
                </div>
                <span className="text-xs font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-lg">{points} نقطة</span>
            </div>
        </div>
    );
};
