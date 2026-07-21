import { Star, CheckCircle, TrendingUp, type LucideIcon } from 'lucide-react';

interface StatItem {
    icon: LucideIcon;
    label: string;
    value: string | number;
    variant: string;
}

const variantGradient: Record<string, string> = {
    success: 'from-success to-emerald-500 shadow-success/20',
    info: 'from-info to-blue-500 shadow-info/20',
    primary: 'from-primary to-purple-500 shadow-primary/20',
    warning: 'from-warning to-orange-500 shadow-warning/20',
};

interface StatsStripProps {
    points: number;
    attendanceRate: number;
    rankName: string;
}

export const StatsStrip = ({ points, attendanceRate, rankName }: StatsStripProps) => {
    const items: StatItem[] = [
        { icon: Star, label: 'النقاط', value: points, variant: 'warning' },
        { icon: CheckCircle, label: 'الحضور', value: `${attendanceRate}%`, variant: 'success' },
        { icon: TrendingUp, label: 'اللقب', value: rankName, variant: 'primary' },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                    <div key={idx} className="bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-3 shadow-lg shadow-black/[0.03] flex flex-col items-center text-center gap-1">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg ${variantGradient[item.variant]}`}>
                            <Icon size={16} className="text-white" />
                        </div>
                        <span className="text-sm font-black text-main">{item.value}</span>
                        <span className="text-micro text-dim font-medium">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
};
