import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, History } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { triggerHaptic } from '../../../../lib/haptics'
import { EmptyState } from '../../../../shared/components/ui'
import type { PeriodFilter } from '../AttendanceFilters'
import type { Session } from '../../types'

interface AttendanceHistoryViewProps {
  periodFilter: PeriodFilter
  setPeriodFilter: (v: PeriodFilter) => void
  filteredSessions: Session[]
  periodLabel: string
  onViewHistory: (studentId: string, studentName: string, subject?: string) => void
}

const statusMeta = {
  completed: {
    icon: CheckCircle2,
    avatar: 'bg-success-soft',
    iconClass: 'text-success',
    label: 'حضور',
  },
  cancelled: { icon: XCircle, avatar: 'bg-error-soft', iconClass: 'text-error', label: 'غياب' },
  scheduled: {
    icon: Clock,
    avatar: 'bg-warning-soft dark:bg-primary-soft',
    iconClass: 'text-warning dark:text-primary',
    label: 'مجدولة',
  },
} as const

const dayHeaderLabel = (dateStr: string) => {
  const today = new Date().toLocaleDateString('en-CA')
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')
  if (dateStr === today) return 'اليوم'
  if (dateStr === yesterday) return 'أمس'
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** سجل الجلسات للهاتف — مجمّع حسب اليوم مع رؤوس أيام واضحة */
export const AttendanceHistoryView = ({
  periodFilter,
  setPeriodFilter,
  filteredSessions,
  periodLabel,
  onViewHistory,
}: AttendanceHistoryViewProps) => (
  <motion.div
    key="history"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className="space-y-3"
  >
    {/* فلتر الفترة */}
    <div className="flex gap-1 rounded-none border border-border bg-card p-1">
      {(['today', 'week', 'month'] as PeriodFilter[]).map((p) => (
        <motion.button
          key={p}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            triggerHaptic('light')
            setPeriodFilter(p)
          }}
          className={cn(
            'relative flex-1 rounded-none py-2 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            periodFilter === p
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:text-main',
          )}
        >
          {p === 'today' ? 'اليوم' : p === 'week' ? 'الأسبوع' : 'الشهر'}
        </motion.button>
      ))}
    </div>

    {/* المجموعات اليومية */}
    {filteredSessions.length > 0 ? (
      (() => {
        const groups = new Map<string, Session[]>()
        ;[...filteredSessions]
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
          .forEach((s) => {
            const list = groups.get(s.date) || []
            list.push(s)
            groups.set(s.date, list)
          })
        return Array.from(groups.entries()).map(([dateStr, sessions]) => (
          <div key={dateStr} className="space-y-1.5">
            <div className="sticky top-[64px] z-10 flex items-center gap-2 px-1">
              <span className="rounded-none bg-surface px-2 py-1 text-micro font-bold text-main">
                {dayHeaderLabel(dateStr)}
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className="text-micro font-bold tabular-nums text-muted">
                {sessions.length} حصة
              </span>
            </div>
            {sessions.map((session) => {
              const meta = statusMeta[session.status] || statusMeta.scheduled
              return (
                <motion.button
                  key={session.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    triggerHaptic('light')
                    onViewHistory(session.studentId, session.studentName, session.subject)
                  }}
                  aria-label={`سجل ${session.studentName} — ${meta.label}`}
                  className="flex w-full items-center justify-between gap-2 rounded-none border border-border bg-card p-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-none',
                        meta.avatar,
                      )}
                    >
                      <meta.icon size={15} className={meta.iconClass} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-bold text-main">
                          {session.studentName}
                        </p>
                        <span
                          className={cn(
                            'shrink-0 rounded-none bg-surface px-1.5 py-0.5 text-micro font-bold',
                            meta.iconClass,
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="truncate text-micro font-bold text-muted">
                        {session.subject}
                        {session.teacherName ? ` · ${session.teacherName}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-micro font-bold tabular-nums text-muted">
                      {session.time}
                    </span>
                    <History size={11} className="text-muted" />
                  </div>
                </motion.button>
              )
            })}
          </div>
        ))
      })()
    ) : (
      <EmptyState
        icon={History}
        compact
        title="لا توجد جلسات مسجلة"
        subtitle={`خلال فترة: ${periodLabel}`}
        className="rounded-none border border-dashed border-border bg-card"
      />
    )}
  </motion.div>
)
