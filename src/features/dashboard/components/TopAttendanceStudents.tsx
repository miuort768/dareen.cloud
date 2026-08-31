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

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-muted dark:text-muted">
          <Medal size={11} className="text-warning dark:text-primary" />
          الأكثر حضوراً
        </h3>
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-warning-soft dark:bg-primary/10">
          <TrendingUp size={11} className="text-warning dark:text-primary" />
        </div>
      </div>

      <div className="space-y-1.5">
        {topPresentStudents.length > 0 ? (
          topPresentStudents.map((stu, i) => (
            <div
              key={`att-${i}`}
              role="button"
              tabIndex={0}
              onClick={() => onStudentClick?.({ id: stu.id, name: stu.name })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onStudentClick?.({ id: stu.id, name: stu.name })
                }
              }}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background p-2 transition-all hover:border-warning focus-visible:ring-2 focus-visible:ring-focus dark:border-border dark:bg-card dark:hover:border-border"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg text-micro font-semibold',
                    i === 0
                      ? 'bg-warning-soft text-warning dark:bg-primary/10 dark:text-primary'
                      : i === 1
                        ? 'bg-surface text-main dark:bg-surface dark:text-main'
                        : i === 2
                          ? 'bg-warning-soft text-warning dark:bg-primary/10 dark:text-primary'
                          : 'bg-surface text-muted dark:bg-surface dark:text-muted',
                  )}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-micro font-bold text-main dark:text-main">
                    {stu.name}
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold tabular-nums text-main dark:text-main">
                  {stu.count}
                </span>
                <span className="text-micro font-bold text-warning dark:text-primary">حصة</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 opacity-50">
            <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-surface dark:bg-surface">
              <User size={14} className="text-dim dark:text-dim" />
            </div>
            <p className="text-micro font-bold text-muted dark:text-muted">لا توجد سجلات حالياً</p>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between rounded-xl bg-warning p-2.5 text-on-warning dark:bg-primary">
        <div>
          <p className="text-micro font-bold text-on-warning">إجمالي حصص الشهر</p>
          <p className="text-base font-bold tabular-nums">{totalMonthSessions}</p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm dark:bg-black/20">
          <TrendingUp size={12} className="text-on-warning dark:text-on-primary" />
        </div>
      </div>
    </div>
  )
}
