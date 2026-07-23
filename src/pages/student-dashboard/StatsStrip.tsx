import { Star, CheckCircle, TrendingUp, type LucideIcon } from 'lucide-react';
import { GlassCard } from '@/shared/components/ui';

interface StatItem {
    icon: LucideIcon;
    label: string;
    value: string | number;
    variant: string;
}

const variantBg: Record<string, string> = {
    success: 'bg-success-soft shadow-success/20',
    info: 'bg-info-soft shadow-info/20',
    primary: 'bg-primary-soft shadow-primary/20',
    warning: 'bg-warning-soft shadow-warning/20',
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
                    <GlassCard key={idx} className="p-3 flex flex-col items-center text-center gap-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${variantBg[item.variant]}`}>
                            <Icon size={16} className="text-white" />
                        </div>
                        <span className="text-sm font-semibold text-main">{item.value}</span>
                        <span className="text-micro text-dim font-medium">{item.label}</span>
                    </GlassCard>
                );
            })}
        </div>
    );
};
