import { History, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react'
import { cn } from '../../lib/utils'
import { SectionCard } from './StyledComponents'
import {
  getRateColor,
  getRateBg,
  getRateBarColor,
} from '../../features/attendance/utils/rateStyles'
import type { TeacherAttendanceRate } from '../../features/attendance/types'

interface AdminTeacherGroupListProps {
  teacherAttendanceRates: TeacherAttendanceRate[]
  filterTeacher: string
  filterSubject?: string
  onViewHistory: (studentId: string, studentName: string, grade?: string, subject?: string) => void
}

const getGradeDisplay = (studentName: string) => {
  return studentName.charAt(0)
}

export const AdminTeacherGroupList = ({
  teacherAttendanceRates,
  filterTeacher,
  filterSubject,
  onViewHistory,
}: AdminTeacherGroupListProps) => {
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
        <p className="text-xs font-bold text-muted">لا توجد بيانات حضور متاحة</p>
        <p className="mt-1 text-xs text-muted">سيظهر هذا القسم بعد تسجيل حصص للمعلمات</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visibleTeachers.map((teacher) => {
        const filteredStudents =
          filterSubject && filterSubject !== 'all'
            ? teacher.students.filter((s) => s.subject === filterSubject)
            : teacher.students

        if (filteredStudents.length === 0) return null

        return (
          <SectionCard key={teacher.teacherName} className="overflow-hidden p-0">
            {/* Teacher Header */}
            <div className="flex items-center justify-between bg-primary px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-xs font-bold text-on-primary shadow-sm">
                  {teacher.teacherName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-on-primary">{teacher.teacherName}</h3>
                  <p className="text-[10px] font-bold text-white/90">
                    {filteredStudents.length} طالب
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Teacher rate badge */}
                <div
                  className={cn(
                    'flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold',
                    getRateBg(teacher.rate),
                    getRateColor(teacher.rate),
                  )}
                >
                  {teacher.rate >= 80 ? (
                    <TrendingUp size={12} />
                  ) : teacher.rate >= 60 ? (
                    <Minus size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {teacher.rate}%
                </div>
                {/* Session counts */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/90">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {teacher.completed}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-error" />
                    {teacher.cancelled}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning dark:bg-primary" />
                    {teacher.scheduled}
                  </span>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-2.5 text-start text-[10px] font-bold text-muted">
                      الطالب
                    </th>
                    <th className="px-4 py-2.5 text-start text-[10px] font-bold text-muted">
                      المادة
                    </th>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold text-muted">
                      الحصص
                    </th>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold text-muted">
                      النسبة
                    </th>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold text-muted">
                      التغطية
                    </th>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold text-muted">
                      سجل
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr
                      key={`${student.studentId}-${student.subject}-${idx}`}
                      className={cn(
                        'border-b border-border transition-colors hover:bg-surface',
                        idx % 2 === 0 && 'bg-surface',
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-[10px] font-bold text-primary">
                            {getGradeDisplay(student.studentName)}
                          </div>
                          <span className="max-w-[120px] truncate text-[11px] font-bold text-main">
                            {student.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-2xl bg-surface px-2 py-0.5 text-[10px] font-bold text-muted">
                          {student.subject}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-[11px] font-bold tabular-nums text-main">
                          {student.completed}/{student.total}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[11px] font-bold tabular-nums',
                            getRateColor(student.rate),
                          )}
                        >
                          {student.rate >= 80 ? (
                            <TrendingUp size={10} />
                          ) : student.rate >= 60 ? (
                            <Minus size={10} />
                          ) : (
                            <TrendingDown size={10} />
                          )}
                          {student.rate}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                getRateBarColor(student.rate),
                              )}
                              style={{ width: `${student.rate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() =>
                            onViewHistory(
                              student.studentId,
                              student.studentName,
                              undefined,
                              student.subject,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-2xl bg-primary-soft px-2 py-1 text-[9px] font-bold text-primary transition-all hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                        >
                          <History size={10} /> سجل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )
      })}
    </div>
  )
}
