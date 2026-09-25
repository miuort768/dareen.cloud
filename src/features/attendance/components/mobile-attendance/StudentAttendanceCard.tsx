import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CheckCircle2, History, CalendarClock, Trash2, MoreVertical } from 'lucide-react'
import { ProgressBar } from '../../../../shared/components/ui'
import { triggerHaptic } from '../../../../lib/haptics'
import { AttendanceHistoryList } from '../AttendanceHistoryList'
import type { Student, Enrollment } from '../../types'
import { periodLabel, normalizeDayName } from '../../utils/slotUtils'

interface StudentAttendanceCardProps {
  student: Student
  enrollment: Enrollment
  onAttend: () => void
  onDeleteSlot: (slotIndex: number) => void
  onReschedule: () => void
  onSessionChange?: () => void
}

/** بطاقة طالب لواجهة الهاتف (فرع المعلم) — موعد اليوم + التقدم + إجراءات سريعة */
export const StudentAttendanceCard = ({
  student,
  enrollment,
  onAttend,
  onDeleteSlot,
  onReschedule,
  onSessionChange,
}: StudentAttendanceCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
  const todaySlotIndex = enrollment.schedule?.findIndex(
    (s) => normalizeDayName(s.day) === todayName,
  )
  const todaySlot = todaySlotIndex >= 0 ? enrollment.schedule?.[todaySlotIndex] : undefined
  const used = enrollment.sessionsUsed || 0
  const total = enrollment.sessionsTotal || 1
  const progressPct = Math.min(100, Math.round((used / total) * 100))

  return (
    <motion.div layout className="relative rounded-2xl border border-border bg-card p-3.5">
      {/* الرأس */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-sm font-bold text-primary">
            {student.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold leading-tight text-main">{student.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {student.grade && (
                <span className="rounded-2xl bg-surface px-1.5 py-0.5 text-micro font-bold text-muted">
                  {student.grade}
                </span>
              )}
              <span className="flex items-center gap-1 text-micro font-bold text-primary">
                <BookOpen size={9} strokeWidth={1.5} />
                {enrollment.subject}
              </span>
            </div>
          </div>
        </div>
        {todaySlot ? (
          <span className="shrink-0 rounded-2xl bg-success-soft px-2 py-1 text-micro font-bold tabular-nums text-success">
            {todaySlot.hour}:00 {periodLabel(todaySlot.period)}
          </span>
        ) : (
          <span className="shrink-0 rounded-2xl bg-surface px-2 py-1 text-micro font-bold text-muted">
            بدون موعد اليوم
          </span>
        )}
      </div>

      {/* التقدم */}
      <div className="mt-3 flex items-center gap-2">
        <ProgressBar value={progressPct} variant="attendance" />
        <span className="shrink-0 text-micro font-bold tabular-nums text-muted">
          {used}/{total}
        </span>
      </div>

      {/* الإجراءات */}
      <div className="mt-3 flex gap-1.5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            triggerHaptic('light')
            onAttend()
          }}
          className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-success py-2.5 text-micro font-bold text-on-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <CheckCircle2 size={12} strokeWidth={1.5} /> تسجيل حضور
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            triggerHaptic('light')
            setHistoryOpen((v) => !v)
          }}
          aria-label={`سجل حضور ${student.name}`}
          aria-expanded={historyOpen}
          className="flex items-center justify-center gap-1 rounded-2xl bg-primary-soft px-3 py-2.5 text-micro font-bold text-primary shadow-button transition-all duration-normal ease-out hover:bg-primary hover:text-on-primary hover:shadow-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] active:shadow-button-pressed"
        >
          <History size={12} strokeWidth={1.5} /> السجل
        </motion.button>
        <button
          onClick={() => {
            triggerHaptic('light')
            setMenuOpen((v) => !v)
          }}
          aria-label={`إجراءات إضافية لـ ${student.name}`}
          aria-expanded={menuOpen}
          className="flex w-9 items-center justify-center rounded-2xl border border-border text-muted transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* الإجراءات الإضافية المضمّنة */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid gap-1.5 border-t border-border pt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  triggerHaptic('light')
                  setMenuOpen(false)
                  onReschedule()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-soft py-2.5 text-micro font-bold text-primary shadow-button transition-all duration-normal ease-out hover:bg-primary hover:text-on-primary hover:shadow-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] active:shadow-button-pressed"
              >
                <CalendarClock size={13} /> طلب تأجيل الحصة
              </motion.button>
              {todaySlot && todaySlotIndex >= 0 && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    triggerHaptic('light')
                    setMenuOpen(false)
                    onDeleteSlot(todaySlotIndex)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-error-soft py-2.5 text-micro font-bold text-error shadow-button transition-all duration-normal ease-out hover:bg-error hover:text-on-error hover:shadow-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] active:shadow-button-pressed"
                >
                  <Trash2 size={13} /> حذف موعد اليوم
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* سجل الحضور المضمّن */}
      <AnimatePresence initial={false}>
        {historyOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 border-t border-border pt-2">
              <AttendanceHistoryList
                studentId={student.id}
                studentGrade={student.grade}
                studentSubject={enrollment.subject}
                studentCurriculum={(enrollment as { curriculum?: string }).curriculum}
                canDelete={false}
                onSessionChange={onSessionChange}
                className="max-h-[55vh]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
