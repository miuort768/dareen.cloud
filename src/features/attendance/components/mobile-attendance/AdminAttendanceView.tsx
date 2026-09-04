import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  History,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
} from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { triggerHaptic } from '../../../../lib/haptics'
import { EmptyState } from '../../../../shared/components/ui'
import { getRateColor, getRateBg, getRateBarColor } from '../../utils/rateStyles'
import type { TeacherAttendanceRate } from '../../types'

interface AdminAttendanceViewProps {
  teacherAttendanceRates: TeacherAttendanceRate[]
  filterTeacher: string
  filterSubject?: string
  onViewHistory: (studentId: string, studentName: string, grade?: string, subject?: string) => void
}

const RateTrendIcon = ({ rate }: { rate: number }) => {
  if (rate >= 80) return <TrendingUp size={10} />
  if (rate >= 60) return <Minus size={10} />
  return <TrendingDown size={10} />
}

/** عرض الأدمن — مجموعات المعلمات القابلة للطي مع نسب كل طالبة */
export const AdminAttendanceView = ({
  teacherAttendanceRates,
  filterTeacher,
  filterSubject,
  onViewHistory,
}: AdminAttendanceViewProps) => {
  const visibleTeachers = teacherAttendanceRates.filter(
    (t) =>
      (filterTeacher === 'all' || t.teacherName === filterTeacher) &&
      (filterSubject === 'all' ||
        !filterSubject ||
        t.students.some((s) => s.subject === filterSubject)),
  )
  const [expanded, setExpanded] = useState<string | null>(visibleTeachers[0]?.teacherName ?? null)

  if (visibleTeachers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        compact
        title="لا توجد بيانات متاحة"
        subtitle="ستظهر إحصائيات المعلمات بعد تسجيل الحصص"
        className="rounded-2xl border border-dashed border-border bg-card"
      />
    )
  }

  return (
    <div className="space-y-2.5">
      {visibleTeachers.map((teacher) => {
        const filteredStudents =
          filterSubject && filterSubject !== 'all'
            ? teacher.students.filter((s) => s.subject === filterSubject)
            : teacher.students

        if (filteredStudents.length === 0) return null

        const isOpen = expanded === teacher.teacherName

        return (
          <div
            key={teacher.teacherName}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {/* رأس المجموعة */}
            <button
              onClick={() => {
                triggerHaptic('light')
                setExpanded(isOpen ? null : teacher.teacherName)
              }}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-start transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-xs font-bold text-primary">
                  {teacher.teacherName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-main">{teacher.teacherName}</p>
                  <p className="text-micro font-bold text-muted">
                    {filteredStudents.length} طالب · {teacher.completed}/{teacher.totalSessions} حصة
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-2xl px-2 py-1 text-micro font-bold tabular-nums',
                    getRateBg(teacher.rate),
                    getRateColor(teacher.rate),
                  )}
                >
                  <RateTrendIcon rate={teacher.rate} />
                  {teacher.rate}%
                </span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={15} className="text-muted" />
                </motion.span>
              </div>
            </button>

            {/* قائمة الطلاب */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="space-y-1.5 border-t border-border p-2">
                    {filteredStudents.map((student, idx) => (
                      <motion.div
                        key={`${student.studentId}-${student.subject}-${idx}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-surface/50 rounded-2xl border border-border p-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-micro font-bold text-primary">
                              {student.studentName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-micro font-bold text-main">
                                {student.studentName}
                              </p>
                              <span className="flex items-center gap-0.5 text-micro font-bold text-muted">
                                <BookOpen size={8} /> {student.subject}
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <span className="text-micro font-bold tabular-nums text-muted">
                              {student.completed}/{student.total}
                            </span>
                            <span
                              className={cn(
                                'text-micro font-bold tabular-nums',
                                getRateColor(student.rate),
                              )}
                            >
                              {student.rate}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-hover">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${student.rate}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.04 }}
                              className={cn('h-full rounded-full', getRateBarColor(student.rate))}
                            />
                          </div>
                          <button
                            onClick={() => {
                              triggerHaptic('light')
                              onViewHistory(
                                student.studentId,
                                student.studentName,
                                undefined,
                                student.subject,
                              )
                            }}
                            aria-label={`سجل ${student.studentName} في ${student.subject}`}
                            className="flex items-center gap-1 rounded-2xl bg-primary-soft px-2 py-1 text-micro font-bold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                          >
                            <History size={10} /> السجل
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
