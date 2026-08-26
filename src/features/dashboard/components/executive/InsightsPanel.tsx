import { memo } from 'react'
import type { ExecutiveStats } from '../../services/executiveService'
import { Lightbulb, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CURRENCY_SYMBOL } from '@/config/constants'

type InsightType = 'positive' | 'negative' | 'neutral'

interface Insight {
  text: string
  type: InsightType
}

function buildInsights(stats: ExecutiveStats): Insight[] {
  const insights: Insight[] = []

  if (stats.occupancyRate < 60) {
    insights.push({
      text: `نسبة الإشغال ${stats.occupancyRate}% — يمكن تحسين استغلال الموارد.`,
      type: 'negative',
    })
  } else if (stats.occupancyRate > 85) {
    insights.push({
      text: `نسبة إشغال ممتازة ${stats.occupancyRate}% — استمر بنفس المستوى.`,
      type: 'positive',
    })
  } else {
    insights.push({ text: `نسبة الإشغال ${stats.occupancyRate}% — أداء جيد.`, type: 'neutral' })
  }

  if (stats.mostProfitableSubject?.name) {
    insights.push({
      text: `المادة الأكثر ربحاً: ${stats.mostProfitableSubject.name} (${stats.mostProfitableSubject.revenue.toLocaleString()} ${CURRENCY_SYMBOL})`,
      type: 'positive',
    })
  }

  if (stats.mostActiveTeacher?.name) {
    insights.push({
      text: `المعلم الأكثر نشاطاً: ${stats.mostActiveTeacher.name} (${stats.mostActiveTeacher.sessions} جلسة)`,
      type: 'positive',
    })
  }

  if (stats.lowSessionStudentsCount > 0) {
    insights.push({
      text: `${stats.lowSessionStudentsCount} طالب لديهم جلسات قليلة — قد يحتاجون متابعة.`,
      type: 'negative',
    })
  }

  if (stats.overdueInvoicesCount > 5) {
    insights.push({
      text: `${stats.overdueInvoicesCount} فاتورة متأخرة — يُنصح بمتابعة التحصيل.`,
      type: 'negative',
    })
  } else if (stats.overdueInvoicesCount > 0) {
    insights.push({
      text: `${stats.overdueInvoicesCount} فاتورة متأخرة — وضع جيد.`,
      type: 'neutral',
    })
  }

  if (stats.newStudentsThisWeek > 0) {
    insights.push({
      text: `${stats.newStudentsThisWeek} طالب جديد هذا الأسبوع — نمو إيجابي.`,
      type: 'positive',
    })
  }

  if (stats.todayAbsences > 3) {
    insights.push({
      text: `${stats.todayAbsences} غياب اليوم — قد يحتاج تنبيه لأولياء الأمور.`,
      type: 'negative',
    })
  }

  if (stats.lateStarts > 2) {
    insights.push({
      text: `${stats.lateStarts} تأخير اليوم — متابعة الالتزام بالمواعيد.`,
      type: 'negative',
    })
  }

  return insights
}

const TYPE_CONFIG: Record<
  InsightType,
  { icon: typeof Lightbulb; textClass: string; bgClass: string; iconBg: string }
> = {
  positive: {
    icon: TrendingUp,
    textClass: 'text-success',
    bgClass: 'bg-success-soft border-border',
    iconBg: 'bg-success-soft',
  },
  negative: {
    icon: TrendingDown,
    textClass: 'text-error',
    bgClass: 'bg-error-soft border-border',
    iconBg: 'bg-error-soft',
  },
  neutral: {
    icon: Target,
    textClass: 'text-info',
    bgClass: 'bg-info-soft border-border',
    iconBg: 'bg-info-soft',
  },
}

export const InsightsPanel = memo(function InsightsPanel({ stats }: { stats: ExecutiveStats }) {
  if (!stats) return null
  const insights = buildInsights(stats)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 font-dash" dir="rtl">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-soft">
          <Lightbulb size={16} className="text-warning" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-main">تحليلات ذكية</h3>
          <p className="text-[10px] text-muted">رؤى وتوصيات</p>
        </div>
      </div>

      <div className="space-y-2">
        {insights.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
              <Lightbulb size={16} className="text-dim" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد تحليلات</p>
          </div>
        )}
        {insights.map((insight, i) => {
          const cfg = TYPE_CONFIG[insight.type]
          const Icon = cfg.icon
          return (
            <div
              key={`insight-${i}`}
              className={cn(
                'flex items-start gap-2.5 rounded-xl border p-3 transition-colors',
                cfg.bgClass,
              )}
            >
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  cfg.iconBg,
                )}
              >
                <Icon size={12} className={cfg.textClass} />
              </div>
              <p className="text-[11px] leading-relaxed text-main">{insight.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
})
