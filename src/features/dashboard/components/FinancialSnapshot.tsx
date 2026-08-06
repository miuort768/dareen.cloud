import { TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CURRENCY_SYMBOL } from '@/config/constants';

interface FinancialSnapshotProps {
    monthNetProfit: number;
    monthRevenue: number;
    expectedCollection: number;
}

export const FinancialSnapshot = ({ monthNetProfit, monthRevenue, expectedCollection }: FinancialSnapshotProps) => {
    const items = [
        { label: 'أرباح هذا الشهر', value: monthNetProfit, icon: TrendingUp, color: 'text-success', bg: 'bg-success-soft', border: 'border-success/50 dark:border-success/20', valueColor: 'text-success' },
        { label: 'المستحق لك', value: expectedCollection, icon: DollarSign, color: 'text-primary', bg: 'bg-primary-soft', border: 'border-primary/50 dark:border-primary/20', valueColor: 'text-primary' },
        { label: 'الإيرادات', value: monthRevenue, icon: Wallet, color: 'text-primary', bg: 'bg-primary-soft', border: 'border-primary/50 dark:border-primary/20', valueColor: 'text-primary' },
    ];

    return (
        <div>
            <h3 className="text-[13px] font-bold text-main mb-3 flex items-center gap-2">
                <Wallet size={13} className="text-success" />
                الملخص المالي
            </h3>
            <div className="space-y-2.5">
                {items.map(item => (
                    <div key={item.label} className={cn("flex items-center gap-3 p-2.5 rounded-xl border", item.bg, item.border)}>
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", item.bg)}>
                            <item.icon size={15} className={item.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-muted">{item.label}</p>
                        </div>
                        <span className={cn("text-sm font-semibold tabular-nums", item.valueColor)}>
                            {item.value.toLocaleString('ar-EG')} <span className="text-[11px] font-bold">{CURRENCY_SYMBOL}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
