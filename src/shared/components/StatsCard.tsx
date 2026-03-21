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
            "relative p-5 md:p-6 bg-white dark:bg-gray-950 border-2 border-gray-900 dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden",
            className,
            "rounded-none"
        )}>
            {/* Double Border effect for Premium Sharp feel */}
            <div className="absolute inset-0 border-[4px] border-white/5 pointer-events-none"></div>

            <div className="relative flex items-start justify-between md:flex-col md:items-center md:justify-center md:text-center z-10 md:gap-4">
                {/* Icon - right on mobile, top on desktop */}
                <div className={cn(
                    "p-3 md:p-4 border-2 shadow-none rounded-none order-2 md:order-1 border-gray-900 dark:border-gray-700",
                    colorStyles[color].replace('border-blue-100', '').replace('dark:border-blue-800', '')
                )}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>

                {/* Content - left on mobile, below icon on desktop */}
                <div className="space-y-1 md:space-y-2 w-full order-1 md:order-2">
                    <div className="flex flex-col gap-1 md:items-center">
                        <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">{title}</p>
                        <div className="w-8 h-1 bg-primary-600 rounded-none hidden md:block opacity-50"></div>
                    </div>

                    <h3 className="text-lg md:text-xl lg:text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase tabular-nums">
                        {value}
                    </h3>

                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1.5 py-1 px-3 border border-gray-900 dark:border-gray-800 rounded-none text-[9px] font-black w-fit md:mx-auto mt-2",
                            trendUp
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                        )}>
                            <span className="uppercase tracking-widest leading-none">{trend}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
