import { CalendarCheck, CircleDashed, XCircle, FileText, Radio } from 'lucide-react'
import { periodLabel } from '../../features/attendance/utils/slotUtils'
import type { TodayTimelineItem } from './types'
import { cn } from '../../lib/utils'

interface TodayTimelineProps {
  items: TodayTimelineItem[]
}

const STATUS_META: Record<
  TodayTimelineItem['status'],
  { dot: string; text: string; label: string; icon: typeof CircleDashed }
> = {
  live: { dot: 'bg-error', text: 'text-error', label: 'جارية الآن', icon: Radio },
  done: { dot: 'bg-success', text: 'text-success', label: 'منجزة', icon: CalendarCheck },
  cancelled: { dot: 'bg-error', text: 'text-error', label: 'ملغاة', icon: XCircle },
  upcoming: { dot: 'bg-primary', text: 'text-primary', label: 'قادمة', icon: CircleDashed },
}

export const TodayTimeline = ({ items }: TodayTimelineProps) => {
  return (
    <section
      aria-label="حصص اليوم"
      className="rounded-none border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-black text-main">حصص اليوم</h3>
        <span className="rounded-none bg-primary-soft px-2.5 py-1 text-[11px] font-black tabular-nums text-primary">
          {items.length} {items.length === 1 ? 'حصة' : 'حصص'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-none border border-dashed border-border py-10 text-center">
          <CalendarCheck size={28} className="mx-auto mb-2 text-muted" />
          <p className="text-xs font-bold text-muted">يوم مريح — لا توجد حصص مجدولة</p>
        </div>
      ) : (
        <ol className="relative space-y-3" role="list">
          <div className="absolute bottom-3 end-[19px] top-3 w-px bg-divider" aria-hidden="true" />
          {items.map((item) => {
            const meta = STATUS_META[item.status]
            const Icon = meta.icon
            return (
              <li key={item.id} className="relative flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'rounded-none border bg-surface p-3 transition-colors duration-300',
                      item.status === 'done' && 'border-border',
                      item.status === 'cancelled' && 'border-border opacity-60',
                      item.status === 'upcoming' && 'border-primary/20',
                      item.status === 'live' && 'border-error/40 bg-error-soft',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-main">{item.subject}</p>
                        <p className="truncate text-[10px] font-bold text-muted">{item.teacher}</p>
                      </div>
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1 rounded-none px-2 py-1 text-[10px] font-black',
                          item.status === 'live' ? 'bg-surface' : 'bg-divider/50',
                          meta.text,
                        )}
                      >
                        <Icon size={10} />
                        {meta.label}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="mt-2 flex items-start gap-1.5 rounded-none border border-primary/20 bg-primary-soft p-2 text-[10px] font-bold leading-relaxed text-main">
                        <FileText size={10} className="mt-0.5 shrink-0 text-primary" />
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="z-10 flex w-14 shrink-0 flex-col items-center">
                  <span className="text-xs font-black tabular-nums text-main">{item.hour}</span>
                  <span className="text-[9px] font-bold text-muted">
                    {periodLabel(item.period)}
                  </span>
                  <span
                    className={cn('mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-surface', meta.dot)}
                  />
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
