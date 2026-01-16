import type { LucideIcon } from 'lucide-react';

interface QuickStatProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: 'blue' | 'emerald' | 'purple' | 'orange' | 'red' | 'indigo' | 'cyan' | 'amber';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const QuickStat = ({ title, value, icon: Icon, color, trend }: QuickStatProps) => {
    const colorClasses = {
        blue: 'bg-gradient-to-br from-white to-blue-50 border-blue-100 text-blue-600',
        emerald: 'bg-gradient-to-br from-white to-emerald-50 border-emerald-100 text-emerald-600',
        purple: 'bg-gradient-to-br from-white to-purple-50 border-purple-100 text-purple-600',
        orange: 'bg-gradient-to-br from-white to-orange-50 border-orange-100 text-orange-600',
        red: 'bg-gradient-to-br from-white to-red-50 border-red-100 text-red-600',
        indigo: 'bg-gradient-to-br from-white to-indigo-50 border-indigo-100 text-indigo-600',
        cyan: 'bg-gradient-to-br from-white to-cyan-50 border-cyan-100 text-cyan-600',
        amber: 'bg-gradient-to-br from-white to-amber-50 border-amber-100 text-amber-600'
    };

    const [bgGradient, iconColor] = colorClasses[color].split(' text-');

    return (
        <div className={`${bgGradient} dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 p-4 border shadow-sm relative overflow-hidden group transition-all hover:shadow-md`}>
            <div className={`absolute right-0 top-0 bottom-0 w-1 bg-${color}-600`}></div>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-none flex items-center justify-center bg-white/60 dark:bg-gray-800/50 text-${iconColor}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 text-center">
                    <p className="text-xs text-gray-500 font-bold whitespace-nowrap dark:text-gray-400 mb-0.5">{title}</p>
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white">{value}</h3>
                        {trend && (
                            <span className={`text-xs font-bold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface QuickStatsGridProps {
    stats: QuickStatProps[];
}

export const QuickStatsGrid = ({ stats }: QuickStatsGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <QuickStat key={index} {...stat} />
            ))}
        </div>
    );
};
