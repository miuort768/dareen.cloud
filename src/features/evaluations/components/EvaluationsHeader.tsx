import { Award, Plus, X, Search, Users, Star, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { GradientHeroCard } from '../../../shared/components/GradientHeroCard'

interface Stats {
  totalStudents: number
  evaluatedCount: number
  notEvaluatedCount: number
  avgRating: string
  totalXP: number
}

interface EvaluationsHeaderProps {
  stats: Stats
  showAddButton: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: string
  onFilterStatusChange: (value: string) => void
  onAddClick: () => void
}

const filters = [
  { value: '', label: 'الكل' },
  { value: 'evaluated', label: 'تم تقييمهم' },
  { value: 'not-evaluated', label: 'غير مقيمين' },
  { value: 'highest-xp', label: 'الأعلى XP' },
  { value: 'lowest-xp', label: 'الأقل XP' },
]

export const EvaluationsHeader = ({
  stats,
  showAddButton,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onAddClick,
}: EvaluationsHeaderProps) => {
  const heroStats = [
    { icon: Users, value: stats.totalStudents, label: 'إجمالي الطلاب' },
    { icon: UserCheck, value: stats.evaluatedCount, label: 'تم تقييمهم' },
    { icon: Star, value: stats.avgRating, label: 'متوسط التقييم' },
  ]

  return (
    <div className="space-y-3 md:space-y-4">
      <GradientHeroCard
        icon={Award}
        title="تقييم الطلاب"
        subtitle={`${stats.totalStudents} طالب مسجل`}
        end={
          <div className="flex w-full max-w-md flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 backdrop-blur-sm"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/15">
                      <item.icon size={11} className="text-on-primary" />
                    </span>
                    <span className="truncate text-sm font-black tabular-nums leading-none text-on-primary">
                      {item.value}
                    </span>
                  </div>
                  <p className="truncate text-micro font-medium text-white/80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* Toolbar — بحث + فلاتر + زر الإضافة */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-elevation-1 md:p-4"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="text"
              aria-label="بحث عن طالب"
              placeholder="ابحث بالاسم أو الصف..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 ps-9 text-xs font-bold text-main outline-none transition-all placeholder:font-medium placeholder:text-dim focus:border-primary focus-visible:ring-2 focus-visible:ring-focus"
            />
            {searchTerm && (
              <button
                aria-label="مسح البحث"
                onClick={() => onSearchChange('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 items-center gap-1 rounded-lg border border-primary/20 bg-primary-soft px-2.5 dark:bg-primary/10">
              <Award size={11} className="text-primary" />
              <span className="text-xs font-bold tabular-nums text-primary">
                {stats.totalXP.toLocaleString()}
              </span>
              <span className="text-micro font-black text-primary">XP</span>
            </div>
            {showAddButton && (
              <button
                onClick={onAddClick}
                className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 md:h-10"
              >
                <Plus size={11} /> تقييم
              </button>
            )}
          </div>
        </div>
        <div className="no-scrollbar mt-2.5 flex items-center gap-1.5 overflow-x-auto md:mt-3">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterStatusChange(f.value)}
              aria-pressed={filterStatus === f.value}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                filterStatus === f.value
                  ? 'bg-primary text-on-primary shadow-elevation-1'
                  : 'border border-border bg-surface font-medium text-muted hover:bg-hover hover:text-main',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
