import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { StatCard } from '../../../shared/components/ui/StatCard';

interface FinanceStatsProps {
    totalIncome: number;
    monthIncome: number;
    totalExpenses: number;
    monthExpenses: number;
    totalFixedExpenses: number;
    netProfit: number;
    monthProfit: number;
    reportCurrency?: string;
}

export const FinanceStats = ({
    totalIncome,
    monthIncome,
    totalExpenses,
    monthExpenses,
    totalFixedExpenses,
    netProfit,
    monthProfit,
    reportCurrency = 'KWD',
}: FinanceStatsProps) => {
    const isProfit = (netProfit || 0) >= 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0" dir="rtl">
            <StatCard
                title="إجمالي الإيرادات"
                value={(totalIncome || 0).toLocaleString()}
                icon={TrendingUp}
                variant="success"
                unit={reportCurrency}
                subtitle={`+${(monthIncome || 0).toLocaleString()} هذا الشهر`}
                badge="وارد"
            />
            <StatCard
                title="مستحقات المعلمات"
                value={(totalExpenses || 0).toLocaleString()}
                icon={TrendingDown}
                variant="error"
                unit={reportCurrency}
                subtitle={`-${(monthExpenses || 0).toLocaleString()} هذا الشهر`}
                badge="صادر"
            />
            <StatCard
                title="المصروفات التشغيلية"
                value={(totalFixedExpenses || 0).toLocaleString()}
                icon={Wallet}
                variant="warning"
                unit={reportCurrency}
                subtitle="مصروفات ثابتة"
                badge="ثابت"
            />
            <StatCard
                title="صافي الربح"
                value={(netProfit || 0).toLocaleString()}
                icon={DollarSign}
                variant={isProfit ? 'warning' : 'default'}
                unit={reportCurrency}
                subtitle={`${(monthProfit || 0) >= 0 ? '+' : ''}${(monthProfit || 0).toLocaleString()} هذا الشهر`}
                badge={isProfit ? 'ربح' : 'خسارة'}
            />
        </div>
    );
};
