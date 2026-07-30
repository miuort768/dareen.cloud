import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProfileBottomMotivationProps {
    icon?: string;
    title: string;
    description: string;
    progress?: number;
    progressLabel?: string;
    targetLabel?: string;
    color?: 'primary' | 'success' | 'warning' | 'info';
}

const colorMap = {
    primary: { bg: 'from-primary to-primary-soft', text: 'text-primary', badge: 'bg-primary-soft text-primary', bar: 'bg-primary' },
    success: { bg: 'from-success to-success-light', text: 'text-success', badge: 'bg-success-soft text-success', bar: 'bg-success' },
    warning: { bg: 'from-warning to-warning-light', text: 'text-warning', badge: 'bg-warning-soft text-warning', bar: 'bg-warning' },
    info: { bg: 'from-info to-info-light', text: 'text-info', badge: 'bg-info-soft text-info', bar: 'bg-info' },
};

export const ProfileBottomMotivation = ({
    icon = '🎯',
    title,
    description,
    progress,
    progressLabel,
    targetLabel,
    color = 'primary',
}: ProfileBottomMotivationProps) => {
    const c = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
                "relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 md:p-8",
                c.bg
            )}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
            <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm ring-1 ring-white/20">
                        <span className="text-3xl">{icon}</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-1">{title}</h3>
                        <p className="text-sm text-white/80">{description}</p>
                    </div>
                </div>

                {progress !== undefined && (
                    <div className="shrink-0 w-full md:w-64">
                        <div className="flex items-center justify-between mb-1.5">
                            {progressLabel && (
                                <span className="text-[11px] font-bold text-white/70">{progressLabel}</span>
                            )}
                            <span className="text-xs font-bold text-white tabular-nums">{progress}%</span>
                        </div>
                        <div className="h-3 bg-white/15 rounded-full overflow-hidden">
                            <motion.div
                                className={cn("h-full rounded-full", c.bar)}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                            />
                        </div>
                        {targetLabel && (
                            <p className="text-[10px] font-medium text-white/60 mt-1">{targetLabel}</p>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
