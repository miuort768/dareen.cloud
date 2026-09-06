import {
  Search,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  BookOpen,
  Filter,
} from 'lucide-react'
import { GradientHeroCard } from '../../../../shared/components/GradientHeroCard'

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
  showTeacherSubjectFilters?: boolean
  todayDayName: string
  weekLabel: string
  onWeekChange: (direction: -1 | 1) => void
  onPrint?: () => void
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
  showTeacherSubjectFilters = false,
  todayDayName,
  weekLabel,
  onWeekChange,
  stats,
}: ScheduleHeaderProps) => {
  const activeFiltersCount = [
    filterDay !== 'all',
    filterTeacher !== 'all',
    filterSubject !== 'all',
    searchTerm.trim().length > 0,
  ].filter(Boolean).length

  return (
    <div className="mb-4 space-y-3">
      {/* Hero — internally divided: identity | stats */}
      <GradientHeroCard
        icon={CalendarDays}
        title="الجداول الدراسية"
        subtitle="جدول الحصص الأسبوعي للمعلمات والطلاب"
        end={
          <div className="grid flex-1 grid-cols-3 gap-2">
            {[
              { label: 'الحصص', value: stats.sessions },
              { label: 'المعلمات', value: stats.teachers },
              { label: 'الطلاب', value: stats.students },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/20 bg-white/10 px-2 py-2.5 text-center backdrop-blur-sm"
              >
                <p className="text-lg font-black tabular-nums leading-none text-on-primary">
                  {s.value}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* Controls toolbar — redesigned for better visual consistency */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        {/* Row 1: Search + Week Navigation */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
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
              className={`h-8 appearance-none rounded-lg border bg-surface pe-2 ps-7 text-xs font-bold text-main outline-none transition-all hover:bg-hover focus:border-primary dark:[color-scheme:dark] ${
                filterDay !== 'all' ? 'border-primary text-primary' : 'border-border'
              }`}
            >
              <option className="bg-card text-main" value="all">
                كل الأيام
              </option>
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher select — admin only */}
          {showTeacherSubjectFilters && (
            <div className="relative">
              <GraduationCap
                size={11}
                className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <select
                value={filterTeacher}
                onChange={(e) => onTeacherChange(e.target.value)}
                className={`h-8 max-w-[160px] appearance-none rounded-lg border bg-surface pe-2 ps-7 text-xs font-bold text-main outline-none transition-all hover:bg-hover focus:border-primary dark:[color-scheme:dark] ${
                  filterTeacher !== 'all' ? 'border-primary text-primary' : 'border-border'
                }`}
              >
                <option className="bg-card text-main" value="all">
                  كل المعلمات
                </option>
                {uniqueTeachers.filter(Boolean).map((t) => (
                  <option key={t} value={t} className="bg-card text-main">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject select — admin only */}
          {showTeacherSubjectFilters && (
            <div className="relative">
              <BookOpen
                size={11}
                className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <select
                value={filterSubject}
                onChange={(e) => onSubjectChange(e.target.value)}
                className={`h-8 appearance-none rounded-lg border bg-surface pe-2 ps-7 text-xs font-bold text-main outline-none transition-all hover:bg-hover focus:border-primary dark:[color-scheme:dark] ${
                  filterSubject !== 'all' ? 'border-primary text-primary' : 'border-border'
                }`}
              >
                <option className="bg-card text-main" value="all">
                  كل المواد
                </option>
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s} className="bg-card text-main">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                onDayChange('all')
                onTeacherChange('all')
                onSubjectChange('all')
                onSearchChange('')
              }}
              className="flex h-8 items-center gap-1 rounded-lg border border-error-soft bg-error-soft px-3 text-xs font-bold text-error transition-all hover:bg-error hover:text-on-error"
            >
              <span>مسح ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
