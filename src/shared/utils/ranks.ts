export interface Rank {
    name: string;
    minPoints: number;
    color: string;
    icon: string;
    badgeColor: string;
}

export const STUDENT_RANKS: Rank[] = [
    { name: 'شاطر ومجتهد', minPoints: 0, color: 'var(--bg-success)', icon: '⭐', badgeColor: 'bg-success' },
    { name: 'العبقري / العبقرية', minPoints: 1000, color: 'var(--bg-info)', icon: '💡', badgeColor: 'bg-info' },
    { name: 'بطل المعهد', minPoints: 2000, color: 'var(--bg-primary)', icon: '🏅', badgeColor: 'bg-primary' },
    { name: 'جوكر المعهد', minPoints: 3000, color: 'var(--bg-warning)', icon: '👑', badgeColor: 'bg-warning' },
];

export const TEACHER_RANKS: Rank[] = [
    { name: 'معلمة لورد', minPoints: 0, color: 'var(--bg-success)', icon: '👩‍🏫', badgeColor: 'bg-success' },
    { name: 'لورد مرشد', minPoints: 500, color: 'var(--bg-info)', icon: '🧭', badgeColor: 'bg-info' },
    { name: 'لورد خبير', minPoints: 2000, color: 'var(--bg-primary)', icon: '🎓', badgeColor: 'bg-primary' },
    { name: 'لورد النخبة', minPoints: 5000, color: 'var(--text-main)', icon: '💎', badgeColor: 'bg-black' },
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
