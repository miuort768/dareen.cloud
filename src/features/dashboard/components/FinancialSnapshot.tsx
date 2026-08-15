import { TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialSnapshotProps {
    monthNetProfit: number;
    monthRevenue: number;
    expectedCollection: number;
}

export const FinancialSnapshot = ({ monthNetProfit, monthRevenue, expectedCollection }: FinancialSnapshotProps) => {
    const items = [
        { label: 'أرباح هذا الشهر', value: monthNetProfit, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', valueColor: 'text-success' },
        { label: 'المستحق لك', value: expectedCollection, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', valueColor: 'text-primary' },
        { label: 'الإيرادات', value: monthRevenue, icon: Wallet, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', valueColor: 'text-primary' },
    ];

    return (
        <div>
            <h3 className="text-[13px] font-bold text-main dark:text-main mb-3 flex items-center gap-2">
                <Wallet size={13} className="text-success dark:text-primary" />
                الملخص المالي
            </h3>
            <div className="space-y-2.5">
                {items.map(item => (
                    <div key={item.label} className={cn("flex items-center gap-3 p-3 rounded-xl border", item.bg, item.border)}>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.bg)}>
                            <item.icon size={16} className={item.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-muted dark:text-muted">{item.label}</p>
                        </div>
                        <span className={cn("text-sm font-semibold tabular-nums", item.valueColor)}>
                            {item.value.toLocaleString('ar-EG')} <span className="text-[11px] font-bold">ج.م</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
