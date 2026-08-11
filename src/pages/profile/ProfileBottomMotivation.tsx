import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';

interface ProfileBottomMotivationProps {
    icon?: ReactNode;
    title: string;
    description: string;
    progress?: number;
    progressLabel?: string;
    targetLabel?: string;
    color?: 'primary' | 'success' | 'warning' | 'info';
}

const colorMap = {
    primary: { border: 'border-s-primary', iconBg: 'bg-primary/10', iconText: 'text-primary', bar: 'bg-primary' },
    success: { border: 'border-s-success', iconBg: 'bg-success/10', iconText: 'text-success', bar: 'bg-success' },
    warning: { border: 'border-s-warning', iconBg: 'bg-warning/10', iconText: 'text-warning', bar: 'bg-warning' },
    info: { border: 'border-s-info', iconBg: 'bg-info/10', iconText: 'text-info', bar: 'bg-info' },
};

export const ProfileBottomMotivation = ({
    icon = <Target size={28} className="text-primary" />,
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
                "rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 md:p-6 border-s-4",
                c.border
            )}
        >
            <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex items-center gap-4 flex-1">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", c.iconBg)}>
                        <span className="flex items-center justify-center">{icon}</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-main dark:text-main mb-1">{title}</h3>
                        <p className="text-sm text-muted dark:text-muted">{description}</p>
                    </div>
                </div>

                {progress !== undefined && (
                    <div className="shrink-0 w-full md:w-64">
                        <div className="flex items-center justify-between mb-1.5">
                            {progressLabel && (
                                <span className="text-[11px] font-bold text-muted dark:text-muted">{progressLabel}</span>
                            )}
                            <span className="text-xs font-bold text-main dark:text-main tabular-nums">{progress}%</span>
                        </div>
                        <div className="h-3 bg-border dark:bg-hover rounded-full overflow-hidden">
                            <motion.div
                                className={cn("h-full rounded-full", c.bar)}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                            />
                        </div>
                        {targetLabel && (
                            <p className="text-[10px] font-medium text-muted dark:text-muted mt-1">{targetLabel}</p>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
