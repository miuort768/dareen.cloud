import { TrendingUp, TrendingDown, DollarSign, FileText, Percent } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface FinancialReportProps {
  totalRevenue: number
  monthRevenue: number
  totalExpenses: number
  monthExpenses: number
  netProfit: number
  monthNetProfit: number
  profitMargin?: string
  completedSessions: number
  reportCurrency?: string
}

const FinancialCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  iconBgClass,
  textClass,
  subTextClass,
  currency,
  isPercentage = false,
}: {
  title: string
  value: number | string
  subValue: number | string
  icon: LucideIcon
  iconBgClass: string
  textClass: string
  subTextClass?: string
  currency?: string
  isPercentage?: boolean
}) => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
    <div className="mb-3 flex items-center gap-2">
      <div className={cn('rounded-xl p-2', iconBgClass)}>
        <Icon size={16} className={textClass} />
      </div>
      <h3 className="text-xs font-bold text-muted">{title}</h3>
    </div>
    <p className="text-xl font-extrabold tabular-nums text-main">
      {typeof value === 'number' ? value.toLocaleString() : value} {isPercentage ? '%' : currency}
    </p>
    <p className={`mt-1.5 text-micro font-bold ${subTextClass || textClass}`}>
      هذا الشهر: {typeof subValue === 'number' ? subValue.toLocaleString() : subValue}{' '}
      {isPercentage ? '%' : currency}
    </p>
  </div>
)

export const FinancialReport = ({
  totalRevenue,
  monthRevenue,
  totalExpenses,
  monthExpenses,
  netProfit,
  monthNetProfit,
  profitMargin,
  completedSessions,
  reportCurrency = 'EGP',
}: FinancialReportProps) => {
  // Margin from the server stats when available; computed locally as fallback.
  const overallMargin =
    profitMargin && profitMargin !== '0'
      ? profitMargin
      : totalRevenue > 0
        ? ((netProfit / totalRevenue) * 100).toFixed(1)
        : '0'
  const monthMargin = monthRevenue > 0 ? ((monthNetProfit / monthRevenue) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinancialCard
          title="إجمالي الإيرادات"
          value={totalRevenue}
          subValue={monthRevenue}
          icon={TrendingUp}
          iconBgClass="bg-success-soft"
          textClass="text-success"
          subTextClass="text-success"
          currency={reportCurrency}
        />
        <FinancialCard
          title="إجمالي المصروفات"
          value={totalExpenses}
          subValue={monthExpenses}
          icon={TrendingDown}
          iconBgClass="bg-error-soft"
          textClass="text-error"
          subTextClass="text-error"
          currency={reportCurrency}
        />
        <FinancialCard
          title="صافي الربح"
          value={netProfit}
          subValue={monthNetProfit}
          icon={DollarSign}
          iconBgClass="bg-primary-soft"
          textClass="text-primary"
          subTextClass="text-primary"
          currency={reportCurrency}
        />
        <FinancialCard
          title="هامش الربح"
          value={overallMargin}
          subValue={monthMargin}
          icon={Percent}
          iconBgClass="bg-info-soft"
          textClass="text-info"
          subTextClass="text-info"
          isPercentage
        />
      </div>

      {/* Negative-profit warning — margin is meaningless when revenue ≈ 0 */}
      {totalRevenue <= 0 && totalExpenses > 0 && (
        <div className="rounded-2xl border border-warning-soft bg-warning-soft px-4 py-3 text-xs font-bold text-warning-strong">
          لا توجد إيرادات مسجلة بعد، لذا لا يمكن حساب هامش الربح — المسجل هو مصروفات فقط.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <FileText size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-bold text-main">التقرير المالي والتحليل الدقيق</h3>
            <p className="text-xs font-bold leading-relaxed text-muted">
              تم تحليل <span className="font-bold text-main">{completedSessions}</span> حصة دراسية
              مكتملة، بحيث بلغ إجمالي الإيرادات{' '}
              <span className="font-bold text-success">
                {totalRevenue.toLocaleString()} {reportCurrency}
              </span>{' '}
              مقابل مصروفات إجمالية بقيمة{' '}
              <span className="font-bold text-error">
                {totalExpenses.toLocaleString()} {reportCurrency}
              </span>
              . نتج عن ذلك {netProfit >= 0 ? 'صافي ربح' : 'صافي خسارة'} قدره{' '}
              <span className="font-bold text-primary">
                {Math.abs(netProfit).toLocaleString()} {reportCurrency}
              </span>
              {totalRevenue > 0 && (
                <>
                  {' '}
                  وهامش ربح إجمالي بنسبة{' '}
                  <span className="font-bold text-info">{overallMargin}%</span>
                </>
              )}
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
