import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, TrendingDown, UserX, Timer, ChevronLeft } from 'lucide-react'
import type { ExecutiveStats } from '../../services/executiveService'
import { cn } from '@/lib/utils'

const TILES = (s: ExecutiveStats) => [
  {
    id: 'invoices',
    label: 'فواتير متأخرة',
    value: s.overdueInvoicesCount,
    to: '/student-invoices',
    tile: 'border-error-soft bg-error-soft hover:bg-error-soft',
    text: 'text-error',
    icon: Receipt,
  },
  {
    id: 'lowSessions',
    label: 'طلاب برصيد جلسات منخفض',
    value: s.lowSessionStudentsCount,
    to: '/students',
    tile: 'border-warning-soft bg-warning-soft hover:bg-warning-soft',
    text: 'text-warning',
    icon: TrendingDown,
  },
  {
    id: 'absences',
    label: 'غياب اليوم',
    value: s.todayAbsences,
    to: '/attendance',
    tile: 'border-border bg-surface hover:bg-hover dark:bg-card dark:hover:bg-hover',
    text: 'text-main',
    icon: UserX,
  },
  {
    id: 'late',
    label: 'تأخيرات اليوم',
    value: s.lateStarts,
    to: '/schedule',
    tile: 'border-border bg-surface hover:bg-hover dark:bg-card dark:hover:bg-hover',
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
              'group flex items-center gap-3 rounded-2xl border p-3.5 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]',
              tile.tile,
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card shadow-elevation-1',
              )}
            >
              <Icon size={16} strokeWidth={1.9} className={cn(tile.text, 'opacity-80')} />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block font-dash text-lg font-black tabular-nums leading-none',
                  tile.text,
                )}
              >
                {(tile.value ?? 0).toLocaleString('en-US')}
              </span>
              <span className="mt-1 block truncate text-[10px] font-bold text-muted">
                {tile.label}
              </span>
            </span>
            <ChevronLeft
              size={14}
              className="shrink-0 text-dim opacity-0 transition-all duration-200 group-hover:opacity-100"
            />
          </Link>
        )
      })}
    </div>
  )
})
