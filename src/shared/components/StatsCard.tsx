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
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{value}</h3>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-bold",
                            trendUp ? "text-emerald-600" : "text-gray-500"
                        )}>
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                <div className={cn("p-3 border", colorStyles[color])}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};
