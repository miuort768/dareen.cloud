import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  CheckCircle,
  Receipt,
  BatteryLow,
  GraduationCap,
  Presentation,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react'
import type { DashboardStats } from '../types'
import { cn } from '@/lib/utils'

interface StatChip {
  label: string
  value: string
  icon: LucideIcon
  to: string
  tone: string
}

const buildChips = (s: DashboardStats): StatChip[] => [
  {
    label: 'حصص اليوم',
    value: String(s.todaySessions),
    icon: CalendarCheck,
    to: '/schedule',
    tone: 'text-info bg-info-soft',
  },
  {
    label: 'نسبة الحضور',
    value: `${s.attendanceRate}%`,
    icon: CheckCircle,
    to: '/attendance',
    tone: s.attendanceRate >= 90 ? 'text-success bg-success-soft' : 'text-warning bg-warning-soft',
  },
  {
    label: 'فواتير معلقة',
    value: String(s.pendingInvoices),
    icon: Receipt,
    to: '/student-invoices',
    tone: s.pendingInvoices > 5 ? 'text-error bg-error-soft' : 'text-warning bg-warning-soft',
  },
  {
    label: 'رصيد منخفض',
    value: String(s.lowBalanceCount),
    icon: BatteryLow,
    to: '/students',
    tone: s.lowBalanceCount > 0 ? 'text-error bg-error-soft' : 'text-success bg-success-soft',
  },
  {
    label: 'الطلاب',
    value: String(s.studentsCount),
    icon: GraduationCap,
    to: '/students',
    tone: 'text-primary bg-primary-soft',
  },
  {
    label: 'المعلمات',
    value: String(s.teachersCount),
    icon: Presentation,
    to: '/teachers',
    tone: 'text-primary bg-primary-soft',
  },
]

export const StatChipsRow = ({ stats }: { stats: DashboardStats }) => {
  const chips = buildChips(stats)

  return (
    <div
      className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1"
      dir="rtl"
    >
      {chips.map((chip) => {
        const Icon = chip.icon
        return (
          <Link
            key={chip.label}
            to={chip.to}
            className={cn(
              'group w-[108px] shrink-0 snap-start rounded-2xl border border-border bg-card p-3 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.96]',
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className={cn('flex h-8 w-8 items-center justify-center rounded-xl', chip.tone)}
              >
                <Icon size={15} strokeWidth={1.9} />
              </span>
              <ChevronLeft
                size={12}
                className="text-dim opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            <p className="font-dash text-lg font-black tabular-nums leading-none tracking-tight text-main">
              {chip.value}
            </p>
            <p className="mt-1 truncate text-[10px] font-bold text-muted">{chip.label}</p>
          </Link>
        )
      })}
    </div>
  )
}
