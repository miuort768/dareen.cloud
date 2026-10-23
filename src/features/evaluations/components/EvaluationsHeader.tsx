import { Award, Plus, X, Search, Users, Star, UserCheck, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
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

const filterItems = [
  { key: '', label: 'الكل' },
  { key: 'evaluated', label: 'تم تقييمهم' },
  { key: 'not-evaluated', label: 'غير مقيمين' },
  { key: 'highest-xp', label: 'الأعلى XP' },
  { key: 'lowest-xp', label: 'الأقل XP' },
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
        className="dark:border dark:border-primary/30 dark:from-card dark:via-surface dark:to-card"
        end={
          <div className="flex w-full max-w-md flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 backdrop-blur-sm dark:border-primary/30 dark:bg-card"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/15 dark:bg-primary/20">
                      <item.icon size={11} className="text-on-primary" />
                    </span>
                    <span className="truncate text-sm font-black tabular-nums leading-none text-on-primary">
                      {item.value}
                    </span>
                  </div>
                  <p className="truncate text-micro font-medium text-white/80 dark:text-white/90">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* Toolbar — بحث + قائمة منسدلة عادية مألوفة + زر الإضافة */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-2xl border border-border bg-surface p-3 shadow-elevation-1 backdrop-blur-md dark:bg-card md:p-4"
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
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 ps-9 text-xs font-bold text-main outline-none transition-all placeholder:font-medium placeholder:text-dim hover:border-primary/40 focus:border-primary focus-visible:ring-2 focus-visible:ring-focus dark:bg-surface"
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
          <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-2">
            {/* القائمة المنسدلة العادية المألوفة */}
            <div className="relative w-full sm:w-56">
              <select
                aria-label="تصفية حسب الحالة"
                value={filterStatus}
                onChange={(e) => onFilterStatusChange(e.target.value)}
                className="shadow-xs h-10 w-full cursor-pointer appearance-none rounded-xl border border-border bg-card pe-8 ps-3 text-xs font-bold text-main outline-none transition-all hover:border-primary focus:border-primary focus-visible:ring-2 focus-visible:ring-focus dark:bg-surface"
              >
                {filterItems.map((item) => (
                  <option
                    key={item.key}
                    value={item.key}
                    className="bg-card py-1.5 font-bold text-main dark:bg-surface"
                  >
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
            <div className="hidden items-center justify-between gap-2 sm:justify-start lg:flex">
              <div className="shadow-xs flex h-10 items-center gap-1 rounded-xl border border-primary/20 bg-primary-soft px-3 dark:bg-primary/10">
                <Award size={12} className="text-primary" />
                <span className="text-xs font-black tabular-nums text-primary">
                  {stats.totalXP.toLocaleString()}
                </span>
                <span className="text-micro font-black text-primary">XP</span>
              </div>
              {showAddButton && (
                <button
                  onClick={onAddClick}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-on-primary shadow-button transition-all hover:bg-primary-hover hover:shadow-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                >
                  <Plus size={13} /> تقييم
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
