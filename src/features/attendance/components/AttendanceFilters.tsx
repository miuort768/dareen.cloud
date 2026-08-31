import { motion } from 'framer-motion'
import {
  Search,
  GraduationCap,
  X,
  SlidersHorizontal,
  CalendarDays,
  Filter,
  BookOpen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type PeriodFilter = 'today' | 'week' | 'month' | 'custom'

interface AttendanceFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: string
  onStatusChange: (value: string) => void
  filterTeacher: string
  onTeacherChange: (value: string) => void
  uniqueTeachers: string[]
  filterSubject?: string
  onSubjectChange?: (value: string) => void
  uniqueSubjects?: string[]
  periodFilter?: PeriodFilter
  onPeriodChange?: (value: PeriodFilter) => void
  customStartDate?: string
  customEndDate?: string
  onCustomStartChange?: (value: string) => void
  onCustomEndChange?: (value: string) => void
}

const periodLabels: Record<PeriodFilter, { label: string; icon: LucideIcon }> = {
  today: { label: 'اليوم', icon: CalendarDays },
  week: { label: 'أسبوع', icon: CalendarDays },
  month: { label: 'شهر', icon: CalendarDays },
  custom: { label: 'مخصص', icon: CalendarDays },
}

export const AttendanceFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterTeacher,
  onTeacherChange,
  uniqueTeachers,
  filterSubject,
  onSubjectChange,
  uniqueSubjects,
  periodFilter,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomStartChange,
  onCustomEndChange,
}: AttendanceFiltersProps) => {
  const hasActiveFilters =
    searchTerm ||
    filterStatus !== 'all' ||
    filterTeacher !== 'all' ||
    (filterSubject && filterSubject !== 'all')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <div className="rounded-none border border-border bg-card p-3 md:p-4">
        {/* Top bar */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-none bg-primary-soft text-primary">
              <SlidersHorizontal size={12} />
            </div>
            <span className="text-xs font-bold text-main">فلترة السجلات</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Segmented Control */}
            {periodFilter && onPeriodChange && (
              <div className="flex gap-0.5 rounded-none bg-surface p-0.5" dir="ltr">
                {(Object.keys(periodLabels) as PeriodFilter[]).map((key) => {
                  const isActive = periodFilter === key
                  return (
                    <button
                      key={key}
                      onClick={() => onPeriodChange(key)}
                      className={`relative whitespace-nowrap rounded-none px-2.5 py-1 text-[9px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${isActive ? 'text-on-primary' : 'text-muted hover:text-main'}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="period-pill-att"
                          className="absolute inset-0 rounded-none bg-primary"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{periodLabels[key].label}</span>
                    </button>
                  )
                })}
              </div>
            )}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onSearchChange('')
                  onStatusChange('all')
                  onTeacherChange('all')
                  onSubjectChange?.('all')
                }}
                className="flex items-center gap-1 rounded-none bg-error-soft px-2 py-1 text-[9px] font-bold text-error transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <X size={10} /> مسح
              </button>
            )}
          </div>
        </div>

        {/* Custom date range */}
        {periodFilter === 'custom' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-3 flex flex-wrap items-center gap-2 border-b border-border pb-3"
          >
            <span className="text-[9px] font-bold text-muted">من</span>
            <input
              aria-label="تاريخ البداية"
              type="date"
              value={customStartDate || ''}
              onChange={(e) => onCustomStartChange?.(e.target.value)}
              className="rounded-none border border-border bg-surface px-2 py-1.5 text-[9px] font-bold outline-none transition-all focus-visible:border-primary"
            />
            <span className="text-[9px] font-bold text-muted">إلى</span>
            <input
              aria-label="تاريخ النهاية"
              type="date"
              value={customEndDate || ''}
              onChange={(e) => onCustomEndChange?.(e.target.value)}
              className="rounded-none border border-border bg-surface px-2 py-1.5 text-[9px] font-bold outline-none transition-all focus-visible:border-primary"
            />
          </motion.div>
        )}

        {/* Filters row */}
        <div className="flex flex-col gap-2 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              aria-label="بحث بالاسم أو المادة"
              type="text"
              placeholder="اسم الطالب، المادة..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-none border border-border bg-surface py-2 pe-3 ps-8 text-[10px] font-medium transition-all focus-visible:border-primary focus-visible:outline-none"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Filter
                size={13}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <select
                value={filterStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                aria-label="تصفية حسب الحالة"
                className="cursor-pointer appearance-none rounded-none border border-border bg-surface py-2 pe-3 ps-8 text-[10px] font-medium transition-all focus-visible:border-primary focus-visible:outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="scheduled">مجدولة</option>
                <option value="completed">حضور</option>
                <option value="cancelled">غياب</option>
              </select>
            </div>
            <div className="relative">
              <GraduationCap
                size={13}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <select
                value={filterTeacher}
                onChange={(e) => onTeacherChange(e.target.value)}
                aria-label="تصفية حسب المعلمة"
                className="cursor-pointer appearance-none rounded-none border border-border bg-surface py-2 pe-3 ps-8 text-[10px] font-medium transition-all focus-visible:border-primary focus-visible:outline-none"
              >
                <option value="all">كافة المعلمات</option>
                {uniqueTeachers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {uniqueSubjects && uniqueSubjects.length > 0 && onSubjectChange && (
              <div className="relative">
                <BookOpen
                  size={13}
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <select
                  value={filterSubject || 'all'}
                  onChange={(e) => onSubjectChange(e.target.value)}
                  aria-label="تصفية حسب المادة"
                  className="cursor-pointer appearance-none rounded-none border border-border bg-surface py-2 pe-3 ps-8 text-[10px] font-medium transition-all focus-visible:border-primary focus-visible:outline-none"
                >
                  <option value="all">جميع المواد</option>
                  {uniqueSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
