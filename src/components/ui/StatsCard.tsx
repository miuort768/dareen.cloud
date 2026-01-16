import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: "primary" | "secondary" | "green" | "red" | "blue" | "indigo" | "purple" | "emerald" | "orange" | "cyan" | "rose" | "amber";
}

export const StatsCard = ({ title, value, icon: Icon, trend, trendUp, color = "primary" }: StatsCardProps) => {
    const colorConfigs = {
        primary: {
            bg: "bg-primary-50 dark:bg-primary-900/20",
            text: "text-primary-600 dark:text-primary-400",
            border: "border-primary-100 dark:border-primary-800",
            gradient: "from-white to-primary-50 dark:from-gray-800 dark:to-gray-900"
        },
        secondary: {
            bg: "bg-gray-50 dark:bg-gray-800",
            text: "text-gray-600 dark:text-gray-400",
            border: "border-gray-200 dark:border-gray-700",
            gradient: "from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
        },
        green: {
            bg: "bg-green-50 dark:bg-green-900/20",
            text: "text-green-600 dark:text-green-400",
            border: "border-green-100 dark:border-green-800",
            gradient: "from-white to-green-50 dark:from-gray-800 dark:to-gray-900"
        },
        red: {
            bg: "bg-red-50 dark:bg-red-900/20",
            text: "text-red-600 dark:text-red-400",
            border: "border-red-100 dark:border-red-800",
            gradient: "from-white to-red-50 dark:from-gray-800 dark:to-gray-900"
        },
        blue: {
            bg: "bg-blue-50 dark:bg-blue-900/20",
            text: "text-blue-600 dark:text-blue-400",
            border: "border-blue-100 dark:border-blue-800",
            gradient: "from-white to-blue-50 dark:from-gray-800 dark:to-gray-900"
        },
        indigo: {
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            text: "text-indigo-600 dark:text-indigo-400",
            border: "border-indigo-100 dark:border-indigo-800",
            gradient: "from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900"
        },
        purple: {
            bg: "bg-purple-50 dark:bg-purple-900/20",
            text: "text-purple-600 dark:text-purple-400",
            border: "border-purple-100 dark:border-purple-800",
            gradient: "from-white to-purple-50 dark:from-gray-800 dark:to-gray-900"
        },
        emerald: {
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-100 dark:border-emerald-800",
            gradient: "from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900"
        },
        orange: {
            bg: "bg-orange-50 dark:bg-orange-900/20",
            text: "text-orange-600 dark:text-orange-400",
            border: "border-orange-100 dark:border-orange-800",
            gradient: "from-white to-orange-50 dark:from-gray-800 dark:to-gray-900"
        },
        cyan: {
            bg: "bg-cyan-50 dark:bg-cyan-900/20",
            text: "text-cyan-600 dark:text-cyan-400",
            border: "border-cyan-100 dark:border-cyan-800",
            gradient: "from-white to-cyan-50 dark:from-gray-800 dark:to-gray-900"
        },
        rose: {
            bg: "bg-rose-50 dark:bg-rose-900/20",
            text: "text-rose-600 dark:text-rose-400",
            border: "border-rose-100 dark:border-rose-800",
            gradient: "from-white to-rose-50 dark:from-gray-800 dark:to-gray-900"
        },
        amber: {
            bg: "bg-amber-50 dark:bg-amber-900/20",
            text: "text-amber-600 dark:text-amber-400",
            border: "border-amber-100 dark:border-amber-800",
            gradient: "from-white to-amber-50 dark:from-gray-800 dark:to-gray-900"
        }
    };

    const config = colorConfigs[color] || colorConfigs.primary;

    return (
        <div className={cn(
            "relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300",
            "bg-gradient-to-br border shadow-lg p-5",
            config.gradient,
            config.border
        )}>
            <div className={`absolute right-0 top-0 bottom-0 w-1 ${config.bg.replace('bg-', 'bg-').replace(' dark:', '')} opacity-100`}></div>
            <div className={`absolute left-0 bottom-0 w-full h-1 ${config.bg.replace('bg-', 'bg-').replace(' dark:', '')} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

            <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "w-10 h-10 flex items-center justify-center shadow-sm border rounded-none transition-colors",
                        "bg-white dark:bg-gray-800 dark:border-gray-700",
                        config.text
                    )}>
                        <Icon size={20} />
                    </div>
                    {trend && (
                        <div className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-none bg-white/50 dark:bg-black/20",
                            trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                            <span className="mr-1">{trendUp ? "▲" : "▼"}</span>
                            {trend}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1 dark:text-white">{title}</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{value}</h3>
                </div>
            </div>

            {/* Background Decoration */}
            <Icon
                className={cn(
                    "absolute -bottom-4 -left-4 w-24 h-24 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none",
                    config.text
                )}
            />
        </div>
    );
};
