import { memo } from 'react'
import { BookOpen, LayoutGrid, CheckCircle, Star, RefreshCw, GraduationCap } from 'lucide-react'
import type { ExecutiveStats } from '../../services/executiveService'
import { cn } from '@/lib/utils'

const OPS = (s: ExecutiveStats) => [
  {
    label: 'جلسات نشطة الآن',
    value: String(s.activeSessions ?? 0),
    icon: BookOpen,
    tone: 'text-success bg-success-soft',
  },
  {
    label: 'نسبة الإشغال',
    value: `${s.occupancyRate ?? 0}%`,
    icon: LayoutGrid,
    tone:
      (s.occupancyRate ?? 0) >= 75
        ? 'text-success bg-success-soft'
        : 'text-warning bg-warning-soft',
  },
  {
    label: 'نسبة الحضور',
    value: `${s.attendanceRate ?? 0}%`,
    icon: CheckCircle,
    tone:
      (s.attendanceRate ?? 0) >= 90
        ? 'text-success bg-success-soft'
        : 'text-warning bg-warning-soft',
  },
  {
    label: 'متوسط تقييم الحصص',
    value: (s.avgRating ?? 0).toFixed(1),
    icon: Star,
    tone: 'text-primary bg-primary-soft',
  },
  {
    label: 'نسبة التجديد',
    value: `${s.renewalRate ?? 0}%`,
    icon: RefreshCw,
    tone:
      (s.renewalRate ?? 0) >= 70 ? 'text-success bg-success-soft' : 'text-warning bg-warning-soft',
  },
  {
    label: 'طلاب جدد هذا الأسبوع',
    value: `+${s.newStudentsThisWeek ?? 0}`,
    icon: GraduationCap,
    tone: 'text-info bg-info-soft',
  },
]

export const OpsMetrics = memo(function OpsMetrics({ stats }: { stats: ExecutiveStats }) {
  return (
    <div
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-divider font-dash sm:grid-cols-3 lg:grid-cols-6"
      dir="rtl"
    >
      {OPS(stats).map((m) => {
        const Icon = m.icon
        return (
          <div
            key={m.label}
            className="flex flex-col gap-2.5 bg-card p-4 transition-colors hover:bg-surface"
          >
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', m.tone)}>
              <Icon size={15} strokeWidth={1.9} />
            </span>
            <span className="font-dash text-lg font-black tabular-nums leading-none tracking-tight text-main md:text-xl">
              {m.value}
            </span>
            <span className="text-[10px] font-bold leading-tight text-muted">{m.label}</span>
          </div>
        )
      })}
    </div>
  )
})
