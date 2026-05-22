import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo' | 'green';
    className?: string;
}

const colorStyles = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
    rose: 'text-[#ef4444] bg-[#ef4444]/10 dark:bg-[#ef4444]/20 border-[#ef4444]/20',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800',
    green: 'text-[#10b981] bg-[#10b981]/10 dark:bg-[#10b981]/20 border-[#10b981]/20'
};

export const StatsCard = ({ title, value, icon: Icon, trend, trendUp, color = 'blue', className }: StatsCardProps) => {
    return (
        <div className={cn(
            "relative p-3 bg-white dark:bg-slate-900 border-2 border-gray-950 dark:border-slate-800 md:shadow-[2px_2px_0px_0px_black] transition-all rounded-none overflow-hidden max-w-full",
            className
        )}>
            <div className="relative flex items-center gap-3 z-10">
                {/* Compact Icon */}
                <div className={cn(
                    "w-9 h-9 shrink-0 flex items-center justify-center border-2 border-gray-950 rounded-none",
                    colorStyles[color]
                )}>
                    <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tighter leading-none mb-1 truncate">{title}</p>
                    <h3 className="text-sm font-medium text-gray-950 dark:text-white tracking-tight tabular-nums leading-none truncate">
                        {value}
                    </h3>
                    {trend && (
                        <p className={cn(
                            "text-[8px] font-medium mt-1 leading-none uppercase italic",
                            trendUp ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {trend}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
