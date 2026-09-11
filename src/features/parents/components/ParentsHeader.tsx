import {
  Users,
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  UserPlus,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { PageHeader, FilterDropdown, StatCard } from '../../../shared/components/ui'
import type { StatCardProps } from '../../../shared/components/ui'
import { MobilePageHeader } from '../../../shared/components/mobile/MobilePageHeader'

interface ParentsHeaderProps {
  totalParents: number
  totalLinkedStudents: number
  activeParents: number
  overdueParents: number
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

interface ParentsStat {
  title: string
  value: number
  icon: StatCardProps['icon']
  variant: NonNullable<StatCardProps['variant']>
}

/**
 * Colored stat-card hero: MobilePageHeader on mobile, PageHeader on desktop,
 * plus a 4-card colored stats grid (totals, linked students, active, overdue).
 */
export const ParentsHeader = ({
  totalParents,
  totalLinkedStudents,
  activeParents,
  overdueParents,
  showAddForm,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onToggleAddForm,
  onImport,
  onExportExcel,
  onExportPDF,
}: ParentsHeaderProps) => {
  const stats: ParentsStat[] = [
    { title: 'إجمالي أولياء الأمور', value: totalParents, icon: Users, variant: 'soft-primary' },
    {
      title: 'طلاب مرتبطون',
      value: totalLinkedStudents,
      icon: GraduationCap,
      variant: 'soft-info',
    },
    { title: 'أولياء نشطون', value: activeParents, icon: CheckCircle2, variant: 'soft-success' },
    {
      title: 'أولياء متأخرات',
      value: overdueParents,
      icon: AlertTriangle,
      variant: 'soft-warning',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4 md:space-y-5"
    >
      {/* Mobile header */}
      <div className="md:hidden">
        <MobilePageHeader
          title="سجل أولياء الأمور"
          subtitle="إدارة بيانات التواصل"
          icon={<Users size={20} />}
          action={
            <button
              type="button"
              onClick={onToggleAddForm}
              className={cn(
                'flex h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
                showAddForm
                  ? 'bg-error text-on-error hover:bg-error-hover'
                  : 'bg-primary text-on-primary shadow-elevation-1 hover:bg-primary-hover',
              )}
            >
              {showAddForm ? <X size={14} /> : <UserPlus size={14} />}
              {showAddForm ? 'إلغاء' : 'إضافة'}
            </button>
          }
        />
        <div className="mt-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              aria-label="بحث عن ولي أمر"
              placeholder="ابحث بالاسم أو الهاتف..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
            />
          </div>
          <FilterDropdown
            value={filterStatus}
            items={statusFilters.map((f) => ({ key: f.value, label: f.label }))}
            onChange={onFilterStatusChange}
            className="w-32 shrink-0"
          />
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:block">
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
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted outline-none transition-all hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
                aria-label="استيراد"
                title="استيراد"
              >
                <Download size={14} />
              </button>
              <div className="h-4 w-px bg-divider" />
              <button
                type="button"
                onClick={onExportExcel}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted outline-none transition-all hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
                aria-label="تصدير Excel"
                title="تصدير Excel"
              >
                <FileSpreadsheet size={14} />
              </button>
              <button
                type="button"
                onClick={onExportPDF}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted outline-none transition-all hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
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
                <Search
                  size={14}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                />
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
      </div>

      {/* Colored stat cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stats.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              variant={card.variant}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
