import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CheckCircle2, History, CalendarClock, Trash2, MoreVertical } from 'lucide-react'
import { ProgressBar } from '../../../../shared/components/ui'
import { triggerHaptic } from '../../../../lib/haptics'
import type { Student, Enrollment } from '../../types'
import { periodLabel, normalizeDayName } from '../../utils/slotUtils'

interface StudentAttendanceCardProps {
  student: Student
  enrollment: Enrollment
  onAttend: () => void
  onHistory: () => void
  onDeleteSlot: (slotIndex: number) => void
  onReschedule: () => void
}

/** بطاقة طالب لواجهة الهاتف (فرع المعلم) — موعد اليوم + التقدم + إجراءات سريعة */
export const StudentAttendanceCard = ({
  student,
  enrollment,
  onAttend,
  onHistory,
  onDeleteSlot,
  onReschedule,
}: StudentAttendanceCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
  const todaySlotIndex = enrollment.schedule?.findIndex(
    (s) => normalizeDayName(s.day) === todayName,
  )
  const todaySlot = todaySlotIndex >= 0 ? enrollment.schedule?.[todaySlotIndex] : undefined
  const used = enrollment.sessionsUsed || 0
  const total = enrollment.sessionsTotal || 1
  const progressPct = Math.min(100, Math.round((used / total) * 100))

  return (
    <motion.div layout className="relative rounded-none border border-border bg-card p-3.5">
      {/* الرأس */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-primary-soft text-sm font-bold text-primary">
            {student.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold leading-tight text-main">{student.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {student.grade && (
                <span className="rounded-none bg-surface px-1.5 py-0.5 text-micro font-bold text-muted">
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
          <span className="shrink-0 rounded-none bg-success-soft px-2 py-1 text-micro font-bold tabular-nums text-success">
            {todaySlot.hour}:00 {periodLabel(todaySlot.period)}
          </span>
        ) : (
          <span className="shrink-0 rounded-none bg-surface px-2 py-1 text-micro font-bold text-muted">
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
          className="flex flex-1 items-center justify-center gap-1 rounded-none bg-success py-2.5 text-micro font-bold text-on-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <CheckCircle2 size={12} strokeWidth={1.5} /> تسجيل حضور
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onHistory}
          aria-label={`سجل حضور ${student.name}`}
          className="flex items-center justify-center gap-1 rounded-none bg-primary-soft px-3 py-2.5 text-micro font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
          className="flex w-9 items-center justify-center rounded-none border border-border text-muted transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* القائمة الإضافية */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute end-3 top-12 z-20 w-40 overflow-hidden rounded-none border border-border bg-card shadow-elevation-3"
            role="menu"
          >
            <button
              onClick={() => {
                setMenuOpen(false)
                onReschedule()
              }}
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-start text-micro font-bold text-main transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
            >
              <CalendarClock size={13} className="text-primary" /> طلب تأجيل الحصة
            </button>
            {todaySlot && todaySlotIndex >= 0 && (
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onDeleteSlot(todaySlotIndex)
                }}
                role="menuitem"
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-start text-micro font-bold text-error transition-colors hover:bg-error-soft focus-visible:bg-error-soft focus-visible:outline-none"
              >
                <Trash2 size={13} /> حذف موعد اليوم
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
