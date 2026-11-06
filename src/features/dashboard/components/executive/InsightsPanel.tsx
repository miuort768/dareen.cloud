import { memo } from 'react'
import type { ExecutiveStats } from '../../services/executiveService'
import { Lightbulb, TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CURRENCY_SYMBOL } from '@/config/constants'
import { AttendanceInsights } from './AttendanceInsights'

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
      text: `نسبة الإشغال ${stats.occupancyRate}% — يمكن تحسين استغلال الموارد والمواعيد المتاحة.`,
      type: 'negative',
    })
  } else if (stats.occupancyRate > 85) {
    insights.push({
      text: `نسبة إشغال ممتازة ${stats.occupancyRate}% — استمرارية عالية في استغلال الجداول.`,
      type: 'positive',
    })
  } else {
    insights.push({
      text: `نسبة الإشغال ${stats.occupancyRate}% — أداء تشغيلي مستقر.`,
      type: 'neutral',
    })
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
      text: `${stats.lowSessionStudentsCount} طالب لديهم جلسات قليلة — يحتاجون متابعة التجديد.`,
      type: 'negative',
    })
  }

  if (stats.overdueInvoicesCount > 5) {
    insights.push({
      text: `${stats.overdueInvoicesCount} فاتورة متأخرة — يُنصح بسرعة متابعة التحصيل.`,
      type: 'negative',
    })
  } else if (stats.overdueInvoicesCount > 0) {
    insights.push({
      text: `${stats.overdueInvoicesCount} فاتورة متأخرة — وضع التحصيل مستقر وتحت المتابعة.`,
      type: 'neutral',
    })
  }

  if (stats.newStudentsThisWeek > 0) {
    insights.push({
      text: `${stats.newStudentsThisWeek} طالب جديد هذا الأسبوع — مؤشر نمو واعد.`,
      type: 'positive',
    })
  }

  if (stats.todayAbsences > 3) {
    insights.push({
      text: `${stats.todayAbsences} غياب اليوم — قد يحتاج تنبيهًا لأولياء الأمور.`,
      type: 'negative',
    })
  }

  if (stats.lateStarts > 2) {
    insights.push({
      text: `${stats.lateStarts} تأخير اليوم — متابعة انضباط المواعيد مع المعلمات.`,
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
      className="flex h-full flex-col rounded-[24px] border border-border bg-card p-5 font-dash shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-soft shadow-soft">
            <Lightbulb size={16} className="text-warning" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-main">الرؤى والتحليلات الذكية</h3>
            <p className="text-[10px] text-muted">مؤشرات تشغيلية مستخرجة آلياً</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {positives > 0 && (
            <span className="border-success/20 flex items-center gap-1 rounded-full border bg-success-soft px-2 py-0.5 text-[10px] font-semibold tabular-nums text-success shadow-soft">
              <TrendingUp size={11} />
              {positives}
            </span>
          )}
          {negatives > 0 && (
            <span className="border-error/20 flex items-center gap-1 rounded-full border bg-error-soft px-2 py-0.5 text-[10px] font-semibold tabular-nums text-error shadow-soft">
              <TrendingDown size={11} />
              {negatives}
            </span>
          )}
        </div>
      </div>

      <div className="custom-scrollbar max-h-72 min-h-36 flex-1 space-y-2 overflow-y-auto pe-1">
        {insights.length === 0 && (
          <div className="py-10 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface shadow-soft">
              <Sparkles size={16} className="text-dim" />
            </div>
            <p className="text-xs font-medium text-main">لا توجد تحليلات كافية بعد</p>
            <p className="mt-0.5 text-[10px] text-muted">
              ستظهر الرؤى التلقائية فور تزايد العمليات اليومية
            </p>
          </div>
        )}
        {insights.map((insight, i) => {
          const cfg = TYPE_CONFIG[insight.type]
          const Icon = cfg.icon
          return (
            <div
              key={`insight-${i}`}
              className={cn(
                'border-border/70 bg-surface/40 group flex items-start gap-2.5 rounded-2xl border border-s-4 p-3 shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-elevation-1',
                cfg.accent,
              )}
            >
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl shadow-soft transition-transform duration-normal group-hover:scale-110',
                  cfg.iconBg,
                )}
              >
                <Icon size={13} className={cfg.iconText} />
              </div>
              <p className="pt-0.5 text-xs font-medium leading-relaxed text-main">{insight.text}</p>
            </div>
          )
        })}
      </div>

      <div className="border-border/70 mt-4 border-t pt-3.5">
        <AttendanceInsights />
      </div>
    </div>
  )
})
