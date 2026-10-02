import { TrendingUp, User, Medal, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { isSameMonth } from 'date-fns'
import { DashboardSectionHead } from './DashboardSectionHead'

/**
 * Month membership by date value, not by string prefix.
 * `startsWith('2026-09')` silently dropped any timestamp that did not begin
 * with the yyyy-mm bucket (e.g. an ISO datetime with a timezone offset, or a
 * slash-separated date), which is why this card could render empty mid-month.
 */
const inCurrentMonth = (value: string | undefined, now: Date): boolean => {
  if (!value) return false
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return isSameMonth(parsed, now)
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return value.startsWith(nowKey)
}

interface TopAttendanceStudentsProps {
  sessions: {
    id?: string
    status?: string
    date?: string
    studentId?: string
    studentName?: string
  }[]
  onStudentClick?: (student: { id?: string; name?: string }) => void
}

export const TopAttendanceStudents = ({ sessions, onStudentClick }: TopAttendanceStudentsProps) => {
  const topPresentStudents = useMemo(() => {
    const studentStats: Record<string, { id: string; name: string; count: number }> = {}
    const now = new Date()

    sessions.forEach((s) => {
      const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(
        String(s.status ?? '').toLowerCase(),
      )

      if (isCompleted && inCurrentMonth(s.date, now)) {
        const id = String(s.studentId || s.studentName)
        const stat = studentStats[id]
        if (!stat) {
          studentStats[id] = { id, name: s.studentName || '', count: 1 }
        } else {
          stat.count += 1
        }
      }
    })

    return Object.values(studentStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }, [sessions])

  const totalMonthSessions = useMemo(() => {
    const now = new Date()
    return sessions.filter(
      (s) =>
        ['completed', 'مكتملة', 'تمت'].includes(String(s.status ?? '').toLowerCase()) &&
        inCurrentMonth(s.date, now),
    ).length
  }, [sessions])

  const leaderCount = topPresentStudents[0]?.count || 1

  return (
    <div>
      <DashboardSectionHead icon={Medal} tone="warning" title="الأكثر حضوراً" />

      <div className="space-y-2">
        {topPresentStudents.length > 0 ? (
          topPresentStudents.map((stu, i) => (
            <button
              key={`att-${i}`}
              type="button"
              onClick={() => onStudentClick?.({ id: stu.id, name: stu.name })}
              className="w-full cursor-pointer rounded-xl border border-border bg-surface p-3 text-start transition-colors duration-normal hover:border-warning hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      i === 0 ? 'bg-warning text-on-warning' : 'bg-hover text-muted',
                    )}
                  >
                    {i === 0 ? <Trophy size={14} /> : <Medal size={14} />}
                  </div>
                  <p className="truncate text-sm font-black text-main">{stu.name}</p>
                </div>
                <div className="flex shrink-0 items-baseline gap-1">
                  <span className="font-dash text-base font-black tabular-nums text-main">
                    {stu.count}
                  </span>
                  <span className="text-[10px] font-bold text-muted">حصة</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hover">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-warning to-warning-hover transition-all duration-700"
                  style={{ width: `${Math.max((stu.count / leaderCount) * 100, 8)}%` }}
                  aria-hidden="true"
                />
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 opacity-50">
            <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
              <User size={14} className="text-dim" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد سجلات حالياً</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-gradient-to-l from-warning to-warning-hover p-3">
        <div>
          <p className="text-[11px] font-bold text-on-warning">إجمالي حصص الشهر</p>
          <p className="font-dash text-base font-black tabular-nums text-on-warning">
            {totalMonthSessions}
          </p>
        </div>
        <TrendingUp size={18} className="text-on-warning opacity-70" />
      </div>
    </div>
  )
}
