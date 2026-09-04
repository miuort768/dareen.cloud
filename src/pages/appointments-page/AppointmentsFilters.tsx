import { Search, Filter, GraduationCap, X, SlidersHorizontal } from 'lucide-react'
import { DAYS_OF_WEEK } from '../../features/appointments/types'

interface AppointmentsFiltersProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  filterDay: string
  onDayChange: (v: string) => void
  filterTeacher: string
  onTeacherChange: (v: string) => void
  uniqueTeachers: string[]
  hasActiveFilters: boolean
  onReset: () => void
}

export const AppointmentsFilters = ({
  searchTerm,
  onSearchChange,
  filterDay,
  onDayChange,
  filterTeacher,
  onTeacherChange,
  uniqueTeachers,
  hasActiveFilters,
  onReset,
}: AppointmentsFiltersProps) => (
  <div className="mb-4 rounded-2xl border border-border bg-card">
    <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-2xl bg-primary-soft">
          <SlidersHorizontal size={12} className="text-primary" />
        </div>
        <span className="text-xs font-bold text-muted">تصفية النتائج</span>
        {hasActiveFilters && (
          <span className="rounded-2xl bg-primary-soft px-1.5 py-0.5 text-micro font-bold text-primary">
            نشط
          </span>
        )}
      </div>
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 rounded-2xl bg-error-soft px-2 py-1 text-micro font-bold text-error transition-all active:scale-95"
        >
          <X size={12} /> إعادة تعيين
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-3">
      <div className="relative">
        <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          aria-label="بحث"
          placeholder="ابحث باسم الطالب أو المادة..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface py-2 pe-8 ps-8 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-error"
            aria-label="مسح البحث"
          >
            <X size={11} />
          </button>
        )}
      </div>
      <div className="relative">
        <Filter size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
        <select
          value={filterDay}
          onChange={(e) => onDayChange(e.target.value)}
          aria-label="تصفية حسب اليوم"
          className="w-full cursor-pointer appearance-none rounded-2xl border border-border bg-surface py-2 pe-3 ps-8 text-micro font-bold text-main outline-none transition-all focus:outline-none focus:ring-2 focus:ring-focus dark:[color-scheme:dark]"
        >
          <option value="all">كل الأيام</option>
          {DAYS_OF_WEEK.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <GraduationCap size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
        <select
          value={filterTeacher}
          onChange={(e) => onTeacherChange(e.target.value)}
          aria-label="تصفية حسب المعلمة"
          className="w-full cursor-pointer appearance-none rounded-2xl border border-border bg-surface py-2 pe-3 ps-8 text-micro font-bold text-main outline-none transition-all focus:outline-none focus:ring-2 focus:ring-focus dark:[color-scheme:dark]"
        >
          <option value="all">كل المعلمات</option>
          {uniqueTeachers.map((teacher) => (
            <option key={teacher} value={teacher}>
              {teacher}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
)
