import { Star, CheckCircle, TrendingUp, type LucideIcon } from 'lucide-react';

interface StatItem {
    icon: LucideIcon;
    label: string;
    value: string | number;
    variant: string;
}

const variantBg: Record<string, string> = {
    success: 'bg-success-soft', info: 'bg-info-soft', primary: 'bg-primary-soft', warning: 'bg-warning-soft',
};
const variantText: Record<string, string> = {
    success: 'text-success', info: 'text-info', primary: 'text-primary', warning: 'text-warning',
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
                    <div key={idx} className="bg-card rounded-card p-3 shadow-sm border border-border flex flex-col items-center text-center gap-1">
                        <div className={`w-9 h-9 rounded-card flex items-center justify-center ${variantBg[item.variant]}`}>
                            <Icon size={18} className={variantText[item.variant]} />
                        </div>
                        <span className="text-sm font-black text-main">{item.value}</span>
                        <span className="text-micro text-dim font-medium">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
};
