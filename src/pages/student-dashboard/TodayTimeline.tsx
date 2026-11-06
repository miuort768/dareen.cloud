import { BookOpen, CalendarCheck, CircleDashed, Radio, Star, XCircle } from 'lucide-react'
import { periodLabel } from '../../features/attendance/utils/slotUtils'
import type { TodayTimelineItem } from './types'
import { cn } from '../../lib/utils'

interface TodayTimelineProps {
  items: TodayTimelineItem[]
}

const STATUS_META: Record<
  TodayTimelineItem['status'],
  { label: string; icon: typeof CircleDashed; bar: string; tile: string; chip: string }
> = {
  live: {
    label: 'جارية الآن',
    icon: Radio,
    bar: 'border-s-error',
    tile: 'bg-error-soft text-error',
    chip: 'bg-error text-on-error',
  },
  done: {
    label: 'منجزة',
    icon: CalendarCheck,
    bar: 'border-s-success',
    tile: 'bg-success-soft text-success-strong',
    chip: 'bg-success text-on-success',
  },
  cancelled: {
    label: 'ملغاة',
    icon: XCircle,
    bar: 'border-s-divider',
    tile: 'bg-error-soft text-error',
    chip: 'bg-divider text-muted',
  },
  upcoming: {
    label: 'قادمة',
    icon: CircleDashed,
    bar: 'border-s-info',
    tile: 'bg-info-soft text-info-strong',
    chip: 'bg-info text-on-info',
  },
}

const Detail = ({
  icon: Icon,
  wrap,
  tile,
  label,
  labelClass,
  value,
}: {
  icon: typeof Star
  wrap: string
  tile: string
  label: string
  labelClass: string
  value: string
}) => (
  <div className={cn('flex items-start gap-2.5 rounded-2xl border p-2.5', wrap)}>
    <span
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg shadow-soft',
        tile,
      )}
      aria-hidden="true"
    >
      <Icon size={12} />
    </span>
    <div className="min-w-0">
      <p className={cn('text-[10px] font-bold', labelClass)}>{label}</p>
      <p className="text-xs font-semibold leading-relaxed text-main">{value}</p>
    </div>
  </div>
)

export const TodayTimeline = ({ items }: TodayTimelineProps) => {
  return (
    <section
      aria-label="حصص اليوم"
      className="border-border/80 p-5.5 rounded-[26px] border bg-card shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 md:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-soft">
            <BookOpen size={20} />
          </span>
          <div>
            <h3 className="text-sm font-black text-main">حصص اليوم</h3>
            <p className="text-xs text-muted">الجدول الزمني لحصصك الدراسية لهذا اليوم</p>
          </div>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold tabular-nums text-primary">
          {items.length} {items.length === 1 ? 'حصة' : 'حصص'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="border-border/80 flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center">
          <CalendarCheck size={32} className="text-muted/60" />
          <p className="mt-2 text-xs font-bold text-main">لا توجد حصص مجدولة لليوم</p>
          <p className="text-[11px] text-muted">استمتع بوقتك أو راجع دروسك السابقة</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((item, idx) => {
            const meta = STATUS_META[item.status]
            const StatusIcon = meta.icon
            return (
              <div
                key={item.id || idx}
                className={cn(
                  'border-border/70 bg-surface/40 hover:bg-surface/80 relative rounded-2xl border p-4 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-1',
                  'border-s-4',
                  meta.bar,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-black text-main">{item.subject}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      مع {item.teacher} · {item.hour} {periodLabel(item.period, true)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-soft',
                      meta.chip,
                    )}
                  >
                    <StatusIcon size={12} />
                    <span>{meta.label}</span>
                  </span>
                </div>

                {(item.topics || item.homework) && (
                  <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {item.topics && (
                      <Detail
                        icon={BookOpen}
                        wrap="border-primary/20 bg-primary-soft/40"
                        tile="bg-primary text-on-primary"
                        label="المواضيع"
                        labelClass="text-primary"
                        value={item.topics}
                      />
                    )}
                    {item.homework && (
                      <Detail
                        icon={Star}
                        wrap="border-warning/20 bg-warning-soft/40"
                        tile="bg-warning text-on-warning"
                        label="الواجب"
                        labelClass="text-warning-strong"
                        value={item.homework}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
