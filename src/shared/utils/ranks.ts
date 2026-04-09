export interface Rank {
    name: string;
    minPoints: number;
    color: string;
    icon: string;
    badgeColor: string;
}

export interface RankInfo {
    name: string;
    minPoints: number;
    badgeColor: string;
    icon: string;
}

export const STUDENT_RANKS: Rank[] = [
    { name: 'برعم ناشئ', minPoints: 0, color: '#94a3b8', icon: '🌱', badgeColor: 'bg-slate-500' },
    { name: 'طالب مجتهد', minPoints: 101, color: '#10b981', icon: '✍️', badgeColor: 'bg-emerald-500' },
    { name: 'طالب مميز', minPoints: 301, color: '#3b82f6', icon: '🌟', badgeColor: 'bg-blue-500' },
    { name: 'نجم ساطع', minPoints: 701, color: '#f59e0b', icon: '✨', badgeColor: 'bg-amber-500' },
    { name: 'فارس العلم', minPoints: 1501, color: '#ef4444', icon: '⚔️', badgeColor: 'bg-rose-500' },
    { name: 'طالب مثالي', minPoints: 3001, color: '#8b5cf6', icon: '🏆', badgeColor: 'bg-violet-500' },
    { name: 'سفير دارين', minPoints: 10001, color: '#000000', icon: '👑', badgeColor: 'bg-black' },
];

export const TEACHER_RANKS: Rank[] = [
    { name: 'معلمة لورد', minPoints: 0, color: '#10b981', icon: '👩‍🏫', badgeColor: 'bg-emerald-600' },
    { name: 'لورد مرشد', minPoints: 500, color: '#3b82f6', icon: '🧭', badgeColor: 'bg-blue-600' },
    { name: 'لورد خبير', minPoints: 2000, color: '#8b5cf6', icon: '🎓', badgeColor: 'bg-violet-600' },
    { name: 'لورد النخبة', minPoints: 5000, color: '#000000', icon: '💎', badgeColor: 'bg-black' },
];

export const getRankByPoints = (points: number, ranks: Rank[]): Rank => {
    return [...ranks].reverse().find(r => points >= r.minPoints) || ranks[0];
};

export const getNextRank = (points: number, ranks: Rank[]): { next: Rank | null, pointsNeeded: number } => {
    const currentRankIdx = [...ranks].reverse().findIndex(r => points >= r.minPoints);
    const actualIdx = ranks.length - 1 - currentRankIdx;
    
    if (actualIdx >= ranks.length - 1) return { next: null, pointsNeeded: 0 };
    
    const nextRank = ranks[actualIdx + 1];
    return { next: nextRank, pointsNeeded: nextRank.minPoints - points };
};
