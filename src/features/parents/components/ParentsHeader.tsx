import {
  Users,
  X,
  GraduationCap,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  UserPlus,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'

interface ParentsHeaderProps {
  totalParents: number
  totalLinkedStudents: number
  avgChildren: number
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

export const ParentsHeader = ({
  totalParents,
  totalLinkedStudents,
  avgChildren,
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
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover shadow-xl dark:border dark:border-primary/20 dark:from-primary dark:via-primary-deep dark:to-primary-hover"
  >
    <div className="absolute inset-0 opacity-[0.06]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="parent-hero-grid"
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="white" />
            <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#parent-hero-grid)" />
      </svg>
    </div>
    <div className="relative z-10 space-y-4 p-4 md:p-5">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30 md:h-10 md:w-10">
            <Users size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-on-primary md:text-base">سجل أولياء الأمور</h1>
            <p className="text-[10px] text-white/70 md:text-[11px]">
              {totalParents} ولي أمر · {totalLinkedStudents} طالب مرتبط
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Icons */}
          <div className="hidden items-center gap-1 rounded-xl bg-white/10 p-0.5 md:flex">
            <button
              onClick={onImport}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition-all hover:bg-white/20 hover:text-white"
              aria-label="استيراد"
            >
              <Download size={12} />
            </button>
            <div className="h-3 w-px bg-white/20" />
            <button
              onClick={onExportExcel}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition-all hover:bg-white/20 hover:text-white"
              aria-label="تصدير Excel"
            >
              <FileSpreadsheet size={12} />
            </button>
            <button
              onClick={onExportPDF}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition-all hover:bg-white/20 hover:text-white"
              aria-label="تصدير PDF"
            >
              <FileText size={12} />
            </button>
          </div>
          <button
            onClick={onToggleAddForm}
            className={cn(
              'flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold shadow-lg transition-colors focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.97] md:h-9 md:px-4 md:text-[11px]',
              showAddForm ? 'bg-error text-on-error' : 'bg-white/20 text-white hover:bg-white/30',
            )}
          >
            {showAddForm ? <X size={14} /> : <UserPlus size={14} />}
            <span className="sm:hidden">{showAddForm ? 'إلغاء' : 'إضافة'}</span>
            <span className="hidden sm:inline">{showAddForm ? 'إلغاء' : 'إضافة ولي أمر'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          { icon: Users, value: totalParents, label: 'إجمالي أولياء الأمور', change: '' },
          { icon: GraduationCap, value: totalLinkedStudents, label: 'إجمالي الأبناء', change: '' },
          {
            icon: TrendingUp,
            value: avgChildren,
            label: 'متوسط الأبناء',
            suffix: '/ ولي أمر',
            change: '',
          },
          { icon: UserPlus, value: totalParents > 0 ? '—' : '—', label: 'آخر تسجيل', change: '' },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm"
          >
            <div className="mb-1 flex items-center gap-1.5">
              <item.icon size={11} className="text-white/70" />
              <span className="text-xs font-bold tabular-nums text-white md:text-sm">
                {item.value}
                {item.suffix || ''}
              </span>
            </div>
            <p className="text-[8px] text-white/60 md:text-[9px]">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            aria-label="بحث عن ولي أمر"
            placeholder="ابحث بالاسم أو الهاتف..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/20 bg-white/15 pe-3 ps-10 text-xs font-bold text-white outline-none backdrop-blur-sm transition-colors placeholder:text-white/40 focus-visible:border-white/40 focus-visible:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/30 md:h-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterStatusChange(f.value)}
              aria-pressed={filterStatus === f.value}
              className={cn(
                'flex h-9 min-w-[44px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.97]',
                filterStatus === f.value
                  ? 'bg-white text-primary shadow-sm'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
)
