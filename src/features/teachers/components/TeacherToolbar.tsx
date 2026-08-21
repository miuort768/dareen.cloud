import { Search, Plus, X, Upload, Trash2, FileSpreadsheet, FileText, BookOpen, SlidersHorizontal } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { FilterDropdown } from '../../../shared/components/ui'

interface TeacherToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  showAddForm: boolean
  onToggleAddForm: () => void
  onImport: () => void
  onExportExcel: () => void
  onExportPDF: () => void
  onDeleteAll: () => void
  subjects: string[]
  filterSubject: string
  onFilterSubjectChange: (value: string) => void
  filterStatus: string
  onFilterStatusChange: (value: string) => void
  totalTeachers: number
  filteredCount: number
}

const statusFilterItems = [
  { key: '', label: 'الكل' },
  { key: 'active', label: 'نشطة', dot: 'bg-success' },
  { key: 'inactive', label: 'متوقفة', dot: 'bg-error' },
]

export const TeacherToolbar = ({
  searchTerm,
  onSearchChange,
  showAddForm,
  onToggleAddForm,
  onImport,
  onExportExcel,
  onExportPDF,
  onDeleteAll,
  subjects,
  filterSubject,
  onFilterSubjectChange,
  filterStatus,
  onFilterStatusChange,
  totalTeachers,
  filteredCount,
}: TeacherToolbarProps) => {
  const showFilters = subjects.length > 0 || totalTeachers > 0

  const subjectItems = [
    { key: '', label: 'كل المواد' },
    ...subjects.map((subj) => ({ key: subj, label: subj })),
  ]

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-3 shadow-elevation-1">
      {/* Search + Actions */}
      <div className="sm:flex sm:items-center sm:gap-2">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input
            type="text"
            aria-label="بحث عن معلمة"
            placeholder="بحث بالاسم أو التخصص..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pe-3 ps-9 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div className="mt-2 flex items-center gap-1.5 sm:mt-0 sm:shrink-0">
          <button
            onClick={onImport}
            className="flex h-8 flex-1 items-center justify-center rounded-lg border-2 border-border bg-surface font-black text-main transition-transform hover:bg-hover active:scale-95 sm:w-8 sm:flex-none"
            aria-label="استيراد"
          >
            <Upload size={13} />
          </button>
          <button
            onClick={onExportExcel}
            className="flex h-8 flex-1 items-center justify-center rounded-lg border-2 border-success bg-success font-black text-on-success shadow-sm transition-transform hover:bg-success-dark active:scale-95 sm:w-8 sm:flex-none"
            aria-label="تصدير Excel"
          >
            <FileSpreadsheet size={13} />
          </button>
          <button
            onClick={onExportPDF}
            className="flex h-8 flex-1 items-center justify-center rounded-lg border-2 border-error bg-error font-black text-on-error shadow-sm transition-transform hover:bg-error-hover active:scale-95 sm:w-8 sm:flex-none"
            aria-label="تصدير PDF"
          >
            <FileText size={13} />
          </button>
          <button
            onClick={onDeleteAll}
            className="flex h-8 flex-1 items-center justify-center rounded-lg border-2 border-error bg-error font-black text-on-error shadow-sm transition-transform hover:bg-error-hover active:scale-95 sm:w-8 sm:flex-none"
            aria-label="حذف الكل"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onToggleAddForm}
            className={cn(
              'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 text-[11px] font-black shadow-sm transition-all active:scale-95 sm:flex-none',
              showAddForm
                ? 'border-2 border-error bg-error text-on-error'
                : 'border-2 border-primary bg-primary text-on-primary',
            )}
          >
            {showAddForm ? <X size={13} /> : <Plus size={13} />}
            {showAddForm ? 'إلغاء' : 'إضافة'}
          </button>
        </div>
      </div>

      {/* Dropdown Filters — full width, each half */}
      {showFilters && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {subjects.length > 0 ? (
              <>
                <FilterDropdown
                  value={filterSubject}
                  items={subjectItems}
                  onChange={onFilterSubjectChange}
                  icon={BookOpen}
                />
                <FilterDropdown
                  value={filterStatus}
                  items={statusFilterItems}
                  onChange={onFilterStatusChange}
                  icon={SlidersHorizontal}
                />
              </>
            ) : (
              <FilterDropdown
                value={filterStatus}
                items={statusFilterItems}
                onChange={onFilterStatusChange}
                icon={SlidersHorizontal}
                className="col-span-2"
              />
            )}
          </div>
          <div className="flex">
            <span className="rounded-lg border border-border bg-surface px-2 py-1 text-[10px] font-bold text-muted">
              النتائج: {filteredCount} / {totalTeachers}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
