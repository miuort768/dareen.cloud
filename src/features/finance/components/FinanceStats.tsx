
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
    totalIncome,
    monthIncome,
    totalExpenses,
    monthExpenses,
    totalFixedExpenses,
    netProfit,
    monthProfit
}) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="إجمالي الإيرادات"
                value={totalIncome.toLocaleString() + ' ' + CURRENCY_SYMBOL}
                icon={TrendingUp}
                color="green"
                trend={'هذا الشهر: ' + monthIncome.toLocaleString()}
            />
            <StatsCard
                title="مصاريف المعلمات"
                value={totalExpenses.toLocaleString() + ' ' + CURRENCY_SYMBOL}
                icon={TrendingDown}
                color="rose"
                trend={'هذا الشهر: ' + monthExpenses.toLocaleString()}
            />
            <StatsCard
                title="مصاريف ثابتة"
                value={totalFixedExpenses.toLocaleString() + ' ' + CURRENCY_SYMBOL}
                icon={Wallet}
                color="rose"
            />
            <StatsCard
                title="صافي الربح"
                value={netProfit.toLocaleString() + ' ' + CURRENCY_SYMBOL}
                icon={DollarSign}
                color="green"
                trend={'هذا الشهر: ' + monthProfit.toLocaleString()}
            />
        </div>
    );
};
