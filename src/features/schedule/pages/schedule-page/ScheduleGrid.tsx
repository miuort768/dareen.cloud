import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Plus,
  GraduationCap,
  UserRound,
  Layers,
  X,
  CalendarDays,
  BookOpen,
} from 'lucide-react'

interface ScheduleEvent {
  id: string
  studentId: string
  studentName: string
  studentGrade: string
  teacherName: string
  subject: string
  curriculum: string
  day: string
  hour: string
  period: string
  time: string
  studentPoints?: number
}

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

const TIME_SLOTS = [
  { hour: 8, period: 'am', label: '8 ص' },
  { hour: 9, period: 'am', label: '9 ص' },
  { hour: 10, period: 'am', label: '10 ص' },
  { hour: 11, period: 'am', label: '11 ص' },
  { hour: 12, period: 'pm', label: '12 م' },
  { hour: 1, period: 'pm', label: '1 م' },
  { hour: 2, period: 'pm', label: '2 م' },
  { hour: 3, period: 'pm', label: '3 م' },
  { hour: 4, period: 'pm', label: '4 م' },
  { hour: 5, period: 'pm', label: '5 م' },
  { hour: 6, period: 'pm', label: '6 م' },
  { hour: 7, period: 'pm', label: '7 م' },
  { hour: 8, period: 'pm', label: '8 م' },
  { hour: 9, period: 'pm', label: '9 م' },
  { hour: 10, period: 'pm', label: '10 م' },
]

interface SubjectColors {
  bar: string
  soft: string
  text: string
  border: string
}

const SUBJECT_COLORS: Record<string, SubjectColors> = {
  رياضيات: {
    bar: 'bg-primary',
    soft: 'bg-primary-soft',
    text: 'text-primary',
    border: 'border-primary',
  },
  علوم: {
    bar: 'bg-success',
    soft: 'bg-success-soft',
    text: 'text-success',
    border: 'border-success',
  },
  عربي: {
    bar: 'bg-warning',
    soft: 'bg-warning-soft',
    text: 'text-warning',
    border: 'border-warning',
  },
  انجليزي: { bar: 'bg-info', soft: 'bg-info-soft', text: 'text-info', border: 'border-info' },
  دين: { bar: 'bg-accent', soft: 'bg-accent-soft', text: 'text-accent', border: 'border-accent' },
  تاريخ: { bar: 'bg-error', soft: 'bg-error-soft', text: 'text-error', border: 'border-error' },
  قرآن: { bar: 'bg-accent', soft: 'bg-accent-soft', text: 'text-accent', border: 'border-accent' },
  قواعد: {
    bar: 'bg-primary',
    soft: 'bg-primary-soft',
    text: 'text-primary',
    border: 'border-primary',
  },
  بلاغة: { bar: 'bg-info', soft: 'bg-info-soft', text: 'text-info', border: 'border-info' },
  فقه: {
    bar: 'bg-success',
    soft: 'bg-success-soft',
    text: 'text-success',
    border: 'border-success',
  },
  توحيد: { bar: 'bg-accent', soft: 'bg-accent-soft', text: 'text-accent', border: 'border-accent' },
  تفسير: {
    bar: 'bg-warning',
    soft: 'bg-warning-soft',
    text: 'text-warning',
    border: 'border-warning',
  },
  نحو: { bar: 'bg-error', soft: 'bg-error-soft', text: 'text-error', border: 'border-error' },
}

const FALLBACK_COLORS: SubjectColors[] = [
  { bar: 'bg-primary', soft: 'bg-primary-soft', text: 'text-primary', border: 'border-primary' },
  { bar: 'bg-success', soft: 'bg-success-soft', text: 'text-success', border: 'border-success' },
  { bar: 'bg-warning', soft: 'bg-warning-soft', text: 'text-warning', border: 'border-warning' },
  { bar: 'bg-info', soft: 'bg-info-soft', text: 'text-info', border: 'border-info' },
  { bar: 'bg-accent', soft: 'bg-accent-soft', text: 'text-accent', border: 'border-accent' },
  { bar: 'bg-error', soft: 'bg-error-soft', text: 'text-error', border: 'border-error' },
]

const getSubjectColor = (subject: string): SubjectColors => {
  const normalized = subject?.trim() || ''
  return (
    SUBJECT_COLORS[normalized] ||
    FALLBACK_COLORS[Math.abs(normalized.length) % FALLBACK_COLORS.length] ||
    FALLBACK_COLORS[0]!
  )
}

// ─── Multi-event popup modal ─────────────────────────────────────────────────
const MultiEventModal = ({
  events,
  onClose,
  onSelect,
}: {
  events: ScheduleEvent[]
  onClose: () => void
  onSelect: (e: ScheduleEvent) => void
}) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-elevation-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft">
              <Layers size={13} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-main">مواعيد متعددة</p>
              <p className="text-[10px] text-muted">{events.length} مواعيد في نفس الوقت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-main"
            aria-label="إغلاق"
          >
            <X size={14} />
          </button>
        </div>
        {/* Time badge */}
        <div className="flex items-center gap-1.5 border-b border-border bg-surface px-4 py-2">
          <Clock size={11} className="text-muted" />
          <span className="text-[11px] font-bold text-muted">
            {events[0]?.time} — {events[0]?.day}
          </span>
        </div>
        {/* Events list */}
        <div className="max-h-72 divide-y divide-border overflow-y-auto">
          {events.map((event) => {
            const c = getSubjectColor(event.subject)
            return (
              <button
                key={event.id}
                onClick={() => {
                  onSelect(event)
                  onClose()
                }}
                className="group flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-hover"
              >
                <div className={`w-1 self-stretch rounded-full ${c.bar} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${c.soft} ${c.text}`}
                    >
                      {event.subject}
                    </span>
                    {event.studentGrade && (
                      <span className="text-[9px] text-muted">{event.studentGrade}</span>
                    )}
                  </div>
                  <p className="truncate text-xs font-bold text-main">{event.studentName}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
                    <GraduationCap size={9} />
                    {event.teacherName}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  <CalendarDays size={12} />
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)

// ─── Single event card (sharp corners per request) ───────────────────────────
const EventCard = ({ event, onSelect }: { event: ScheduleEvent; onSelect: () => void }) => {
  const c = getSubjectColor(event.subject)
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className="relative cursor-pointer overflow-hidden border border-border bg-card shadow-elevation-1 transition-all hover:z-10 hover:shadow-elevation-2"
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${c.bar}`} />
      <div className="p-1.5 pt-2">
        <div className="mb-1 flex items-center gap-1.5">
          <span className={`flex items-center gap-1 px-1.5 py-0.5 ${c.soft}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${c.bar}`} />
            <span className={`text-micro font-bold ${c.text} leading-none`}>{event.subject}</span>
          </span>
          <span className="me-auto flex items-center gap-1 text-micro font-bold tabular-nums text-muted">
            <Clock size={8} />
            {event.time}
          </span>
        </div>
        <p className="truncate text-[10px] font-bold leading-tight text-main">
          {event.studentName}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[9px] text-muted">
          <UserRound size={8} className="opacity-60" />
          {event.teacherName || event.studentGrade}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Multi card (shown when >1 events) ──────────────────────────────────────
const MultiCard = ({
  events,
  onOpenModal,
}: {
  events: ScheduleEvent[]
  onOpenModal: () => void
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onOpenModal}
    className="relative cursor-pointer overflow-hidden border border-primary/30 bg-primary-soft shadow-elevation-1 transition-all hover:z-10 hover:shadow-elevation-2"
  >
    <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
    <div className="p-1.5 pt-2">
      <div className="mb-1 flex items-center gap-1.5">
        <Layers size={9} className="shrink-0 text-primary" />
        <span className="text-[9px] font-bold text-primary">مواعيد متعددة</span>
      </div>
      <p className="text-[9px] font-bold text-main">{events.length} مواعيد</p>
      <p className="mt-0.5 flex items-center gap-1 text-[9px] text-muted">
        <BookOpen size={7} />
        {Array.from(new Set(events.map((e) => e.subject)))
          .slice(0, 2)
          .join('، ')}
        {events.length > 2 && '...'}
      </p>
    </div>
  </motion.div>
)

const CurrentTimeLine = () => {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes
  const startMinutes = 8 * 60
  const endMinutes = 22 * 60
  const pct = Math.min(Math.max((totalMinutes - startMinutes) / (endMinutes - startMinutes), 0), 1)
  if (pct <= 0 || pct >= 1) return null
  const nowLabel = now.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20"
      style={{ top: `${pct * 100}%` }}
    >
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 shrink-0 rounded-full bg-error" />
        <div className="h-px flex-1 bg-error" />
        <span className="ms-auto rounded-sm bg-card px-1 py-0.5 text-micro font-bold text-error shadow-elevation-1">
          {nowLabel}
        </span>
      </div>
    </div>
  )
}

interface ScheduleGridProps {
  filteredEvents: ScheduleEvent[]
  uniqueTeachers: string[]
  onSelectEvent: (event: ScheduleEvent) => void
}

export const ScheduleGrid = ({
  filteredEvents,
  uniqueTeachers,
  onSelectEvent,
}: ScheduleGridProps) => {
  const isToday = useCallback(
    (day: string) => new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day,
    [],
  )
  const getDayEvents = (events: ScheduleEvent[], day: string) => events.filter((e) => e.day === day)

  const [multiModal, setMultiModal] = useState<ScheduleEvent[] | null>(null)

  return (
    <>
      {/* Multi-event modal */}
      {multiModal && (
        <MultiEventModal
          events={multiModal}
          onClose={() => setMultiModal(null)}
          onSelect={(e) => {
            onSelectEvent(e)
            setMultiModal(null)
          }}
        />
      )}

      <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-surface shadow-elevation-1">
        <div className="custom-scrollbar overflow-x-auto">
          <div className="relative min-w-[1000px]">
            {/* Sticky header row */}
            <div className="shadow-xs sticky top-0 z-30 grid grid-cols-[100px_repeat(7,1fr)] border-b border-border bg-surface">
              <div className="sticky start-0 z-10 border-e border-border bg-surface p-3 text-[9px] font-bold text-muted" />
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className={`border-e border-border bg-surface p-2.5 text-center last:border-e-0 ${isToday(day) ? 'bg-primary-soft' : ''}`}
                >
                  <div className="text-xs font-bold text-main">{day}</div>
                  <div
                    className={`mt-1 flex items-center justify-center gap-1 ${isToday(day) ? 'text-primary' : ''}`}
                  >
                    {isToday(day) && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-2xl bg-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {TIME_SLOTS.map((slot, slotIdx) => {
              const currentTimeSlots = filteredEvents.filter(
                (e) => e.hour === String(slot.hour) && e.period === slot.period,
              )
              return (
                <div
                  key={`${slot.hour}-${slot.period}`}
                  className={`grid grid-cols-[100px_repeat(7,1fr)] ${slotIdx % 2 === 0 ? 'bg-surface' : 'bg-background'}`}
                >
                  {/* Time label */}
                  <div className="sticky start-0 z-10 flex flex-col items-center justify-center border-b border-e border-border bg-surface p-1.5">
                    <Clock size={10} className="text-muted" />
                    <span className="mt-0.5 text-[10px] font-bold tabular-nums text-muted">
                      {slot.label}
                    </span>
                  </div>

                  {/* Day cells */}
                  {DAYS_OF_WEEK.map((day) => {
                    const dayEvents = getDayEvents(currentTimeSlots, day)
                    const count = dayEvents.length

                    return (
                      <div
                        key={`${day}-${slot.hour}`}
                        className={`relative min-h-20 border-b border-e border-border p-1 transition-colors last:border-e-0 ${isToday(day) ? 'bg-primary-soft' : ''} group`}
                      >
                        {count === 0 ? (
                          <div className="flex h-full cursor-pointer flex-col items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary-soft">
                              <Plus size={11} className="text-primary" />
                            </div>
                            <span className="mt-1 text-[9px] text-muted">إضافة حصة</span>
                          </div>
                        ) : count === 1 ? (
                          <div className="h-full p-0.5">
                            <EventCard
                              event={dayEvents[0]!}
                              onSelect={() => onSelectEvent(dayEvents[0]!)}
                            />
                          </div>
                        ) : /* Multiple events: show compact list if ≤2, otherwise multi-card */
                        count <= 2 ? (
                          <div className="h-full space-y-1 p-0.5">
                            {dayEvents.map((event) => (
                              <EventCard
                                key={event.id}
                                event={event}
                                onSelect={() => onSelectEvent(event)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="h-full p-0.5">
                            <MultiCard
                              events={dayEvents}
                              onOpenModal={() => setMultiModal(dayEvents)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Current time line */}
            <CurrentTimeLine />
          </div>
        </div>

        {/* Legend */}
        <div className="no-print flex flex-wrap items-center gap-2 border-t border-border bg-surface p-3">
          <span className="ms-1 text-[9px] font-bold text-muted">دليل المواد:</span>
          {Object.entries(SUBJECT_COLORS)
            .slice(0, 8)
            .map(([subject, colors]) => (
              <div
                key={subject}
                className="flex items-center gap-1 rounded-2xl border border-border bg-card px-1.5 py-0.5"
              >
                <div className={`h-1.5 w-1.5 rounded-full ${colors.bar}`} />
                <span className="text-micro font-bold text-muted">{subject}</span>
              </div>
            ))}
          {uniqueTeachers.length > 0 && (
            <>
              <span className="me-1 ms-2 text-[9px] font-bold text-muted">|</span>
              <span className="flex items-center gap-1 text-micro text-muted">
                <GraduationCap size={8} />
                {uniqueTeachers.length} معلمة
              </span>
            </>
          )}
          <span className="me-auto text-micro text-muted">{filteredEvents.length} حصة</span>
        </div>
      </div>
    </>
  )
}
