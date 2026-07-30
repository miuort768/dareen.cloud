import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressItem {
    label: string;
    value: number;
    color?: string;
}

interface ProfileProgressProps {
    items: ProgressItem[];
    title?: string;
}

export const ProfileProgress = ({ items, title = 'مؤشرات الأداء' }: ProfileProgressProps) => {
    const getColor = (value: number) => {
        if (value >= 80) return 'bg-success';
        if (value >= 50) return 'bg-warning';
        return 'bg-error';
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-bold text-main mb-4">{title}</h3>
            <div className="space-y-4">
                {items.map((item, i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-main">{item.label}</span>
                            <span className={cn(
                                "text-xs font-bold tabular-nums",
                                item.value >= 80 ? 'text-success' : item.value >= 50 ? 'text-warning' : 'text-error'
                            )}>
                                {item.value}%
                            </span>
                        </div>
                        <div className="relative h-2.5 bg-border rounded-full overflow-hidden">
                            <motion.div
                                className={cn("absolute inset-y-0 start-0 rounded-full", item.color || getColor(item.value))}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(item.value, 100)}%` }}
                                transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
