import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
    className?: string;
}

const colorStyles = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800'
};

export const StatsCard = ({ title, value, icon: Icon, trend, trendUp, color = 'blue', className }: StatsCardProps) => {
    return (
        <div className={cn(
            "relative p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden",
            className,
            "rounded-none"
        )}>
            {/* Static Background Decorative Accents */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full pointer-events-none opacity-50"></div>

            <div className="relative flex items-start justify-between md:flex-col md:items-center md:justify-center md:text-center z-10 md:gap-3">
                {/* Icon - right on mobile, top on desktop */}
                <div className={cn(
                    "p-2 md:p-3 border-2 shadow-sm rounded-none order-2 md:order-1",
                    colorStyles[color]
                )}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </div>

                {/* Content - left on mobile, below icon on desktop */}
                <div className="space-y-2 md:space-y-2 w-full order-1 md:order-2">
                    <div className="flex flex-col gap-1 md:items-center">
                        <span className="w-10 h-1 bg-current opacity-20 rounded-none md:hidden" style={{ color: color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'purple' ? '#a855f7' : color === 'amber' ? '#f59e0b' : color === 'rose' ? '#f43f5e' : '#6366f1' }}></span>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{title}</p>
                    </div>

                    <h3 className="text-base md:text-lg lg:text-xl font-black text-gray-900 dark:text-white tracking-tight md:truncate">
                        {value}
                    </h3>

                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1.5 py-1 px-2.5 rounded-none text-[10px] font-black w-fit md:mx-auto",
                            trendUp
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                            <span className={cn("inline-flex rounded-full h-1.5 w-1.5", trendUp ? "bg-emerald-500" : "bg-gray-500")}></span>
                            <span className="uppercase tracking-wider">{trend}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
