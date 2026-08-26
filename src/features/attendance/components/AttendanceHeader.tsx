import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Calendar, Users, Clock } from 'lucide-react'

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-light dark:via-primary-deep dark:to-primary-soft"
    >
      <div className="absolute inset-0 opacity-[0.06]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="att-header-grid"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="white" />
              <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#att-header-grid)" />
        </svg>
      </div>
      <div className="relative z-10 p-4 md:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30 md:h-12 md:w-12">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-on-primary md:text-lg">
                تحضير الطلاب والمتابعة اليومية
              </h1>
              <p className="mt-0.5 text-[10px] font-bold text-white/70 md:text-micro">
                إدارة الجداول الأكاديمية والتحضير المباشر
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Status */}
            <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-[10px] font-bold text-white">Live</span>
            </div>

            {/* Last Sync */}
            <div className="hidden items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 md:flex">
              <Clock size={10} className="text-white/60" />
              <span className="text-[9px] text-white/60">آخر مزامنة: {lastSync}</span>
            </div>

            {/* Teachers count */}
            {!isTeacher && (
              <div className="hidden items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 md:flex">
                <Users size={10} className="text-white/60" />
                <span className="text-[9px] text-white/60">{teacherCount} معلمة</span>
              </div>
            )}

            {/* Sessions count */}
            <div className="hidden items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 md:flex">
              <Activity size={10} className="text-white/60" />
              <span className="text-[9px] text-white/60">{stats.todayTotal} حصة</span>
            </div>

            {/* Date */}
            {!isTeacher && (
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5">
                <Calendar size={12} className="text-white/70" />
                <input
                  type="date"
                  aria-label="التاريخ"
                  value={date}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-24 cursor-pointer border-none bg-transparent p-0 text-[10px] font-bold text-white outline-none focus-visible:ring-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
