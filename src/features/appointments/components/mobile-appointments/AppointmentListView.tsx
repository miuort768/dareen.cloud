import { motion, AnimatePresence } from 'framer-motion'
import { CalendarX2, CheckCircle2, BookOpen } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { EmptyState } from '../../../../shared/components/ui'
import type { AppointmentEvent } from '../../types'

interface DayGroup {
  day: string
  appointments: AppointmentEvent[]
}

interface AppointmentListViewProps {
  activeTab: 'upcoming' | 'completed'
  appointmentsByDay: DayGroup[]
  todayName: string
  onComplete: (id: string, e: React.MouseEvent) => void
  onSelect: (app: AppointmentEvent) => void
  canComplete?: boolean
  isPending?: boolean
}

/** قائمة المواعيد مجمّعة بالأيام — بطاقات فاخرة بخانة وقت جانبية */
export const AppointmentListView = ({
  activeTab,
  appointmentsByDay,
  todayName,
  onComplete,
  onSelect,
  canComplete = true,
  isPending = false,
}: AppointmentListViewProps) => {
  const total = appointmentsByDay.reduce((s, d) => s + d.appointments.length, 0)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="space-y-3"
      >
        {total === 0 ? (
          <EmptyState
            icon={CalendarX2}
            compact
            title={activeTab === 'upcoming' ? 'لا توجد مواعيد متبقية' : 'لا توجد مواعيد مكتملة'}
            subtitle="جرّب تغيير اليوم أو كلمة البحث"
            className="rounded-2xl border border-dashed border-border bg-card"
          />
        ) : (
          appointmentsByDay.map(({ day, appointments }) => {
            const isToday = day === todayName
            return (
              <div key={day} className="space-y-1.5">
                {/* رأس اليوم */}
                <div className="sticky top-16 z-10 flex items-center gap-2 px-1">
                  <span
                    className={cn(
                      'rounded-2xl px-2 py-1 text-micro font-bold',
                      isToday
                        ? 'bg-primary text-on-primary shadow-elevation-1'
                        : 'bg-surface text-main',
                    )}
                  >
                    {day}
                    {isToday && ' · اليوم'}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-micro font-bold tabular-nums text-muted">
                    {appointments.length} حصة
                  </span>
                </div>

                {appointments.length === 0 ? (
                  <div className="bg-card/60 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-micro font-bold text-muted">
                    لا توجد مواعيد في هذا اليوم
                  </div>
                ) : (
                  appointments.map((app, i) => {
                    const done = activeTab === 'completed'
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.18), duration: 0.25 }}
                        whileTap={{ scale: 0.98 }}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect(app)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onSelect(app)
                          }
                        }}
                        aria-label={`تفاصيل موعد ${app.studentName} — ${app.subject} ${app.time}`}
                        className={cn(
                          'flex w-full cursor-pointer items-stretch gap-3 rounded-2xl border p-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                          done
                            ? 'border-border bg-card opacity-75'
                            : 'border-border bg-card hover:bg-surface',
                        )}
                      >
                        {/* خانة الوقت */}
                        <div
                          className={cn(
                            'flex w-14 shrink-0 flex-col items-center justify-center rounded-2xl py-2',
                            done ? 'bg-surface' : 'bg-primary-soft',
                          )}
                        >
                          <span
                            className={cn(
                              'text-lg font-black tabular-nums leading-none',
                              done ? 'text-muted' : 'text-primary',
                            )}
                          >
                            {app.hour || '--'}
                          </span>
                          <span
                            className={cn(
                              'mt-1 text-micro font-bold leading-none',
                              done ? 'text-muted/70' : 'text-primary/70',
                            )}
                          >
                            {app.isPM ? 'م' : 'ص'}
                          </span>
                        </div>

                        {/* المحتوى */}
                        <div className="min-w-0 flex-1 py-0.5">
                          <div className="flex items-center gap-1.5">
                            <p
                              className={cn(
                                'truncate text-xs font-bold text-main',
                                done && 'line-through decoration-2 opacity-60',
                              )}
                            >
                              {app.studentName}
                            </p>
                            {app.studentGrade && (
                              <span className="shrink-0 rounded-2xl bg-surface px-1.5 py-0.5 text-micro font-bold text-muted">
                                {app.studentGrade}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 flex min-w-0 items-center gap-1 text-micro font-bold text-muted">
                            <BookOpen size={9} className="shrink-0" />
                            <span className="truncate">
                              {app.subject}
                              {app.curriculum ? ` · ${app.curriculum}` : ''}
                            </span>
                          </p>
                          {app.teacherName && (
                            <p className="mt-0.5 truncate text-micro font-bold text-info">
                              {app.teacherName}
                            </p>
                          )}
                        </div>

                        {/* الإجراء */}
                        <div className="flex shrink-0 flex-col justify-center">
                          {done ? (
                            <span className="flex items-center gap-1 rounded-2xl bg-success-soft px-2 py-1.5 text-micro font-bold text-success">
                              <CheckCircle2 size={11} strokeWidth={1.7} /> تم
                            </span>
                          ) : canComplete ? (
                            <motion.span whileTap={{ scale: 0.92 }} className="inline-flex">
                              <button
                                onClick={(e) => onComplete(app.id, e)}
                                disabled={isPending}
                                aria-label={`إتمام حصة ${app.studentName}`}
                                className="flex items-center gap-1 rounded-2xl bg-success px-2.5 py-2 text-micro font-bold text-on-success transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                              >
                                <CheckCircle2 size={11} strokeWidth={1.7} /> إتمام
                              </button>
                            </motion.span>
                          ) : null}
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            )
          })
        )}
      </motion.div>
    </AnimatePresence>
  )
}
