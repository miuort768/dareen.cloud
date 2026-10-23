import { Search, GraduationCap, CalendarDays, X, RotateCcw } from 'lucide-react'

interface AppointmentsFiltersProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  filterDay: string
  onDayChange: (v: string) => void
  filterTeacher: string
  onTeacherChange: (v: string) => void
  uniqueTeachers: string[]
  todayName: string
  hasActiveFilters: boolean
  onReset: () => void
}

/**
 * شريط فلاتر سطح المكتب — بحث + قائمة أيام عادية + قائمة معلمات + إعادة تعيين.
 */
export const AppointmentsFilters = ({
  searchTerm,
  onSearchChange,
  filterDay,
  onDayChange,
  filterTeacher,
  onTeacherChange,
  uniqueTeachers,
  todayName,
  hasActiveFilters,
  onReset,
}: AppointmentsFiltersProps) => {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      {/* البحث */}
      <div className="relative flex-1 lg:max-w-sm">
        <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          aria-label="بحث عن موعد"
          placeholder="ابحث باسم الطالب أو المادة..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-2xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="مسح البحث"
            className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-muted outline-none transition-colors hover:text-error focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* القوائم المنسدلة */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Day select */}
        <div className="relative flex-1 lg:w-44">
          <CalendarDays
            size={13}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <select
            aria-label="تصفية حسب اليوم"
            value={filterDay}
            onChange={(e) => onDayChange(e.target.value)}
            className={`h-11 w-full appearance-none rounded-2xl border bg-surface pe-3 ps-9 text-xs font-bold text-main outline-none transition-all hover:bg-hover focus:border-primary dark:[color-scheme:dark] ${
              filterDay !== 'all' ? 'border-primary text-primary' : 'border-border'
            }`}
          >
            <option value="all">كل الأيام</option>
            {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(
              (day) => (
                <option key={day} value={day}>
                  {day}
                  {day === todayName ? ' (اليوم)' : ''}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Teacher select */}
        <div className="relative flex-1 lg:w-48">
          <GraduationCap
            size={13}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <select
            aria-label="تصفية حسب المعلمة"
            value={filterTeacher}
            onChange={(e) => onTeacherChange(e.target.value)}
            className={`h-11 w-full appearance-none rounded-2xl border bg-surface pe-3 ps-9 text-xs font-bold text-main outline-none transition-all hover:bg-hover focus:border-primary dark:[color-scheme:dark] ${
              filterTeacher !== 'all' ? 'border-primary text-primary' : 'border-border'
            }`}
          >
            <option value="all">كل المعلمات</option>
            {uniqueTeachers.map((teacher) => (
              <option key={teacher} value={teacher}>
                {teacher}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            aria-label="إعادة تعيين الفلاتر"
            className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-error px-3 text-xs font-bold text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <RotateCcw size={13} />
            إعادة تعيين
          </button>
        )}
      </div>
    </div>
  )
}
