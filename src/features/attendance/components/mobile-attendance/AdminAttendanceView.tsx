import { motion } from 'framer-motion'
import { BookOpen, History, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { triggerHaptic } from '../../../../lib/haptics'
import type { TeacherAttendanceRate } from '../../types'

interface AdminAttendanceViewProps {
  teacherAttendanceRates: TeacherAttendanceRate[]
  filterTeacher: string
  filterSubject?: string
  onViewHistory: (studentId: string, studentName: string, grade?: string, subject?: string) => void
}

const getRateColor = (rate: number) => {
  if (rate >= 80) return 'text-success'
  if (rate >= 60) return 'text-warning'
  return 'text-error'
}

const getRateBg = (rate: number) => {
  if (rate >= 80) return 'bg-success-soft'
  if (rate >= 60) return 'bg-warning-soft'
  return 'bg-error-soft'
}

const getRateBarColor = (rate: number) => {
  if (rate >= 80) return 'bg-success'
  if (rate >= 60) return 'bg-warning'
  return 'bg-error'
}

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

  if (visibleTeachers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center">
        <Users className="mx-auto mb-2 text-muted" size={28} strokeWidth={1.5} />
        <p className="text-xs font-bold text-muted">لا توجد بيانات متاحة</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {visibleTeachers.map((teacher) => {
        const filteredStudents =
          filterSubject && filterSubject !== 'all'
            ? teacher.students.filter((s) => s.subject === filterSubject)
            : teacher.students

        if (filteredStudents.length === 0) return null

        return (
          <div
            key={teacher.teacherName}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {/* Teacher Header */}
            <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-soft text-micro font-bold text-primary">
                  {teacher.teacherName.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-main">{teacher.teacherName}</span>
                  <p className="text-[10px] font-bold text-muted">{filteredStudents.length} طالب</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold',
                    getRateBg(teacher.rate),
                    getRateColor(teacher.rate),
                  )}
                >
                  {teacher.rate >= 80 ? (
                    <TrendingUp size={10} />
                  ) : teacher.rate >= 60 ? (
                    <Minus size={10} />
                  ) : (
                    <TrendingDown size={10} />
                  )}
                  {teacher.rate}%
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
                  <span className="flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {teacher.completed}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-error" />
                    {teacher.cancelled}
                  </span>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-1 p-2">
              {filteredStudents.map((student, idx) => (
                <motion.div
                  key={`${student.studentId}-${student.subject}-${idx}`}
                  whileTap={{ scale: 0.98 }}
                  className="border-border/50 rounded-xl border p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[10px] font-bold text-primary">
                        {student.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="max-w-[140px] truncate text-[11px] font-bold text-main">
                          {student.studentName}
                        </p>
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-muted">
                          <BookOpen size={8} /> {student.subject}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tabular-nums text-muted">
                        {student.completed}/{student.total}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold tabular-nums',
                          getRateColor(student.rate),
                        )}
                      >
                        {student.rate}%
                      </span>
                    </div>
                  </div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface">
                      <div
                        className={cn('h-full rounded-full', getRateBarColor(student.rate))}
                        style={{ width: `${student.rate}%` }}
                      />
                    </div>
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
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary-soft py-1.5 text-[10px] font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <History size={10} /> عرض السجل
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
