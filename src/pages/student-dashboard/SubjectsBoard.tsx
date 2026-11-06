import { Link } from 'react-router-dom'
import { Snowflake, User, ArrowLeft, BookOpen } from 'lucide-react'
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
    <section aria-label="المواد الدراسية" className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-on-primary shadow-soft">
            <BookOpen size={16} />
          </span>
          <h3 className="text-sm font-black text-main">المواد الدراسية والتقدم</h3>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold tabular-nums text-primary">
          {subjects.length} {subjects.length === 1 ? 'مادة' : 'مواد'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((sub, idx) => {
          const accent = ACCENT_TONES[idx % ACCENT_TONES.length]!
          return (
            <Link
              key={sub.id}
              to="/schedule"
              aria-label={`عرض مادة ${sub.subject} في الجدول الأسبوعي`}
              className={cn(
                'border-border/80 p-5.5 group relative flex flex-col justify-between overflow-hidden rounded-[24px] border bg-card shadow-elevation-1 outline-none transition-all duration-normal hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus',
                sub.isFrozen && 'opacity-75',
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-soft transition-transform duration-normal group-hover:scale-105',
                        accent.tile,
                        accent.text,
                      )}
                    >
                      <BookOpen size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-main">{sub.subject}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                        <User size={11} className="shrink-0 text-primary" />
                        <span>{sub.teacher}</span>
                      </p>
                    </div>
                  </div>

                  {sub.isFrozen ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-divider px-2.5 py-1 text-[11px] font-bold text-muted">
                      <Snowflake size={11} /> مجمّدة
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
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted">إنجاز الحصص</span>
                      <span className="tabular-nums text-main">
                        {sub.used} <span className="text-muted">/ {sub.total} حصة</span>
                      </span>
                    </div>
                    <ProgressBar value={sub.percent} variant={accent.bar} size="md" animate />
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-1 text-xs font-bold text-primary opacity-0 transition-opacity duration-normal group-hover:opacity-100">
                <span>عرض في الجدول</span>
                <ArrowLeft
                  size={13}
                  className="transition-transform duration-normal group-hover:-translate-x-1"
                />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
