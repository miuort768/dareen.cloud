import { Search, Plus, X, Upload, Trash2, FileSpreadsheet, FileText } from 'lucide-react'
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
  filteredCount: number
}

const subjectColorMap: Record<string, string> = {
  رياضيات: 'text-primary bg-primary/10 ring-primary/20',
  عربي: 'text-success bg-success/10 ring-success/20',
  'اللغة العربية': 'text-success bg-success/10 ring-success/20',
  علوم: 'text-info bg-info-soft ring-info/20',
  إنجليزي: 'text-warning bg-warning/10 ring-warning/20',
  'اللغة الانجليزية': 'text-warning bg-warning/10 ring-warning/20',
  فيزياء: 'text-accent bg-accent/10 ring-accent/20',
  كيمياء: 'text-error bg-error/10 ring-error/20',
  لغات: 'text-accent bg-accent/10 ring-accent/20',
  'اللغة الفرنسية': 'text-accent bg-accent/10 ring-accent/20',
  'اللغة الاسبانية': 'text-info bg-info-soft ring-info/20',
  أدبي: 'text-warning bg-warning/10 ring-warning/20',
  دراسات: 'text-success bg-success/10 ring-success/20',
  قرآن: 'text-primary bg-primary/10 ring-primary/20',
  قران: 'text-primary bg-primary/10 ring-primary/20',
  شرعية: 'text-success bg-success/10 ring-success/20',
  اجتماعيات: 'text-warning bg-warning/10 ring-warning/20',
}

const getSubjectStyle = (subject?: string) => {
  if (!subject) return 'text-muted bg-surface ring-border'
  const key = Object.keys(subjectColorMap).find((k) => subject.includes(k) || k.includes(subject))
  return key ? subjectColorMap[key] : 'text-info bg-info-soft ring-info/20'
}

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
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-3 shadow-elevation-1">
      {/* Search + Actions Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
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
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onImport}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border bg-surface font-black text-main transition-transform hover:bg-hover active:scale-95"
            aria-label="استيراد"
          >
            <Upload size={13} />
          </button>
          <button
            onClick={onExportExcel}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-success bg-success font-black text-on-success shadow-sm transition-transform hover:bg-success-dark active:scale-95"
            aria-label="تصدير Excel"
          >
            <FileSpreadsheet size={13} />
          </button>
          <button
            onClick={onExportPDF}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-error bg-error font-black text-on-error shadow-sm transition-transform hover:bg-error-hover active:scale-95"
            aria-label="تصدير PDF"
          >
            <FileText size={13} />
          </button>
          <button
            onClick={onDeleteAll}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-error bg-error font-black text-on-error shadow-sm transition-transform hover:bg-error-hover active:scale-95"
            aria-label="حذف الكل"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onToggleAddForm}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[11px] font-black shadow-sm transition-all active:scale-95',
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

      {/* Chips Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {/* نتائج */}
          <span className="rounded-lg border border-border bg-surface px-2 py-1 text-[10px] font-bold text-muted">
            {filteredCount} / {totalTeachers}
          </span>

          {/* تخصص */}
          {subjects.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => onFilterSubjectChange('')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[9px] font-bold ring-1 transition-all',
                  !filterSubject
                    ? 'bg-primary text-on-primary ring-primary/30'
                    : 'bg-surface text-muted ring-border hover:bg-hover',
                )}
              >
                الكل
              </button>
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => onFilterSubjectChange(filterSubject === subj ? '' : subj)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[9px] font-bold ring-1 transition-all',
                    filterSubject === subj
                      ? getSubjectStyle(subj)
                      : 'bg-surface text-muted ring-border hover:bg-hover',
                  )}
                >
                  {subj}
                </button>
              ))}
            </div>
          )}

          {/* الحالة */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted">|</span>
            {['', 'active', 'inactive'].map((status) => {
              const label = status === '' ? 'الكل' : status === 'active' ? 'نشطة' : 'متوقفة'
              const isActive = filterStatus === status
              const dot =
                status === 'active' ? 'bg-success' : status === 'inactive' ? 'bg-error' : ''
              return (
                <button
                  key={status}
                  onClick={() => onFilterStatusChange(isActive ? '' : status)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-bold ring-1 transition-all',
                    isActive
                      ? 'bg-primary text-on-primary ring-primary/30'
                      : 'bg-surface text-muted ring-border hover:bg-hover',
                  )}
                >
                  {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
