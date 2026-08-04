import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Activity {
    id: string;
    icon: React.ReactNode;
    title: string;
    description?: string;
    timestamp: string;
    type?: 'success' | 'warning' | 'info' | 'default';
}

interface ProfileRecentActivityProps {
    activities: Activity[];
    title?: string;
}

const typeColors: Record<string, string> = {
    success: 'bg-success/15 text-success border-success/20',
    warning: 'bg-warning/15 text-warning border-warning/20',
    info: 'bg-info/15 text-info border-info/20',
    default: 'bg-surface text-muted border-border',
};

const typeDots: Record<string, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-info',
    default: 'bg-border',
};

export const ProfileRecentActivity = ({ activities, title = 'آخر النشاطات' }: ProfileRecentActivityProps) => {
    if (activities.length === 0) return null;

    return (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-bold text-main mb-4">{title}</h3>
            <div className="relative">
                <div className="absolute top-2 bottom-2 start-[19px] w-px bg-border" />
                <div className="space-y-3">
                    {activities.map((act, i) => (
                        <motion.div
                            key={act.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.35 }}
                            className="flex items-start gap-3"
                        >
                            <div className={cn(
                                "relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                                typeColors[act.type || 'default']
                            )}>
                                 <span className="flex items-center justify-center">{act.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <p className="text-xs font-bold text-main">{act.title}</p>
                                {act.description && (
                                    <p className="text-[11px] font-medium text-muted mt-0.5">{act.description}</p>
                                )}
                            </div>
                            <span className="text-[10px] font-medium text-muted whitespace-nowrap pt-1">{act.timestamp}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
