import { Plus, Search, ListTodo, Clock, RefreshCcw, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { StatCard } from '../../../shared/components/ui'
import type { StatCardProps } from '../../../shared/components/ui'
import {
  OverviewHero,
  OverviewSearchFilter,
  OverviewCategoryPills,
  MobileMetricGrid,
  type OverviewCategoryItem,
} from '../../../shared/components/mobile'
import { GradientHeroCard } from '../../../shared/components/GradientHeroCard'
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
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'معلقة' },
  { value: 'in-progress', label: 'جارية' },
  { value: 'completed', label: 'مكتملة' },
]

const ADD_BUTTON =
  'flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-4.5 py-2.5 text-xs font-medium text-on-primary shadow-elevation-2 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-3 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]'

interface TasksStat {
  title: string
  value: number
  icon: StatCardProps['icon']
  variant: NonNullable<StatCardProps['variant']>
}

/**
 * Colored stat-card hero — بنفس لغة صفحة «أبنائي» (ParentsHeader):
 * الهاتف: MobilePageHeader + مستطيل إحصائي واحد مدمج.
 * الكمبيوتر: هيرو متدرج (GradientHeroCard) + شريط أدوات + شبكة 4 بطاقات.
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
    { title: 'إجمالي المهام', value: stats.total, icon: ListTodo, variant: 'primary' },
    { title: 'معلقة', value: stats.pending, icon: Clock, variant: 'warning' },
    { title: 'قيد التنفيذ', value: stats.inProgress, icon: RefreshCcw, variant: 'info' },
    { title: 'تم الإنجاز', value: stats.completed, icon: CheckCircle2, variant: 'success' },
  ]

  const heroTiles = [
    { title: 'إجمالي المهام', value: stats.total, icon: ListTodo },
    { title: 'نسبة الإنجاز', value: `${stats.score}%`, icon: CheckCircle2 },
  ]

  const mobileCategories: OverviewCategoryItem[] = [
    { id: 'all', label: 'الكل', count: stats.total },
    { id: 'pending', label: 'معلقة', count: stats.pending },
    { id: 'in-progress', label: 'جارية', count: stats.inProgress },
    { id: 'completed', label: 'مكتملة', count: stats.completed },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4 md:space-y-5"
    >
      {/* ================= الهاتف (بنفس أسلوب TeacherDashboardMobile) ================= */}
      <div className="space-y-4 md:hidden">
        <OverviewHero
          badge="إدارة المهام"
          badgeIcon={<ListTodo size={12} className="text-primary" />}
          title="المهام والطلبات"
          subtitle="إدارة وتكليف ومتابعة المهام اليومية بكل وضوح"
          metric={{
            value: `${stats.score}%`,
            label: 'نسبة الإنجاز',
          }}
          chips={[
            { label: 'معلقة', value: stats.pending },
            { label: 'مكتملة', value: stats.completed },
          ]}
          ctaText="إضافة مهمة"
          onCtaClick={onAdd}
          illustration={
            <div className="backdrop-blur-xs relative flex h-24 w-24 items-center justify-center rounded-[24px] border border-primary/25 bg-gradient-to-br from-primary/20 via-primary/10 to-surface p-3 text-primary shadow-elevation-2">
              <div className="absolute inset-1 rounded-[20px] border border-dashed border-primary/30" />
              <ListTodo size={42} strokeWidth={2} className="drop-shadow-xs" />
            </div>
          }
        />

        <OverviewSearchFilter
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="ابحث في المهام..."
        />

        <OverviewCategoryPills
          categories={mobileCategories}
          activeId={filterStatus}
          onSelect={(id) => onFilterStatusChange(id as StatusFilter)}
        />

        <MobileMetricGrid
          metrics={[
            {
              title: 'إجمالي المهام',
              value: stats.total,
              icon: ListTodo,
              tone: 'primary',
              onClick: () => onFilterStatusChange('all'),
            },
            {
              title: 'معلقة',
              value: stats.pending,
              icon: Clock,
              tone: 'warning',
              onClick: () => onFilterStatusChange('pending'),
            },
            {
              title: 'قيد التنفيذ',
              value: stats.inProgress,
              icon: RefreshCcw,
              tone: 'info',
              onClick: () => onFilterStatusChange('in-progress'),
            },
            {
              title: 'تم الإنجاز',
              value: stats.completed,
              icon: CheckCircle2,
              tone: 'success',
              onClick: () => onFilterStatusChange('completed'),
            },
          ]}
        />
      </div>

      {/* ================= الكمبيوتر ================= */}
      <div className="hidden md:block md:space-y-4">
        <GradientHeroCard
          icon={ListTodo}
          title="المهام والطلبات"
          subtitle="إدارة وتكليف المهام للمعلمات"
          end={
            <div className="grid w-full grid-cols-2 gap-2 lg:w-72">
              {heroTiles.map((tile) => (
                <div
                  key={tile.title}
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/15">
                      <tile.icon size={11} className="text-on-primary" />
                    </span>
                    <span className="truncate text-sm font-medium tabular-nums leading-none text-on-primary">
                      {tile.value}
                    </span>
                  </div>
                  <p className="truncate text-micro font-medium text-white/80">{tile.title}</p>
                </div>
              ))}
            </div>
          }
        />

        {/* شريط الأدوات */}
        <div className="rounded-2xl border border-border bg-card p-3 shadow-elevation-1 md:p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-sm">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                aria-label="بحث عن مهمة"
                placeholder="ابحث في المهام..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-normal text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {statusFilters.map((f) => {
                const active = filterStatus === f.value
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => onFilterStatusChange(f.value as StatusFilter)}
                    aria-pressed={active}
                    className={cn(
                      'whitespace-nowrap rounded-full px-3.5 py-1.5 text-micro font-normal transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                      active
                        ? 'bg-primary text-on-primary shadow-elevation-1'
                        : 'border border-border bg-card text-muted hover:border-primary/20 hover:text-main',
                    )}
                  >
                    {f.label}
                  </button>
                )
              })}
              <button type="button" onClick={onAdd} className={cn('h-10 lg:ms-auto', ADD_BUTTON)}>
                <Plus size={14} />
                مهمة جديدة
              </button>
            </div>
          </div>
        </div>

        {/* شبكة 4 بطاقات (كمبيوتر فقط) */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </div>
    </motion.div>
  )
}
