import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Achievement {
    id: string;
    icon: React.ReactNode;
    title: string;
    unlocked: boolean;
    progress?: number;
}

interface ProfileAchievementsProps {
    achievements: Achievement[];
    title?: string;
}

const cardVariant = (i: number) => ({
    initial: { opacity: 0, y: 12, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
});

export const ProfileAchievements = ({ achievements, title = 'الإنجازات' }: ProfileAchievementsProps) => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-main">{title}</h3>
                <span className="text-[11px] font-bold text-muted bg-surface px-2.5 py-1 rounded-lg">
                    {unlockedCount}/{achievements.length}
                </span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2.5">
                {achievements.map((ach, i) => (
                    <motion.div
                        key={ach.id}
                        {...cardVariant(i)}
                        className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200",
                            ach.unlocked
                                ? "bg-surface border-border hover:border-primary/30 hover:shadow-sm"
                                : "bg-background/50 border-border/50 opacity-50"
                        )}
                    >
                        <span className={cn(
                            "flex items-center justify-center",
                            ach.unlocked ? "" : "grayscale opacity-50"
                        )}>
                            {ach.icon}
                        </span>
                        <p className={cn(
                            "text-[10px] font-bold text-center leading-tight",
                            ach.unlocked ? "text-main" : "text-muted"
                        )}>
                            {ach.title}
                        </p>
                        {ach.progress !== undefined && (
                            <div className="w-full h-1 bg-border rounded-full overflow-hidden mt-0.5">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-700", ach.unlocked ? "bg-primary" : "bg-border")}
                                    style={{ width: `${Math.min(ach.progress, 100)}%` }}
                                />
                            </div>
                        )}
                        {!ach.unlocked && (
                            <span className="text-[8px] font-bold text-muted">مقفل</span>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
