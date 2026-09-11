import { Plus, Search, ListTodo, Clock, RefreshCcw, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader, FilterDropdown, StatCard } from '../../../shared/components/ui'
import type { StatCardProps } from '../../../shared/components/ui'
import { MobilePageHeader } from '../../../shared/components/mobile/MobilePageHeader'
import type { TaskStatus } from '../types'

export type StatusFilter = 'all' | TaskStatus

interface TasksHeaderProps {
  stats: { total: number; pending: number; inProgress: number; completed: number; score: number }
  searchTerm: string
  onSearchChange: (val: string) => void
  filterStatus: StatusFilter
  onFilterStatusChange: (val: StatusFilter) => void
  onAdd: () => void
}

const statusFilters = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'معلقة' },
  { value: 'in-progress', label: 'جارية' },
  { value: 'completed', label: 'مكتملة' },
]

interface TasksStat {
  title: string
  value: number
  icon: StatCardProps['icon']
  variant: NonNullable<StatCardProps['variant']>
}

/**
 * Colored stat-card hero — بنفس لغة صفحة «أبنائي» (ParentsHeader):
 * MobilePageHeader على الهاتف، PageHeader على سطح المكتب، وشبكة 4 بطاقات ملونة.
 */
export const TasksHeader = ({
  stats,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onAdd,
}: TasksHeaderProps) => {
  const cards: TasksStat[] = [
    { title: 'إجمالي المهام', value: stats.total, icon: ListTodo, variant: 'soft-primary' },
    { title: 'معلقة', value: stats.pending, icon: Clock, variant: 'soft-warning' },
    { title: 'قيد التنفيذ', value: stats.inProgress, icon: RefreshCcw, variant: 'soft-info' },
    { title: 'تم الإنجاز', value: stats.completed, icon: CheckCircle2, variant: 'soft-success' },
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
          title="المهام والطلبات"
          subtitle="إدارة وتكليف المهام للمعلمات"
          icon={<ListTodo size={20} />}
          action={
            <button
              type="button"
              onClick={onAdd}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-on-primary shadow-elevation-1 transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              <Plus size={14} />
              إضافة
            </button>
          }
        />
        <div className="mt-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              aria-label="بحث عن مهمة"
              placeholder="ابحث في المهام..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
            />
          </div>
          <FilterDropdown
            value={filterStatus}
            items={statusFilters.map((f) => ({ key: f.value, label: f.label }))}
            onChange={(v) => onFilterStatusChange(v as StatusFilter)}
            className="w-32 shrink-0"
          />
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:block">
        <PageHeader
          title="المهام والطلبات"
          subtitle="إدارة وتكليف المهام للمعلمات"
          icon={<ListTodo size={20} />}
          meta={
            <>
              <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted">
                المهام: {stats.total}
              </span>
              <span className="inline-flex items-center rounded-lg border border-success-soft bg-success-soft px-2 py-0.5 text-[10px] font-bold tabular-nums text-success-strong">
                الإنجاز: {stats.score}%
              </span>
            </>
          }
          action={
            <button
              type="button"
              onClick={onAdd}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-on-primary shadow-elevation-1 transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] md:h-10"
            >
              <Plus size={14} />
              مهمة جديدة
            </button>
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
                  aria-label="بحث عن مهمة"
                  placeholder="ابحث في المهام..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 md:h-10"
                />
              </div>
              <FilterDropdown
                value={filterStatus}
                items={statusFilters.map((f) => ({ key: f.value, label: f.label }))}
                onChange={(v) => onFilterStatusChange(v as StatusFilter)}
                className="w-32"
              />
            </div>
          }
        />
      </div>

      {/* Colored stat cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {cards.map((card, i) => (
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
