import { memo } from 'react'
import {
  BookOpen,
  LayoutGrid,
  CheckCircle,
  Star,
  RefreshCw,
  GraduationCap,
  Activity,
} from 'lucide-react'
import type { ExecutiveStats } from '../../services/executiveService'
import { cn } from '@/lib/utils'

interface OpsItem {
  label: string
  sublabel: string
  value: string
  icon: typeof BookOpen
  tone: string
  highlight?: boolean
}

const OPS = (s: ExecutiveStats): OpsItem[] => [
  {
    label: 'جلسات نشطة الآن',
    sublabel: 'قيد البث المباشر',
    value: String(s.activeSessions ?? 0),
    icon: BookOpen,
    tone: 'text-success bg-success-soft border border-success/20',
    highlight: (s.activeSessions ?? 0) > 0,
  },
  {
    label: 'نسبة الإشغال',
    sublabel: 'استغلال المواعيد',
    value: `${s.occupancyRate ?? 0}%`,
    icon: LayoutGrid,
    tone:
      (s.occupancyRate ?? 0) >= 75
        ? 'text-success bg-success-soft border border-success/20'
        : 'text-warning bg-warning-soft border border-warning/20',
  },
  {
    label: 'نسبة الحضور',
    sublabel: 'معدل الالتزام',
    value: `${s.attendanceRate ?? 0}%`,
    icon: CheckCircle,
    tone:
      (s.attendanceRate ?? 0) >= 90
        ? 'text-success bg-success-soft border border-success/20'
        : 'text-warning bg-warning-soft border border-warning/20',
  },
  {
    label: 'متوسط تقييم الحصص',
    sublabel: 'جودة الشرح والدروس',
    value: (s.avgRating ?? 0).toFixed(1),
    icon: Star,
    tone: 'text-primary bg-primary-soft border border-primary/20',
  },
  {
    label: 'نسبة التجديد',
    sublabel: 'ولاء واستمرار الطلاب',
    value: `${s.renewalRate ?? 0}%`,
    icon: RefreshCw,
    tone:
      (s.renewalRate ?? 0) >= 70
        ? 'text-success bg-success-soft border border-success/20'
        : 'text-warning bg-warning-soft border border-warning/20',
  },
  {
    label: 'طلاب جدد هذا الأسبوع',
    sublabel: 'نمو قاعدة المشتركين',
    value: `+${s.newStudentsThisWeek ?? 0}`,
    icon: GraduationCap,
    tone: 'text-info bg-info-soft border border-info/20',
  },
]

export const OpsMetrics = memo(function OpsMetrics({ stats }: { stats: ExecutiveStats }) {
  return (
    <div
      className="rounded-[24px] border border-border bg-card p-4 font-dash shadow-elevation-1 sm:p-5"
      dir="rtl"
    >
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-success">
            <Activity size={13} />
          </span>
          <h2 className="text-xs font-semibold text-main">مؤشرات الكفاءة التشغيلية</h2>
        </div>
        <span className="text-[10px] text-muted">تحديث مباشر على مدار الساعة</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {OPS(stats).map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="border-border/70 bg-surface/40 group relative flex flex-col justify-between gap-3 rounded-2xl border p-3.5 transition-all duration-normal hover:-translate-y-0.5 hover:border-border hover:bg-surface hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl shadow-soft transition-transform duration-normal group-hover:scale-110',
                    m.tone,
                  )}
                >
                  <Icon size={16} strokeWidth={2} />
                </span>
                {m.highlight && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                )}
              </div>
              <div>
                <span className="block font-dash text-xl font-bold tabular-nums leading-none tracking-tight text-main sm:text-2xl">
                  {m.value}
                </span>
                <span className="mt-1.5 block truncate text-xs font-semibold text-main">
                  {m.label}
                </span>
                <span className="block truncate text-[10px] text-muted">{m.sublabel}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
