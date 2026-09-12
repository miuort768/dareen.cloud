import {
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  CalendarX,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import type { AppointmentEvent } from '../../features/appointments/types'

interface AppointmentScheduleGridProps {
  appointmentsByDay: { day: string; appointments: AppointmentEvent[] }[]
  todayName: string
  onSelectAppointment: (appointment: AppointmentEvent) => void
  onCompleteSession: (id: string, e?: React.MouseEvent) => void
  isPending?: boolean
  canComplete?: boolean
  hasActiveFilters?: boolean
  onShowWeek?: () => void
}

export const AppointmentScheduleGrid = ({
  appointmentsByDay,
  todayName,
  onSelectAppointment,
  onCompleteSession,
  isPending = false,
  canComplete = true,
  hasActiveFilters = false,
  onShowWeek,
}: AppointmentScheduleGridProps) => {
  const [hideEmptyDays, setHideEmptyDays] = useState(false)
  const total = appointmentsByDay.reduce((s, d) => s + d.appointments.length, 0)

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft"
        >
          <CalendarX size={40} className="text-primary" strokeWidth={1.5} />
        </motion.div>
        <h3 className="mb-2 text-xl font-bold text-main">
          {hasActiveFilters ? 'لا نتائج مطابقة' : 'لا توجد مواعيد'}
        </h3>
        <p className="max-w-xs text-sm font-bold text-muted">
          {hasActiveFilters
            ? 'جرّب تغيير الفلاتر أو البحث بكلمة أخرى'
            : 'لا توجد مواعيد مسجلة في الجدول الأسبوعي بعد'}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary bar → زر واضح يعرض الأسبوع الكامل بعداد الحصص + زر إخفاء الأيام الفارغة */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onShowWeek}
          className="flex flex-1 items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-start outline-none transition-all hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Calendar size={15} />
            </span>
            <span className="text-sm font-black text-main">جدول الأسبوع الكامل</span>
          </span>
          <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-micro font-black tabular-nums text-on-primary">
            {total} حصة
          </span>
        </button>
        <button
          type="button"
          onClick={() => setHideEmptyDays((v) => !v)}
          aria-pressed={hideEmptyDays}
          className={cn(
            'flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus',
            hideEmptyDays
              ? 'border-primary bg-primary text-on-primary shadow-elevation-1'
              : 'border-border bg-card text-main hover:bg-surface',
          )}
        >
          {hideEmptyDays ? (
            <Eye size={14} strokeWidth={1.7} />
          ) : (
            <EyeOff size={14} strokeWidth={1.7} />
          )}
          {hideEmptyDays ? 'إظهار كل الأيام' : 'إخفاء الأيام الفارغة'}
        </button>
      </div>

      {appointmentsByDay
        .filter((d) => !hideEmptyDays || d.appointments.length > 0)
        .map(({ day, appointments }) => {
          const isToday = day === todayName
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                'overflow-hidden rounded-2xl border bg-card',
                isToday ? 'border-primary shadow-elevation-2 shadow-primary/10' : 'border-border',
              )}
            >
              {/* Day header */}
              <div
                className={cn(
                  'flex items-center justify-between border-b px-4 py-2.5',
                  isToday
                    ? 'border-primary bg-gradient-to-l from-primary to-primary-deep'
                    : 'border-info bg-info',
                )}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={13} className={isToday ? 'text-on-primary' : 'text-on-info'} />
                  <h3
                    className={cn(
                      'text-xs font-bold',
                      isToday ? 'text-on-primary' : 'text-on-info',
                    )}
                  >
                    {day}
                  </h3>
                  {isToday && (
                    <span className="rounded-2xl bg-white/20 px-1.5 py-0.5 text-micro font-bold text-on-primary">
                      اليوم
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'rounded-2xl px-2 py-0.5 text-micro font-bold tabular-nums',
                    isToday
                      ? 'bg-white/15 text-on-primary'
                      : appointments.length > 0
                        ? 'bg-white/25 text-on-info'
                        : 'bg-border text-muted',
                  )}
                >
                  {appointments.length} موعد
                </span>
              </div>

              {/* Day appointments */}
              {appointments.length > 0 ? (
                <div className="divide-y divide-border">
                  {appointments.map((app) => (
                    <div
                      key={app.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`تفاصيل موعد ${app.studentName} في ${app.subject}`}
                      onClick={() => onSelectAppointment(app)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelectAppointment(app)
                        }
                      }}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-none"
                    >
                      {/* Time chip */}
                      <div className="flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary-soft">
                        <Clock size={10} className="mb-0.5 text-primary" />
                        <span className="text-micro font-black tabular-nums text-primary">
                          {app.time}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-main">{app.studentName}</p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-medium text-muted">
                          <BookOpen size={9} className="shrink-0" />
                          {app.subject}
                          {app.curriculum ? ` · ${app.curriculum}` : ''}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-micro font-bold text-info">
                          <ShieldCheck size={9} className="shrink-0" />
                          {app.teacherName || 'غير محددة'}
                        </p>
                      </div>

                      {/* Grade + complete */}
                      <div className="flex shrink-0 items-center gap-2">
                        {app.studentGrade && (
                          <span className="hidden rounded-2xl bg-surface px-2 py-0.5 text-micro font-bold text-muted md:inline-block">
                            {app.studentGrade}
                          </span>
                        )}
                        {canComplete && (
                          <button
                            onClick={(e) => onCompleteSession(app.id, e)}
                            disabled={isPending}
                            aria-label={`إتمام موعد ${app.studentName}`}
                            className="flex items-center gap-1 rounded-2xl bg-success px-2.5 py-1.5 text-micro font-bold text-on-success transition-all hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} />
                            إتمام
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-5 text-micro font-bold text-error">
                  <User size={12} className="opacity-50" />
                  لا توجد مواعيد في هذا اليوم
                </div>
              )}
            </motion.div>
          )
        })}
    </div>
  )
}
