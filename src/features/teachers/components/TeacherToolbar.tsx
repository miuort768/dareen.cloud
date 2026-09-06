import {
  Search,
  Plus,
  X,
  Upload,
  Trash2,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from 'lucide-react'
import { cn } from '../../../lib/utils'

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
}

const selectClass =
  'h-11 w-full appearance-none rounded-xl border border-border bg-surface ps-3.5 pe-9 text-xs font-bold text-main outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10'

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
}: TeacherToolbarProps) => {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-3 shadow-elevation-1 sm:p-3.5">
      {/* Search + Actions */}
      <div className="sm:flex sm:items-center sm:gap-2">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            aria-label="بحث عن معلمة"
            placeholder="بحث بالاسم أو التخصص..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-base font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 sm:h-9 sm:text-xs"
          />
        </div>
        <div className="mt-2 flex items-center gap-2 sm:mt-0 sm:shrink-0 sm:gap-1.5">
          <button
            onClick={onImport}
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-border bg-surface font-bold text-main transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 sm:h-9 sm:w-9 sm:flex-none"
            aria-label="استيراد"
          >
            <Upload size={15} />
          </button>
          <button
            onClick={onExportExcel}
            className="flex h-10 flex-1 items-center justify-center rounded-xl bg-success font-bold text-on-success shadow-elevation-1 transition-colors hover:bg-success-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 sm:h-9 sm:w-9 sm:flex-none"
            aria-label="تصدير Excel"
          >
            <FileSpreadsheet size={15} />
          </button>
          <button
            onClick={onExportPDF}
            className="flex h-10 flex-1 items-center justify-center rounded-xl bg-error font-bold text-on-error shadow-elevation-1 transition-colors hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 sm:h-9 sm:w-9 sm:flex-none"
            aria-label="تصدير PDF"
          >
            <FileText size={15} />
          </button>
          <button
            onClick={onDeleteAll}
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-error-soft bg-error-soft font-bold text-error transition-colors hover:bg-error hover:text-on-error focus-visible:ring-2 focus-visible:ring-focus active:scale-95 sm:h-9 sm:w-9 sm:flex-none"
            aria-label="حذف الكل"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={onToggleAddForm}
            className={cn(
              'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold shadow-elevation-1 transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-95 sm:h-9 sm:flex-none',
              showAddForm
                ? 'border border-error bg-error text-on-error'
                : 'border border-primary bg-primary text-on-primary',
            )}
          >
            {showAddForm ? <X size={14} /> : <Plus size={14} />}
            {showAddForm ? 'إلغاء' : 'إضافة'}
          </button>
        </div>
      </div>

      {/* Plain select filters */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <select
            value={filterSubject}
            onChange={(e) => onFilterSubjectChange(e.target.value)}
            aria-label="فلترة حسب المادة"
            className={selectClass}
          >
            <option value="">كل المواد</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            aria-label="فلترة حسب الحالة"
            className={selectClass}
          >
            <option value="">كل الحالات</option>
            <option value="active">نشطة</option>
            <option value="inactive">متوقفة</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>
    </div>
  )
}
