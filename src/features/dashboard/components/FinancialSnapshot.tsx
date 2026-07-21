import { TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
        <Card>
            <CardContent className="p-5">
            <h3 className="text-xs font-bold text-muted mb-3 flex items-center gap-2">
                <Wallet size={12} className="text-success" />
                الملخص المالي
            </h3>
            <div className="space-y-2.5">
                {items.map(item => (
                    <div key={item.label} className={cn("flex items-center gap-3 p-2.5 rounded-xl border", item.bg, item.border)}>
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", item.bg)}>
                            <item.icon size={15} className={item.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-micro font-bold text-muted">{item.label}</p>
                        </div>
                        <span className={cn("text-sm font-semibold tabular-nums", item.valueColor)}>
                            {item.value.toLocaleString('ar-EG')} <span className="text-micro font-bold">د.ك</span>
                        </span>
                    </div>
                ))}
            </div>
        </CardContent></Card>
    );
};
