import { memo } from 'react'
import type { ExecutiveStats } from '../../services/executiveService'
import { Lightbulb, TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CURRENCY_SYMBOL } from '@/config/constants'

type InsightType = 'positive' | 'negative' | 'neutral'

interface Insight {
  text: string
  type: InsightType
}

function formatHour(h: number): string {
  if (h === 0) return '12 ص'
  if (h === 12) return '12 م'
  return h < 12 ? `${h} ص` : `${h - 12} م`
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
      text: `المادة الأكثر ربحاً: ${stats.mostProfitableSubject.name} (${(stats.mostProfitableSubject.revenue ?? 0).toLocaleString()} ${CURRENCY_SYMBOL})`,
      type: 'positive',
    })
  }

  if (stats.mostActiveTeacher?.name) {
    insights.push({
      text: `المعلم الأكثر نشاطاً: ${stats.mostActiveTeacher.name} (${stats.mostActiveTeacher.sessions ?? 0} جلسة)`,
      type: 'positive',
    })
  }

  if (stats.mostAttendedSubject?.name) {
    insights.push({
      text: `أكثر مادة حضوراً: ${stats.mostAttendedSubject.name} (${stats.mostAttendedSubject.sessions ?? 0} حصة)`,
      type: 'neutral',
    })
  }

  if (stats.busiestDay?.name) {
    insights.push({
      text: `أكثر يوم حضوراً: ${stats.busiestDay.name} (${stats.busiestDay.sessions ?? 0} حصة)`,
      type: 'neutral',
    })
  }

  if (
    stats.busiestHour &&
    stats.busiestHour.hour !== null &&
    stats.busiestHour.hour !== undefined
  ) {
    insights.push({
      text: `أكثر ساعة إشغالاً: ${formatHour(stats.busiestHour.hour)} — ${stats.busiestHour.share ?? 0}% من الحصص`,
      type: 'neutral',
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
  { icon: typeof Lightbulb; accent: string; iconBg: string; iconText: string }
> = {
  positive: {
    icon: TrendingUp,
    accent: 'border-s-success',
    iconBg: 'bg-success-soft',
    iconText: 'text-success',
  },
  negative: {
    icon: TrendingDown,
    accent: 'border-s-error',
    iconBg: 'bg-error-soft',
    iconText: 'text-error',
  },
  neutral: {
    icon: Target,
    accent: 'border-s-info',
    iconBg: 'bg-info-soft',
    iconText: 'text-info',
  },
}

export const InsightsPanel = memo(function InsightsPanel({ stats }: { stats: ExecutiveStats }) {
  if (!stats) return null
  const insights = buildInsights(stats)
  const positives = insights.filter((i) => i.type === 'positive').length
  const negatives = insights.filter((i) => i.type === 'negative').length

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 font-dash"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-soft">
            <Lightbulb size={16} className="text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-main">تحليلات ذكية</h3>
            <p className="text-[10px] text-muted">رؤى مبنية على بيانات اليوم</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {positives > 0 && (
            <span className="flex items-center gap-0.5 rounded-lg bg-success-soft px-1.5 py-0.5 text-[10px] font-black tabular-nums text-success">
              <TrendingUp size={9} />
              {positives}
            </span>
          )}
          {negatives > 0 && (
            <span className="flex items-center gap-0.5 rounded-lg bg-error-soft px-1.5 py-0.5 text-[10px] font-black tabular-nums text-error">
              <TrendingDown size={9} />
              {negatives}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {insights.length === 0 && (
          <div className="py-10 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
              <Sparkles size={16} className="text-dim" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد تحليلات بعد</p>
            <p className="mt-0.5 text-[10px] text-dim">ستظهر الرؤى عند توفر بيانات كافية</p>
          </div>
        )}
        {insights.map((insight, i) => {
          const cfg = TYPE_CONFIG[insight.type]
          const Icon = cfg.icon
          return (
            <div
              key={`insight-${i}`}
              className={cn(
                'flex items-start gap-2.5 rounded-xl border border-s-4 border-border bg-surface p-3 transition-colors hover:bg-hover',
                cfg.accent,
              )}
            >
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  cfg.iconBg,
                )}
              >
                <Icon size={12} className={cfg.iconText} />
              </div>
              <p className="pt-1 text-[11px] leading-relaxed text-main">{insight.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
})
