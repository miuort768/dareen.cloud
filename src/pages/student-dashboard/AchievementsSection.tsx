import { motion } from 'framer-motion';
import { Trophy, Star, Flame, BookOpen, Lock } from 'lucide-react';
import type { Rank } from '../../shared/utils/ranks';

interface AchievementsSectionProps {
    points: number;
    rank: Rank;
    nextRank: { next: { name: string; minPoints: number } | null; pointsNeeded: number };
}

export const AchievementsSection = ({ points, nextRank }: AchievementsSectionProps) => {
    const xpPercent = nextRank.next ? Math.min(Math.round((points / nextRank.next.minPoints) * 100), 100) : 100;

    const badges = [
        { icon: Star, label: 'طالب نشيط', unlocked: points >= 100, color: 'text-warning', bg: 'bg-warning-soft dark:bg-warning/10' },
        { icon: Flame, label: '7 أيام متتالية', unlocked: points >= 200, color: 'text-error', bg: 'bg-error-soft dark:bg-error/10' },
        { icon: BookOpen, label: 'أنهيت أول مادة', unlocked: points >= 500, color: 'text-info', bg: 'bg-info-soft dark:bg-info/10' },
        { icon: Lock, label: 'أكمل 10 واجبات', unlocked: points >= 1000, color: 'text-muted', bg: 'bg-border/30 dark:bg-surface' },
    ];

    return (
        <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 md:p-6 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-warning-soft dark:bg-warning/10 flex items-center justify-center">
                    <Trophy size={16} className="text-warning dark:text-warning" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-main dark:text-main">الإنجازات</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {badges.map((badge, i) => {
                    const Icon = badge.icon;
                    return (
                        <motion.div
                            key={badge.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.06 }}
                            className={`relative rounded-2xl p-4 ${badge.bg} text-center transition-all duration-300 ${badge.unlocked ? 'hover:shadow-elevation-1 hover:-translate-y-0.5' : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${badge.unlocked ? badge.bg : 'bg-border/30 dark:bg-surface'}`}>
                                <Icon size={22} className={badge.unlocked ? badge.color : 'text-muted'} />
                            </div>
                            <p className={`text-xs font-bold ${badge.unlocked ? 'text-main dark:text-main' : 'text-muted dark:text-muted'}`}>{badge.label}</p>
                            {!badge.unlocked && <p className="text-[10px] text-muted dark:text-muted mt-1">مقفل</p>}
                        </motion.div>
                    );
                })}
            </div>

            {nextRank.next && (
                <div className="mt-5 p-4 rounded-xl bg-surface dark:bg-surface border border-border dark:border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted dark:text-muted">التقدم نحو {nextRank.next.name}</span>
                        <span className="text-xs font-bold text-primary dark:text-primary">{xpPercent}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-border dark:bg-border overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 start-0 rounded-full bg-primary dark:bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${xpPercent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
