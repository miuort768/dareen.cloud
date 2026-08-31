import { Snowflake, User, CalendarDays, FileText } from 'lucide-react'
import type { SubjectProgress } from './types'
import { cn } from '../../lib/utils'

interface SubjectsBoardProps {
  subjects: SubjectProgress[]
}

const RING_TONES = ['text-primary', 'text-success', 'text-info', 'text-warning', 'text-error']

const ProgressRing = ({ value, tone }: { value: number; tone: string }) => {
  const size = 52
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-divider"
          strokeWidth="5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          className={cn(tone, 'transition-all duration-1000 ease-out')}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black tabular-nums text-main">{value}%</span>
      </div>
    </div>
  )
}

export const SubjectsBoard = ({ subjects }: SubjectsBoardProps) => {
  if (subjects.length === 0) return null

  return (
    <section aria-label="المواد الدراسية" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-black text-main">موادي الدراسية</h3>
        <span className="text-[11px] font-bold text-muted">
          {subjects.length} {subjects.length === 1 ? 'مادة' : 'مواد'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((sub, idx) => {
          const tone = RING_TONES[idx % RING_TONES.length]!
          return (
            <article
              key={sub.id}
              className={cn(
                'rounded-3xl border p-4 shadow-sm transition-all duration-200 hover:shadow-elevation-1',
                sub.isFrozen ? 'bg-divider/20 border-border' : 'border-border bg-surface',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-main">{sub.subject}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-bold text-muted">
                    <User size={9} className="shrink-0" />
                    {sub.teacher}
                  </p>
                </div>
                {sub.isFrozen ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-divider px-2 py-1 text-[9px] font-black text-muted">
                    <Snowflake size={10} /> مجمّدة
                  </span>
                ) : (
                  <ProgressRing value={sub.percent} tone={tone} />
                )}
              </div>

              {!sub.isFrozen && (
                <div className="bg-divider/40 mt-3 flex items-center justify-between rounded-xl px-3 py-2">
                  <span className="text-[10px] font-black text-muted">المنهج</span>
                  <span className={cn('text-xs font-black tabular-nums', tone)}>
                    {sub.used}
                    <span className="text-[10px] font-bold text-muted"> / {sub.total} حصة</span>
                  </span>
                </div>
              )}

              {sub.weekDays.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {sub.weekDays.map((d, i) => (
                    <span
                      key={`${sub.id}-day-${i}`}
                      className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-1.5 py-0.5 text-[9px] font-black text-primary"
                    >
                      <CalendarDays size={8} />
                      {d}
                    </span>
                  ))}
                </div>
              )}

              {sub.notes && (
                <p className="border-warning/20 mt-3 flex items-start gap-1.5 rounded-lg border bg-warning-soft p-2 text-[10px] font-bold leading-relaxed text-main">
                  <FileText size={10} className="mt-0.5 shrink-0 text-warning" />
                  {sub.notes}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
