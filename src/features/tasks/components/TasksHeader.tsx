import { Plus, Search, ListTodo, Clock, RefreshCcw, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { StatCard } from '../../../shared/components/ui'
import type { StatCardProps } from '../../../shared/components/ui'
import { MobilePageHeader } from '../../../shared/components/mobile/MobilePageHeader'
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
  'flex items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-on-primary shadow-elevation-2 shadow-black/20 transition-all duration-normal hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]'

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

  const mobileStats: {
    title: string
    value: number
    icon: typeof ListTodo
    fill: string
    on: string
  }[] = [
    {
      title: 'إجمالي المهام',
      value: stats.total,
      icon: ListTodo,
      fill: 'bg-primary',
      on: 'text-on-primary',
    },
    {
      title: 'معلقة',
      value: stats.pending,
      icon: Clock,
      fill: 'bg-warning',
      on: 'text-on-warning',
    },
    {
      title: 'قيد التنفيذ',
      value: stats.inProgress,
      icon: RefreshCcw,
      fill: 'bg-info',
      on: 'text-on-info',
    },
    {
      title: 'تم الإنجاز',
      value: stats.completed,
      icon: CheckCircle2,
      fill: 'bg-success',
      on: 'text-on-success',
    },
  ]

  const heroTiles = [
    { title: 'إجمالي المهام', value: stats.total, icon: ListTodo },
    { title: 'نسبة الإنجاز', value: `${stats.score}%`, icon: CheckCircle2 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4 md:space-y-5"
    >
      {/* ================= الهاتف ================= */}
      <div className="md:hidden">
        <MobilePageHeader
          title="المهام والطلبات"
          subtitle="إدارة وتكليف المهام للمعلمات"
          icon={<ListTodo size={20} />}
          action={
            <button type="button" onClick={onAdd} className={cn('h-11', ADD_BUTTON)}>
              <Plus size={14} />
              إضافة
            </button>
          }
        />
        <div className="mt-1 flex flex-col gap-2">
          <div className="relative w-full">
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
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value as StatusFilter)}
            aria-label="تصفية المهام حسب الحالة"
            className="h-11 w-full cursor-pointer rounded-xl border border-border bg-surface ps-3.5 text-xs font-bold text-main outline-none transition-all duration-normal hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
          >
            {statusFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* مستطيل إحصائي واحد مدمج (هاتف فقط) — أربعة ألوان متمايزة */}
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-elevation-2">
          {mobileStats.map((item) => (
            <div key={item.title} className={cn('flex items-center gap-2.5 p-3', item.fill)}>
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-inset ring-white/15',
                  item.on,
                )}
              >
                <item.icon size={16} />
              </span>
              <div className="min-w-0">
                <p
                  className={cn('font-dash text-lg font-black tabular-nums leading-none', item.on)}
                >
                  {item.value}
                </p>
                <p className={cn('mt-0.5 truncate text-micro font-bold opacity-80', item.on)}>
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
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
                    <span className="truncate text-sm font-black tabular-nums leading-none text-on-primary">
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
                className="h-10 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
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
                      'whitespace-nowrap rounded-full px-3.5 py-1.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
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
