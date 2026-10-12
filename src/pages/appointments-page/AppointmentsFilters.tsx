import { Search, GraduationCap, X, RotateCcw } from 'lucide-react'
import { DayDropdown } from '../../shared/components/mobile'
import { FilterDropdown } from '../../shared/components/ui'

interface AppointmentsFiltersProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  filterDay: string
  onDayChange: (v: string) => void
  filterTeacher: string
  onTeacherChange: (v: string) => void
  uniqueTeachers: string[]
  todayName: string
  /** عدد الحصص لكل يوم (بلا فلترة اليوم) — لعرضه داخل قائمة الأيام */
  dayCounts: Record<string, number>
  hasActiveFilters: boolean
  onReset: () => void
}

/**
 * شريط فلاتر سطح المكتب — بحث + قائمة أيام مخصصة + قائمة معلمات مخصصة + إعادة تعيين.
 * قوائم مخصصة (لا عناصر native) لتجنب صندوق المتصفح بالأبيض/الأسود في الوضع الداكن.
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
  dayCounts,
  hasActiveFilters,
  onReset,
}: AppointmentsFiltersProps) => {
  const teacherItems = [
    { key: 'all', label: 'كل المعلمات' },
    ...uniqueTeachers.map((teacher) => ({ key: teacher, label: teacher })),
  ]

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
          className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
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

      {/* القوائم المخصصة */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1 lg:w-44">
          <DayDropdown
            selectedDay={filterDay}
            onSelectDay={onDayChange}
            todayName={todayName}
            dayCounts={dayCounts}
          />
        </div>
        <FilterDropdown
          value={filterTeacher}
          items={teacherItems}
          onChange={onTeacherChange}
          icon={GraduationCap}
          className="flex-1 lg:w-48"
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            aria-label="إعادة تعيين الفلاتر"
            className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-error px-3 text-xs font-bold text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <RotateCcw size={13} />
            إعادة تعيين
          </button>
        )}
      </div>
    </div>
  )
}
