import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { getCurrencySymbol } from '../../../config/constants'

interface MonthlyData {
  month: string
  income: number
  expense: number
}
interface PieData {
  name: string
  value: number
}

interface FinanceChartsProps {
  monthlyData: MonthlyData[]
  pieData: PieData[]
  totalExpenses: number
  reportCurrency?: string
}

const TOP_EXPENSE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
]
const PERIODS = ['شهري', 'ربعي', 'سنوي'] as const
type Period = (typeof PERIODS)[number]

const aggregateByPeriod = (data: MonthlyData[], period: Period): MonthlyData[] => {
  if (period === 'شهري' || data.length <= 3) return data
  const chunkSize = period === 'ربعي' ? 3 : data.length
  const result: MonthlyData[] = []
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    result.push({
      month:
        chunk.length > 1 ? `${chunk[0]!.month}-${chunk[chunk.length - 1]!.month}` : chunk[0]!.month,
      income: chunk.reduce((s, d) => s + d.income, 0),
      expense: chunk.reduce((s, d) => s + d.expense, 0),
    })
  }
  return result
}

export const FinanceCharts = ({
  monthlyData,
  pieData,
  totalExpenses,
  reportCurrency = 'EGP',
}: FinanceChartsProps) => {
  const [period, setPeriod] = useState<Period>('شهري')
  const chartData = useMemo(() => aggregateByPeriod(monthlyData, period), [monthlyData, period])
  const sortedPie = useMemo(() => [...pieData].sort((a, b) => b.value - a.value), [pieData])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 gap-4 lg:grid-cols-5"
      dir="rtl"
    >
      {/* Area chart â€” spans 3 cols */}
      <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm lg:col-span-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-main">تحليل التدفق النقدي</h3>
            <p className="mt-0.5 text-[9px] text-muted">مقارنة الإيرادات والمصاريف</p>
          </div>
          <div className="flex gap-0.5 rounded-lg bg-surface p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`relative rounded-md px-2 py-1 text-[8px] font-bold transition-all ${period === p ? 'text-on-primary' : 'text-muted hover:text-main'}`}
              >
                {period === p && (
                  <motion.div
                    layoutId="finance-period-pill"
                    className="absolute inset-0 rounded-md bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{p}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-3 rounded bg-success" />
            <span className="text-[8px] font-bold text-muted">إيرادات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-3 rounded bg-error" />
            <span className="text-[8px] font-bold text-muted">مصروفات</span>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="finIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="finExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--text-dim)', fontSize: 8, fontWeight: 800 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fill: 'var(--text-dim)', fontSize: 8, fontWeight: 800 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                width={36}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div
                      className="min-w-[140px] rounded-xl border border-border bg-card px-3 py-2.5 shadow-elevation-2"
                      dir="rtl"
                    >
                      <p className="mb-1.5 border-b border-divider pb-1 text-[9px] font-bold text-main">
                        {label}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1">
                            <TrendingUp size={9} className="text-success" />
                            <span className="text-[8px] font-bold text-muted">إيرادات</span>
                          </div>
                          <span className="text-xs font-bold tabular-nums text-main">
                            +{(payload[0]?.value ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1">
                            <TrendingDown size={9} className="text-error" />
                            <span className="text-[8px] font-bold text-muted">مصروفات</span>
                          </div>
                          <span className="text-xs font-bold tabular-nums text-main">
                            -{(payload[1]?.value ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }}
                cursor={{ stroke: 'var(--chart-1)', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#finIncomeGrad)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--chart-2)' }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--chart-3)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#finExpenseGrad)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--chart-3)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut chart â€” spans 2 cols */}
      <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm lg:col-span-2">
        <h3 className="mb-3 text-xs font-bold text-main">تصنيف المصروفات</h3>
        <div className="flex h-[calc(100%-2rem)] flex-col items-center justify-center">
          <div className="relative h-36 w-full" dir="ltr">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={TOP_EXPENSE_COLORS[i % TOP_EXPENSE_COLORS.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const d = payload[0].payload
                          return (
                            <div
                              className="rounded-xl border border-border bg-card px-2.5 py-1.5 shadow-elevation-2"
                              dir="rtl"
                            >
                              <p className="text-[8px] font-bold text-muted">{d.name}</p>
                              <p className="text-xs font-bold tabular-nums text-main">
                                {(d?.value ?? 0).toLocaleString()}{' '}
                                <span className="text-[8px] text-muted">
                                  {getCurrencySymbol(reportCurrency)}
                                </span>
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[8px] font-bold text-muted">الإجمالي</p>
                  <p className="text-sm font-bold tabular-nums text-main">
                    {(totalExpenses ?? 0).toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center opacity-40">
                <p className="text-[9px] font-bold text-muted">لا توجد بيانات</p>
              </div>
            )}
          </div>
          <div className="mt-3 w-full space-y-1.5">
            {sortedPie.slice(0, 4).map((entry, i) => {
              const pct = totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).toFixed(0) : 0
              return (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--chart-${(i % 6) + 1})` }}
                    />
                    <span className="max-w-[90px] truncate text-[8px] font-bold text-muted">
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold tabular-nums text-main">
                      {(entry.value ?? 0).toLocaleString()}
                    </span>
                    <span className="rounded bg-surface px-1 py-0.5 text-[7px] font-bold text-muted">
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
