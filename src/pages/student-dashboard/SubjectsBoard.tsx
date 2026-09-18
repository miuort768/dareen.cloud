import { Link } from 'react-router-dom'
import { Snowflake, User, CalendarDays, FileText, ArrowLeft, BookOpen } from 'lucide-react'
import type { SubjectProgress } from './types'
import { cn } from '../../lib/utils'
import { ProgressBar } from '../../shared/components/ui'

interface SubjectsBoardProps {
  subjects: SubjectProgress[]
}

const ACCENT_TONES: {
  text: string
  tile: string
  bar: 'primary' | 'success' | 'info' | 'warning' | 'error'
}[] = [
  { text: 'text-primary', tile: 'bg-primary-soft', bar: 'primary' },
  { text: 'text-success-strong', tile: 'bg-success-soft', bar: 'success' },
  { text: 'text-info-strong', tile: 'bg-info-soft', bar: 'info' },
  { text: 'text-warning-strong', tile: 'bg-warning-soft', bar: 'warning' },
  { text: 'text-error-strong', tile: 'bg-error-soft', bar: 'error' },
]

export const SubjectsBoard = ({ subjects }: SubjectsBoardProps) => {
  if (subjects.length === 0) return null

  return (
    <section aria-label="المواد الدراسية" className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <h3 className="rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-on-primary shadow-elevation-1">
          موادي الدراسية
        </h3>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-black tabular-nums text-primary">
          {subjects.length} {subjects.length === 1 ? 'مادة' : 'مواد'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((sub, idx) => {
          const accent = ACCENT_TONES[idx % ACCENT_TONES.length]!
          return (
            <Link
              key={sub.id}
              to="/schedule"
              aria-label={`عرض مادة ${sub.subject} في الجدول الأسبوعي`}
              className={cn(
                'group relative block overflow-hidden rounded-2xl border bg-card p-4 shadow-elevation-1 outline-none transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus',
                sub.isFrozen ? 'border-border' : 'border-border',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      accent.tile,
                      accent.text,
                    )}
                  >
                    <BookOpen size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-main">{sub.subject}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-bold text-muted">
                      <User size={9} className="shrink-0" />
                      {sub.teacher}
                    </p>
                  </div>
                </div>

                {sub.isFrozen ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-divider px-2 py-1 text-[10px] font-black text-muted">
                    <Snowflake size={10} /> مجمّدة
                  </span>
                ) : (
                  <span
                    className={cn(
                      'shrink-0 font-dash text-2xl font-black tabular-nums leading-none',
                      accent.text,
                    )}
                  >
                    {sub.percent}%
                  </span>
                )}
              </div>

              {!sub.isFrozen && (
                <>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-muted">المنهج</span>
                    <span className="flex items-baseline gap-1 text-xs font-black tabular-nums text-main">
                      {sub.used}
                      <span className="text-[10px] font-bold text-muted">/ {sub.total} حصة</span>
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={sub.percent} variant={accent.bar} size="md" animate />
                  </div>
                </>
              )}

              {sub.weekDays.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {sub.weekDays.map((d, i) => (
                    <span
                      key={`${sub.id}-day-${i}`}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-black text-primary"
                    >
                      <CalendarDays size={9} />
                      {d}
                    </span>
                  ))}
                </div>
              )}

              {sub.notes && (
                <p className="mt-3 flex items-start gap-1.5 rounded-xl border border-primary/20 bg-primary-soft p-2 text-[11px] font-bold leading-relaxed text-main">
                  <FileText size={10} className="mt-0.5 shrink-0 text-primary" />
                  {sub.notes}
                </p>
              )}

              <span className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-black text-on-primary shadow-elevation-1 transition-all duration-normal group-hover:bg-primary-hover">
                عرض الجدول الدراسي
                <ArrowLeft
                  size={13}
                  className="transition-transform duration-normal group-hover:-translate-x-0.5"
                />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
