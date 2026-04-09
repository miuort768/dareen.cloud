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
            "relative p-4 md:p-6 bg-white dark:bg-gray-950 border-2 border-gray-950 dark:border-gray-800 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] transition-transform hover:-translate-y-1 rounded-none overflow-hidden",
            className
        )}>
            {/* Background Accent Lines */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-gray-950/5 -mr-4 -mt-4 rotate-45 pointer-events-none"></div>

            <div className="relative flex flex-col md:items-center md:justify-center text-right md:text-center z-10 gap-4">
                {/* Icon Circle */}
                <div className={cn(
                    "w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border-2 border-gray-950 dark:border-gray-700 shadow-none rounded-none mx-0 md:mx-auto",
                    colorStyles[color]
                )}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>

                {/* Content */}
                <div className="w-full min-w-0">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 truncate">{title}</p>
                    <h3 className="text-xl md:text-3xl font-black text-gray-950 dark:text-white tracking-tighter tabular-nums mb-2 truncate">
                        {value}
                    </h3>

                    {trend && (
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 border-2 border-gray-950 rounded-none text-[9px] font-black uppercase tracking-widest",
                            trendUp
                                ? "bg-emerald-500 text-white"
                                : "bg-rose-500 text-white"
                        )}>
                            {trend}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
