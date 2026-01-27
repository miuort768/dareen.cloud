
import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { StatsCard } from '../../../shared/components/StatsCard';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface FinanceStatsProps {
    totalIncome: number;
    monthIncome: number;
    totalExpenses: number;
    monthExpenses: number;
    totalFixedExpenses: number;
    netProfit: number;
    monthProfit: number;
}

export const FinanceStats: React.FC<FinanceStatsProps> = ({
    totalIncome = 0,
    monthIncome = 0,
    totalExpenses = 0,
    monthExpenses = 0,
    totalFixedExpenses = 0,
    netProfit = 0,
    monthProfit = 0
}) => {
    // Helper for safe number formatting
    const format = (val: any) => {
        const num = Number(val);
        return isNaN(num) ? '0' : num.toLocaleString();
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
                title="إجمالي الإيرادات"
                value={format(totalIncome) + ' ' + CURRENCY_SYMBOL}
                icon={TrendingUp}
                color="emerald"
                trend={'هذا الشهر: ' + format(monthIncome)}
            />
            <StatsCard
                title="مصاريف المعلمات"
                value={format(totalExpenses) + ' ' + CURRENCY_SYMBOL}
                icon={TrendingDown}
                color="rose"
                trend={'هذا الشهر: ' + format(monthExpenses)}
            />
            <StatsCard
                title="مصاريف ثابتة"
                value={format(totalFixedExpenses) + ' ' + CURRENCY_SYMBOL}
                icon={Wallet}
                color="amber"
            />
            <StatsCard
                title="صافي الربح"
                value={format(netProfit) + ' ' + CURRENCY_SYMBOL}
                icon={DollarSign}
                color="indigo"
                trend={'هذا الشهر: ' + format(monthProfit)}
            />
        </div>
    );
};
