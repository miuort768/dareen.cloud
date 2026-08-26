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
  { value: '', label: 'ط§ظ„ظƒظ„' },
  { value: 'evaluated', label: 'طھظ… طھظ‚ظٹظٹظ…ظ‡ظ…' },
  { value: 'not-evaluated', label: 'ط؛ظٹط± ظ…ظ‚ظٹظ…ظٹظ†' },
  { value: 'highest-xp', label: 'ط§ظ„ط£ط¹ظ„ظ‰ XP' },
  { value: 'lowest-xp', label: 'ط§ظ„ط£ظ‚ظ„ XP' },
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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-4 pt-5 md:p-6"
    >
      <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/25 ring-2 ring-white/40 md:h-10 md:w-10">
              <Award size={16} className="text-on-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-on-primary md:text-base">
                طھظ‚ظٹظٹظ… ط§ظ„ط·ظ„ط§ط¨
              </h1>
              <p className="text-micro font-medium text-white/85">{stats.totalStudents} ط·ط§ظ„ط¨</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* ط´ط§ط±ط© XP â€” ط®ظ„ظپظٹط© ظپط§طھط­ط© طµظ„ط¨ط© ظˆظ†طµ ظƒظ‡ط±ظ…ط§ظ†ظٹ ط؛ط§ظ…ظ‚ ظ…ظ‚ط±ظˆط، */}
            <div className="flex items-center gap-1 rounded-lg border border-warning bg-warning-light px-2.5 py-1.5 shadow-sm">
              <Award size={11} className="text-warning-strong" />
              <span className="text-xs font-bold tabular-nums text-warning-strong">
                {stats.totalXP.toLocaleString()}
              </span>
              <span className="text-micro font-black text-warning-strong">XP</span>
            </div>
            {showAddButton && (
              <button
                onClick={onAddClick}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-white/20 px-3 text-micro font-bold text-on-primary ring-1 ring-white/40 transition-all hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
              >
                <Plus size={11} /> طھظ‚ظٹظٹظ…
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {[
            { icon: Users, value: stats.totalStudents, label: 'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط·ظ„ط§ط¨' },
            { icon: UserCheck, value: stats.evaluatedCount, label: 'طھظ… طھظ‚ظٹظٹظ…ظ‡ظ…' },
            { icon: UserX, value: stats.notEvaluatedCount, label: 'ط؛ظٹط± ظ…ظ‚ظٹظ…ظٹظ†' },
            { icon: Star, value: stats.avgRating, label: 'ظ…طھظˆط³ط· ط§ظ„طھظ‚ظٹظٹظ…' },
            {
              icon: TrendingUp,
              value: `${stats.totalXP.toLocaleString()}`,
              label: 'ط¥ط¬ظ…ط§ظ„ظٹ XP',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/25 bg-black/10 p-3 backdrop-blur-sm"
            >
              <div className="mb-0.5 flex items-center gap-1.5">
                <item.icon size={11} className="text-white/85" />
                <span className="text-xs font-bold tabular-nums text-on-primary md:text-sm">
                  {item.value}
                </span>
              </div>
              <p className="text-micro font-medium text-white/85">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/75" />
            <input
              type="text"
              aria-label="ط¨ط­ط« ط¹ظ† ط·ط§ظ„ط¨"
              placeholder="ط§ط¨ط­ط« ط¨ط§ظ„ط§ط³ظ… ط£ظˆ ط§ظ„طµظپ..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-white/35 bg-black/15 px-3 py-2.5 ps-9 text-xs font-bold text-on-primary outline-none backdrop-blur-sm transition-all placeholder:text-white/60 focus:border-white/50 focus:bg-black/25 focus-visible:ring-2 focus-visible:ring-focus"
            />
            {searchTerm && (
              <button
                aria-label="ظ…ط³ط­ ط§ظ„ط¨ط­ط«"
                onClick={() => onSearchChange('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
                aria-pressed={filterStatus === f.value}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  filterStatus === f.value
                    ? 'bg-card text-primary shadow-elevation-1'
                    : 'border border-white/25 bg-black/10 font-medium text-white/85 hover:bg-black/20 hover:text-white',
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
