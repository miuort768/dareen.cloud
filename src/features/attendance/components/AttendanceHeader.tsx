import { useState, useEffect } from 'react'
import { Calendar, Users, Clock, Activity } from 'lucide-react'

interface AttendanceHeaderProps {
  date: string
  onDateChange: (date: string) => void
  stats: { todayTotal: number; totalCompleted: number }
  isTeacher: boolean
  teacherCount?: number
}

export const AttendanceHeader = ({
  date,
  onDateChange,
  isTeacher,
  stats,
  teacherCount = 0,
}: AttendanceHeaderProps) => {
  const [lastSync, setLastSync] = useState(
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5"
      dir="rtl"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-2xl bg-success-soft px-2.5 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-[10px] font-black text-success">مباشر</span>
        </span>

        {!isTeacher && (
          <label className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-1.5">
            <Calendar size={12} className="text-muted" />
            <input
              type="date"
              aria-label="التاريخ"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-28 cursor-pointer border-none bg-transparent p-0 text-[11px] font-bold text-main outline-none focus-visible:ring-0"
            />
          </label>
        )}

        <span className="hidden items-center gap-1.5 rounded-2xl bg-surface px-2.5 py-1.5 md:flex">
          <Clock size={11} className="text-dim" />
          <span className="text-[10px] font-bold text-muted">آخر مزامنة {lastSync}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!isTeacher && teacherCount > 0 && (
          <span className="hidden items-center gap-1.5 rounded-2xl bg-surface px-2.5 py-1.5 md:flex">
            <Users size={11} className="text-dim" />
            <span className="text-[10px] font-bold tabular-nums text-muted">
              {teacherCount} معلمة
            </span>
          </span>
        )}
        <span className="flex items-center gap-1.5 rounded-2xl bg-primary-soft px-2.5 py-1.5">
          <Activity size={11} className="text-primary" />
          <span className="text-[10px] font-black tabular-nums text-primary">
            {stats.todayTotal} حصة اليوم
          </span>
        </span>
      </div>
    </div>
  )
}
