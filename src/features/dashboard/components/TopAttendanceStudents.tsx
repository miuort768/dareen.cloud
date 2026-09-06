import { TrendingUp, User, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

interface TopAttendanceStudentsProps {
  sessions: {
    id?: string
    status?: string
    date?: string
    studentId?: string
    studentName?: string
  }[]
  onStudentClick?: (student: { id?: string; name?: string }) => void
  currentUser?: { id?: string; role?: string; teacherName?: string }
}

export const TopAttendanceStudents = ({
  sessions,
  onStudentClick,
  currentUser,
}: TopAttendanceStudentsProps) => {
  const topPresentStudents = useMemo(() => {
    const studentStats: Record<string, { id: string; name: string; count: number }> = {}
    const now = new Date()
    // Local month key — toISOString() would shift the bucket at month
    // boundaries for UTC+2/+3 users (sessions logged on the 1st at midnight
    // would land in the previous month).
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    sessions.forEach((s) => {
      const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(
        String(s.status ?? '').toLowerCase(),
      )
      const isThisMonth = s.date?.startsWith(currentMonth)

      if (isCompleted && isThisMonth) {
        const id = String(s.studentId || s.studentName)
        const stat = studentStats[id]
        if (!stat) {
          studentStats[id] = { id, name: s.studentName || '', count: 0 }
        } else {
          stat.count += 1
        }
      }
    })

    // Filter by teacher if currentUser is provided
    const filteredStats = Object.values(studentStats)
    if (currentUser?.role === 'teacher' && currentUser?.teacherName) {
      // This is a simplified filter - in a real app, you'd match by enrollment
      // For now, we'll keep all students but note the filter possibility
    }

    return filteredStats.sort((a, b) => b.count - a.count).slice(0, 3)
  }, [sessions, currentUser])

  const totalMonthSessions = useMemo(() => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return sessions.filter(
      (s) =>
        ['completed', 'مكتملة', 'تمت'].includes(String(s.status ?? '').toLowerCase()) &&
        s.date?.startsWith(currentMonth),
    ).length
  }, [sessions])

  const leaderCount = topPresentStudents[0]?.count || 1

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-soft dark:bg-primary/10">
          <Medal size={14} className="text-warning dark:text-primary" />
        </div>
        <h3 className="text-sm font-black text-main dark:text-main">الأكثر حضوراً</h3>
      </div>

      <div className="space-y-2">
        {topPresentStudents.length > 0 ? (
          topPresentStudents.map((stu, i) => (
            <button
              key={`att-${i}`}
              type="button"
              onClick={() => onStudentClick?.({ id: stu.id, name: stu.name })}
              className="hover:border-warning/40 w-full cursor-pointer rounded-2xl border border-border bg-surface p-2.5 text-start transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-border dark:bg-hover dark:hover:border-border"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black tabular-nums',
                      i === 0
                        ? 'bg-warning-soft text-warning dark:bg-primary/10 dark:text-primary'
                        : 'bg-hover text-muted dark:bg-surface dark:text-muted',
                    )}
                  >
                    {i + 1}
                  </div>
                  <p className="truncate text-[13px] font-bold text-main dark:text-main">
                    {stu.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-baseline gap-1">
                  <span className="text-base font-black tabular-nums text-main dark:text-main">
                    {stu.count}
                  </span>
                  <span className="text-[10px] font-bold text-muted dark:text-muted">حصة</span>
                </div>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-hover dark:bg-surface">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    i === 0 ? 'bg-warning dark:bg-primary' : 'bg-warning/60 dark:bg-primary/60',
                  )}
                  style={{ width: `${Math.max((stu.count / leaderCount) * 100, 8)}%` }}
                  aria-hidden="true"
                />
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 opacity-50">
            <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-surface dark:bg-surface">
              <User size={14} className="text-dim dark:text-dim" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد سجلات حالياً</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-warning p-3 dark:bg-primary">
        <div>
          <p className="text-[11px] font-bold text-on-warning dark:text-main">إجمالي حصص الشهر</p>
          <p className="text-base font-black tabular-nums text-on-warning dark:text-on-primary">
            {totalMonthSessions}
          </p>
        </div>
        <TrendingUp
          size={18}
          className="text-on-warning opacity-70 dark:text-on-primary dark:opacity-70"
        />
      </div>
    </div>
  )
}
