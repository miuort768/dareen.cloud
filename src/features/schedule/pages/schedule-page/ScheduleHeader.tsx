import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  BookOpen,
  Filter,
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

  const activeFiltersCount = [
    filterDay !== 'all',
    filterTeacher !== 'all',
    filterSubject !== 'all',
    searchTerm.trim().length > 0,
  ].filter(Boolean).length

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

      {/* Controls toolbar — redesigned for better visual consistency */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        {/* Row 1: Search + Week Navigation */}
        <div className="border-border/50 flex items-center gap-3 border-b px-4 py-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              aria-label="بحث"
              placeholder="بحث عن طالب، معلمة، أو مادة..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface px-9 text-xs font-bold text-main outline-none transition-all placeholder:font-normal placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Week Navigation */}
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
            <button
              onClick={() => onWeekChange(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-main transition-all hover:bg-hover active:scale-90"
              aria-label="الأسبوع السابق"
            >
              <ChevronRight size={14} />
            </button>
            <span className="min-w-[110px] px-2 text-center text-[11px] font-bold text-main">
              {weekLabel}
            </span>
            <button
              onClick={() => onWeekChange(1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-main transition-all hover:bg-hover active:scale-90"
              aria-label="الأسبوع التالي"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
            <Filter size={11} />
            <span>تصفية:</span>
          </div>

          {/* Today button */}
          <button
            onClick={() => onDayChange(filterDay === todayDayName ? 'all' : todayDayName)}
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-all ${
              filterDay === todayDayName
                ? 'border-primary bg-primary text-on-primary'
                : 'border-border bg-surface text-main hover:bg-hover'
            }`}
          >
            <CalendarDays size={11} />
            <span>اليوم</span>
          </button>

          {/* Day select */}
          <div className="relative">
            <CalendarDays
              size={11}
              className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <select
              value={filterDay}
              onChange={(e) => onDayChange(e.target.value)}
              className={`h-8 appearance-none rounded-lg border bg-surface pe-2 ps-7 text-xs font-bold text-main outline-none transition-all hover:bg-hover focus:border-primary ${
                filterDay !== 'all' ? 'border-primary text-primary' : 'border-border'
              }`}
            >
              <option value="all">كل الأيام</option>
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher select */}
          <div className="relative">
            <GraduationCap
              size={11}
              className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <select
              value={filterTeacher}
              onChange={(e) => onTeacherChange(e.target.value)}
              className={`h-8 max-w-[160px] appearance-none rounded-lg border bg-surface pe-2 ps-7 text-xs font-bold text-main outline-none transition-all hover:bg-hover focus:border-primary ${
                filterTeacher !== 'all' ? 'border-primary text-primary' : 'border-border'
              }`}
            >
              <option value="all">كل المعلمات</option>
              {uniqueTeachers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Subject select */}
          <div className="relative">
            <BookOpen
              size={11}
              className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <select
              value={filterSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className={`h-8 appearance-none rounded-lg border bg-surface pe-2 ps-7 text-xs font-bold text-main outline-none transition-all hover:bg-hover focus:border-primary ${
                filterSubject !== 'all' ? 'border-primary text-primary' : 'border-border'
              }`}
            >
              <option value="all">كل المواد</option>
              {uniqueSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                onDayChange('all')
                onTeacherChange('all')
                onSubjectChange('all')
                onSearchChange('')
              }}
              className="border-error-soft flex h-8 items-center gap-1 rounded-lg border bg-error-soft px-3 text-xs font-bold text-error transition-all hover:bg-error hover:text-on-error"
            >
              <span>مسح ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
