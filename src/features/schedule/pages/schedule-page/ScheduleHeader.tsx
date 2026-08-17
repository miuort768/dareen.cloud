import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Printer,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  BookOpen,
} from 'lucide-react'

interface ScheduleHeaderProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  filterDay: string
  onDayChange: (v: string) => void
  filterTeacher: string
  onTeacherChange: (v: string) => void
  filterSubject: string
  onSubjectChange: (v: string) => void
  uniqueTeachers: string[]
  uniqueSubjects: string[]
  todayDayName: string
  weekLabel: string
  onWeekChange: (direction: -1 | 1) => void
  onPrint: () => void
  stats: { sessions: number; teachers: number; students: number }
}

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export const ScheduleHeader = ({
  searchTerm,
  onSearchChange,
  filterDay,
  onDayChange,
  filterTeacher,
  onTeacherChange,
  filterSubject,
  onSubjectChange,
  uniqueTeachers,
  uniqueSubjects,
  todayDayName,
  weekLabel,
  onWeekChange,
  onPrint,
  stats,
}: ScheduleHeaderProps) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        size: 4 + Math.random() * 8,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        duration: 3 + Math.random() * 3,
        delay: Math.random() * 2,
      })),
    [],
  )

  return (
    <div className="mb-4 space-y-3">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8"
      >
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/10"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
                <CalendarDays className="text-white" size={20} />
              </div>
              <span className="text-xs font-medium text-white/70">نظام الجداول الدراسية</span>
            </div>
            <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">
              الجداول الدراسية
            </h1>
            <p className="text-sm text-white/70">جدول الحصص الأسبوعي للمعلمات والطلاب</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <div className="text-center">
              <p className="mb-1 text-xs text-white/60">الحصص</p>
              <div className="text-2xl font-bold text-white">{stats.sessions}</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="mb-1 text-xs text-white/60">المعلمات</p>
              <div className="text-2xl font-bold text-white">{stats.teachers}</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="mb-1 text-xs text-white/60">الطلاب</p>
              <div className="text-2xl font-bold text-white">{stats.students}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls toolbar */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-3 md:flex-row md:items-center md:p-4">
        {/* Left: week nav + search + today */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onWeekChange(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-hover text-main transition-all hover:bg-primary/10 active:scale-90"
            >
              <ChevronRight size={14} />
            </button>
            <span className="min-w-[90px] rounded-xl bg-surface px-3 py-1.5 text-center text-xs font-bold text-main">
              {weekLabel}
            </span>
            <button
              onClick={() => onWeekChange(1)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-hover text-main transition-all hover:bg-primary/10 active:scale-90"
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          <div className="relative">
            <Search size={13} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              aria-label="بحث"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-28 rounded-xl border border-border bg-surface px-7 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus:border-primary sm:w-36"
            />
          </div>

          <button
            onClick={() => onDayChange(filterDay === todayDayName ? 'all' : todayDayName)}
            className={`flex h-8 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-bold transition-all active:scale-95 ${
              filterDay === todayDayName
                ? 'border-primary bg-primary text-on-primary'
                : 'border-border bg-surface text-main hover:bg-hover'
            }`}
          >
            <CalendarDays size={12} />
            <span className="hidden sm:inline">اليوم</span>
          </button>

          <button
            onClick={onPrint}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-main transition-all hover:bg-hover active:scale-95"
          >
            <Printer size={12} />
          </button>
        </div>

        {/* Right: filters + pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 py-1">
            <CalendarDays size={11} className="text-primary" />
            <span className="text-[10px] font-bold text-primary">{stats.sessions} حصة</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 py-1">
            <GraduationCap size={11} className="text-primary" />
            <span className="text-[10px] font-bold text-primary">{stats.teachers} معلمة</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 py-1">
            <BookOpen size={11} className="text-primary" />
            <span className="text-[10px] font-bold text-primary">{stats.students} طالب</span>
          </div>

          <select
            value={filterDay}
            onChange={(e) => onDayChange(e.target.value)}
            aria-label="اليوم"
            className="h-8 rounded-xl border border-border bg-surface px-2 text-xs font-bold text-main outline-none transition-all focus:border-primary"
          >
            <option value="all">كل الأيام</option>
            {DAYS_OF_WEEK.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          <select
            value={filterTeacher}
            onChange={(e) => onTeacherChange(e.target.value)}
            aria-label="المعلمة"
            className="h-8 rounded-xl border border-border bg-surface px-2 text-xs font-bold text-main outline-none transition-all focus:border-primary"
          >
            <option value="all">كل المعلمات</option>
            {uniqueTeachers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={filterSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            aria-label="المادة"
            className="h-8 rounded-xl border border-border bg-surface px-2 text-xs font-bold text-main outline-none transition-all focus:border-primary"
          >
            <option value="all">كل المواد</option>
            {uniqueSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
