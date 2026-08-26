import { Search, CalendarDays, GraduationCap, X } from 'lucide-react'
import { DAYS_OF_WEEK } from '../../types'

interface AppointmentFiltersProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  filterDay: string
  onDayChange: (v: string) => void
  filterTeacher: string
  onTeacherChange: (v: string) => void
  uniqueTeachers: string[]
}

/** البحث والفلاتر المدمجة لواجهة الهاتف */
export const AppointmentFilters = ({
  searchTerm,
  onSearchChange,
  filterDay,
  onDayChange,
  filterTeacher,
  onTeacherChange,
  uniqueTeachers,
}: AppointmentFiltersProps) => (
  <div className="space-y-2 px-4 pb-2">
    {/* البحث */}
    <div className="relative">
      <Search size={13} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          aria-label="مسح البحث"
          className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-surface p-1.5 text-muted transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <X size={11} strokeWidth={2} />
        </button>
      )}
      <input
        type="search"
        aria-label="بحث عن موعد"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث باسم الطالب أو المادة..."
        className="w-full rounded-2xl border border-border bg-card py-3 pe-10 ps-9 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary"
      />
    </div>

    {/* الفلاتر */}
    <div className="flex gap-2">
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 transition-colors focus-within:border-primary">
        <CalendarDays size={13} className="shrink-0 text-primary" />
        <select
          value={filterDay}
          onChange={(e) => onDayChange(e.target.value)}
          aria-label="تصفية حسب اليوم"
          className="min-w-0 flex-1 cursor-pointer appearance-none truncate bg-transparent text-micro font-bold text-main outline-none"
        >
          <option value="all">كل الأيام</option>
          {DAYS_OF_WEEK.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </label>
      {uniqueTeachers.length > 0 && (
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 transition-colors focus-within:border-primary">
          <GraduationCap size={13} className="shrink-0 text-primary" />
          <select
            value={filterTeacher}
            onChange={(e) => onTeacherChange(e.target.value)}
            aria-label="تصفية حسب المعلمة"
            className="min-w-0 flex-1 cursor-pointer appearance-none truncate bg-transparent text-micro font-bold text-main outline-none"
          >
            <option value="all">كل المعلمات</option>
            {uniqueTeachers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  </div>
)
