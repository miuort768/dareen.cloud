import { Users, X, Download, FileSpreadsheet, FileText, Search, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { PageHeader, FilterDropdown } from '../../../shared/components/ui'

interface ParentsHeaderProps {
  totalParents: number
  totalLinkedStudents: number
  showAddForm: boolean
  searchTerm: string
  onSearchChange: (val: string) => void
  filterStatus: string
  onFilterStatusChange: (val: string) => void
  onToggleAddForm: () => void
  onImport: () => void
  onExportExcel: () => void
  onExportPDF: () => void
}

const statusFilters = [
  { value: '', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'overdue', label: 'متأخرات' },
]

/**
 * Unified PageHeader pattern: white card, title + meta chips, secondary icon actions,
 * toolbar (search + status filter) and a single primary action (add).
 */
export const ParentsHeader = ({
  totalParents,
  totalLinkedStudents,
  showAddForm,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onToggleAddForm,
  onImport,
  onExportExcel,
  onExportPDF,
}: ParentsHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    <PageHeader
      title="سجل أولياء الأمور"
      subtitle="إدارة سجل أولياء الأمور وبيانات التواصل"
      icon={<Users size={20} />}
      meta={
        <>
          <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted">
            {totalParents} ولي أمر
          </span>
          <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted">
            {totalLinkedStudents} طالب مرتبط
          </span>
        </>
      }
      actions={
        <div className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            onClick={onImport}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted transition-all hover:bg-hover hover:text-main"
            aria-label="استيراد"
            title="استيراد"
          >
            <Download size={14} />
          </button>
          <div className="h-4 w-px bg-divider" />
          <button
            type="button"
            onClick={onExportExcel}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted transition-all hover:bg-hover hover:text-main"
            aria-label="تصدير Excel"
            title="تصدير Excel"
          >
            <FileSpreadsheet size={14} />
          </button>
          <button
            type="button"
            onClick={onExportPDF}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted transition-all hover:bg-hover hover:text-main"
            aria-label="تصدير PDF"
            title="تصدير PDF"
          >
            <FileText size={14} />
          </button>
        </div>
      }
      toolbar={
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-sm">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              aria-label="بحث عن ولي أمر"
              placeholder="ابحث بالاسم أو الهاتف..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 md:h-10"
            />
          </div>
          <FilterDropdown
            value={filterStatus}
            items={statusFilters.map((f) => ({ key: f.value, label: f.label }))}
            onChange={onFilterStatusChange}
            className="w-32"
          />
        </div>
      }
      action={
        <button
          type="button"
          onClick={onToggleAddForm}
          className={cn(
            'flex h-11 items-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] md:h-10',
            showAddForm
              ? 'bg-error text-on-error hover:bg-error-hover'
              : 'bg-primary text-on-primary shadow-elevation-1 hover:bg-primary-hover',
          )}
        >
          {showAddForm ? <X size={14} /> : <UserPlus size={14} />}
          {showAddForm ? 'إلغاء' : 'إضافة ولي أمر'}
        </button>
      }
    />
  </motion.div>
)
