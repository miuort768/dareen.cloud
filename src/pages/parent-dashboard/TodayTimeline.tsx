import { BookOpen, CalendarCheck, CircleDashed, FileText, Radio, Star, XCircle } from 'lucide-react'
import { periodLabel } from '../../features/attendance/utils/slotUtils'
import type { TodayTimelineItem } from './types'
import { cn } from '../../lib/utils'

interface TodayTimelineProps {
  items: TodayTimelineItem[]
  /** نسخة مصغّرة بشبكة عمودين للعمود الجانبي على الكمبيوتر */
  compact?: boolean
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
  <div className={cn('flex items-start gap-2 rounded-xl border p-2', wrap)}>
    <span
      className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', tile)}
      aria-hidden="true"
    >
      <Icon size={12} />
    </span>
    <div className="min-w-0">
      <p className={cn('text-[10px] font-black', labelClass)}>{label}</p>
      <p className="text-[11px] font-bold leading-relaxed text-main">{value}</p>
    </div>
  </div>
)

export const TodayTimeline = ({ items, compact = false }: TodayTimelineProps) => {
  return (
    <section aria-label="حصص اليوم">
      <div className={cn('flex items-center gap-3', compact ? 'mb-3' : 'mb-4')}>
        <span
          className={cn(
            'flex shrink-0 items-center justify-center bg-primary-soft text-primary',
            compact ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-xl',
          )}
        >
          <CalendarCheck size={compact ? 16 : 18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn('font-black text-main', compact ? 'text-xs' : 'text-sm')}>حصص اليوم</h3>
          <p className={cn('font-bold text-muted', compact ? 'text-[10px]' : 'text-[11px]')}>
            متابعة جلسات أبنائك لهذا اليوم
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full bg-primary-soft font-black tabular-nums text-primary',
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
          )}
        >
          {items.length} {items.length === 1 ? 'حصة' : 'حصص'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-10 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <CalendarCheck size={22} />
          </span>
          <p className="text-xs font-bold text-muted">يوم مريح — لا توجد حصص مجدولة لأبنائك</p>
        </div>
      ) : (
        <ol
          className={cn(
            'grid gap-3',
            compact ? 'grid-cols-1 gap-2.5' : 'grid-cols-1 lg:grid-cols-2',
          )}
          role="list"
        >
          {items.map((item) => {
            const meta = STATUS_META[item.status] ?? STATUS_META.upcoming
            const Icon = meta.icon
            return (
              <li key={item.id}>
                <div
                  className={cn(
                    'h-full border border-s-4 border-border bg-card shadow-soft transition-all duration-slow hover:-translate-y-0.5 hover:shadow-elevation-1',
                    compact ? 'rounded-none p-3.5' : 'rounded-2xl p-5',
                    meta.bar,
                    item.status === 'cancelled' && 'opacity-70',
                    item.status === 'live' && 'border-s-error bg-error-soft',
                  )}
                >
                  <div className={cn('flex items-center', compact ? 'gap-3' : 'gap-2.5')}>
                    <span
                      className={cn(
                        'flex shrink-0 items-center justify-center',
                        compact ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-xl',
                        meta.tile,
                      )}
                      aria-hidden="true"
                    >
                      <Icon size={compact ? 15 : 18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={cn(compact ? 'flex items-center gap-2' : 'block')}>
                        <p
                          className={cn(
                            'truncate font-black text-main',
                            compact ? 'text-sm' : 'text-xs',
                          )}
                        >
                          {item.studentName}
                        </p>
                        {compact && (
                          <span
                            className={cn(
                              'inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-black',
                              meta.chip,
                            )}
                          >
                            <Icon size={9} />
                            {meta.label}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[11px] font-bold text-muted">
                        {item.subject}
                        {item.teacher ? ` · ${item.teacher}` : ''}
                      </p>
                    </div>
                    <div className="inline-flex shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface text-center">
                      <span
                        className={cn(
                          'font-dash font-black tabular-nums leading-none text-main',
                          compact ? 'px-2.5 py-1 text-sm' : 'px-2.5 py-1.5 text-base',
                        )}
                      >
                        {item.hour}
                      </span>
                      <span className="mt-0.5 text-[9px] font-bold text-muted">
                        {periodLabel(item.period)}
                      </span>
                    </div>
                  </div>

                  {!compact && (
                    <span
                      className={cn(
                        'mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                        meta.chip,
                      )}
                    >
                      <Icon size={10} />
                      {meta.label}
                    </span>
                  )}

                  {(item.topics || item.homework || item.notes) && (
                    <div className="mt-2 space-y-1.5">
                      {item.status === 'done' && item.topics && (
                        <Detail
                          icon={BookOpen}
                          wrap="border-success-soft bg-success-soft"
                          tile="bg-success text-on-success"
                          label="ما تم إنجازه"
                          labelClass="text-success-strong"
                          value={item.topics}
                        />
                      )}
                      {item.status === 'done' && item.homework && (
                        <Detail
                          icon={Star}
                          wrap="border-warning-soft bg-warning-soft dark:border-primary-soft dark:bg-primary-soft"
                          tile="bg-warning text-on-warning dark:bg-primary dark:text-on-primary"
                          label="الواجب"
                          labelClass="text-warning-strong dark:text-primary"
                          value={item.homework}
                        />
                      )}
                      {item.notes && (
                        <Detail
                          icon={FileText}
                          wrap="border-primary-soft bg-primary-soft"
                          tile="bg-primary text-on-primary"
                          label="ملاحظة للجلسة القادمة"
                          labelClass="text-primary"
                          value={item.notes}
                        />
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
