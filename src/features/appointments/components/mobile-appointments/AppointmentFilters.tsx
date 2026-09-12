import { Search, X } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { DayDropdown } from './DayDropdown'

interface AppointmentFiltersProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  filterDay: string
  onDayChange: (v: string) => void
  filterTeacher: string
  onTeacherChange: (v: string) => void
  uniqueTeachers: string[]
  todayName: string
  /** عدد حصص كل يوم في التبويب الحالي */
  dayCounts: Record<string, number>
}

/** البحث والفلاتر المدمجة لواجهة الهاتف — شرائح بدل القوائم المنسدلة */
export const AppointmentFilters = ({
  searchTerm,
  onSearchChange,
  filterDay,
  onDayChange,
  filterTeacher,
  onTeacherChange,
  uniqueTeachers,
  todayName,
  dayCounts,
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

    {/* قائمة الأيام المنسدلة */}
    <DayDropdown
      selectedDay={filterDay}
      onSelectDay={onDayChange}
      todayName={todayName}
      dayCounts={dayCounts}
    />

    {/* شرائح المعلمات */}
    {uniqueTeachers.length > 1 && (
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
        {[
          { label: 'كل المعلمات', value: 'all' } as const,
          ...uniqueTeachers.map((t) => ({ label: t, value: t })),
        ].map(({ label, value }) => {
          const selected = filterTeacher === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onTeacherChange(value)}
              aria-pressed={selected}
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
                selected
                  ? 'border-transparent bg-info text-on-info shadow-elevation-1'
                  : 'border-border bg-card text-main hover:border-info-soft hover:bg-info-soft hover:text-info',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    )}
  </div>
)
