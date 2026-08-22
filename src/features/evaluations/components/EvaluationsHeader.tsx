import { Award, Plus, X, Search, Users, Star, TrendingUp, UserCheck, UserX } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-4 pt-5 md:p-6 dark:from-primary dark:via-primary-deep dark:to-primary-hover"
    >
      <div className="absolute inset-0 opacity-[0.06]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="eval-hero-grid"
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
          <rect width="100%" height="100%" fill="url(#eval-hero-grid)" />
        </svg>
      </div>
      <div className="relative z-10 space-y-4 p-4 md:p-5">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30 md:h-10 md:w-10">
              <Award size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-on-primary md:text-base">تقييم الطلاب</h1>
              <p className="text-[10px] text-white/70 md:text-[11px]">{stats.totalStudents} طالب</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 backdrop-blur-sm">
              <Award size={11} className="text-warning" />
              <span className="text-[10px] font-bold tabular-nums text-white">
                {stats.totalXP.toLocaleString()}
              </span>
              <span className="text-[8px] text-white/50">XP</span>
            </div>
            {showAddButton && (
              <button
                onClick={onAddClick}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-white/20 px-3 text-[10px] font-bold text-white transition-all hover:bg-white/30 active:scale-95"
              >
                <Plus size={11} /> تقييم
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {[
            {
              icon: Users,
              value: stats.totalStudents,
              label: '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0637\u0644\u0627\u0628',
            },
            {
              icon: UserCheck,
              value: stats.evaluatedCount,
              label: '\u062a\u0645 \u062a\u0642\u064a\u064a\u0645\u0647\u0645',
            },
            {
              icon: UserX,
              value: stats.notEvaluatedCount,
              label: '\u063a\u064a\u0631 \u0645\u0642\u064a\u0645\u064a\u0646',
            },
            {
              icon: Star,
              value: stats.avgRating,
              label: '\u0645\u062a\u0648\u0633\u0637 \u0627\u0644\u062a\u0642\u064a\u064a\u0645',
            },
            {
              icon: TrendingUp,
              value: `${stats.totalXP.toLocaleString()}`,
              label: '\u0625\u062c\u0645\u0627\u0644\u064a XP',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm dark:border-white/10"
            >
              <div className="mb-0.5 flex items-center gap-1.5">
                <item.icon size={10} className="text-white/70" />
                <span className="text-xs font-bold tabular-nums text-white md:text-sm">
                  {item.value}
                </span>
              </div>
              <p className="text-[8px] text-white/60 md:text-[9px]">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              aria-label="بحث عن طالب"
              placeholder="ابحث بالاسم أو الصف..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-2.5 ps-9 text-[11px] font-bold text-white outline-none backdrop-blur-sm transition-all placeholder:text-white/40 focus:border-white/40 focus:bg-white/20"
            />
            {searchTerm && (
              <button
                aria-label="مسح البحث"
                onClick={() => onSearchChange('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => onFilterStatusChange(f.value)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all',
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
}
