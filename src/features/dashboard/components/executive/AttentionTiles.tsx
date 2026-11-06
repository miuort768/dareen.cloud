import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, TrendingDown, UserX, Timer, ChevronLeft } from 'lucide-react'
import type { ExecutiveStats } from '../../services/executiveService'
import { cn } from '@/lib/utils'

const TILES = (s: ExecutiveStats) => [
  {
    id: 'invoices',
    label: 'فواتير متأخرة',
    hint: 'تحتاج تحصيل',
    value: s.overdueInvoicesCount,
    to: '/student-invoices',
    container: 'border-error/25 bg-error-soft/30 hover:bg-error-soft/60 hover:border-error/40',
    iconBg: 'bg-error-soft text-error border border-error/20',
    text: 'text-error',
    icon: Receipt,
  },
  {
    id: 'lowSessions',
    label: 'رصيد جلسات منخفض',
    hint: 'يحتاجون تجديد',
    value: s.lowSessionStudentsCount,
    to: '/students',
    container:
      'border-warning/25 bg-warning-soft/30 hover:bg-warning-soft/60 hover:border-warning/40',
    iconBg: 'bg-warning-soft text-warning border border-warning/20',
    text: 'text-warning',
    icon: TrendingDown,
  },
  {
    id: 'absences',
    label: 'غياب اليوم',
    hint: 'حصص لم تُعقد',
    value: s.todayAbsences,
    to: '/attendance',
    container: 'border-border/80 bg-surface/50 hover:bg-card hover:border-border',
    iconBg: 'bg-surface text-main border border-border',
    text: 'text-main',
    icon: UserX,
  },
  {
    id: 'late',
    label: 'تأخيرات اليوم',
    hint: 'بدأت بعد موعدها',
    value: s.lateStarts,
    to: '/schedule',
    container: 'border-border/80 bg-surface/50 hover:bg-card hover:border-border',
    iconBg: 'bg-surface text-main border border-border',
    text: 'text-main',
    icon: Timer,
  },
]

export const AttentionTiles = memo(function AttentionTiles({ stats }: { stats: ExecutiveStats }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 font-dash xl:grid-cols-4" dir="rtl">
      {TILES(stats).map((tile) => {
        const Icon = tile.icon
        return (
          <Link
            key={tile.id}
            to={tile.to}
            className={cn(
              'group relative flex items-center gap-3 rounded-2xl border p-3.5 shadow-soft outline-none transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-1 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]',
              tile.container,
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-soft transition-transform duration-normal group-hover:scale-110',
                tile.iconBg,
              )}
            >
              <Icon size={17} strokeWidth={2} className={tile.text} />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block font-dash text-xl font-bold tabular-nums leading-none tracking-tight',
                  tile.text,
                )}
              >
                {(tile.value ?? 0).toLocaleString('en-US')}
              </span>
              <span className="mt-1 block truncate text-xs font-medium text-main">
                {tile.label}
              </span>
              <span className="block truncate text-[10px] text-muted">{tile.hint}</span>
            </span>
            <ChevronLeft
              size={15}
              className="shrink-0 text-muted transition-transform duration-normal group-hover:-translate-x-1 group-hover:text-main"
            />
          </Link>
        )
      })}
    </div>
  )
})
