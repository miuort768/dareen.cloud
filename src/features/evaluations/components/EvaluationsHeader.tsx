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
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-elevation-1 md:p-5"
    >
      {/* زخارف خلفية ناعمة — لمسة عمق بلا تدرجات صارخة */}
      <div
        className="pointer-events-none absolute -end-12 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -start-12 h-44 w-44 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-4">
        {/* Title Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 md:h-11 md:w-11">
              <Award size={19} className="text-on-primary" />
            </div>
            <div>
              <h1 className="text-base font-black leading-tight text-main md:text-lg">
                تقييم الطلاب
              </h1>
              <p className="text-micro font-medium text-muted">{stats.totalStudents} طالب مسجل</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* شارة XP — بنفسجية هادئة في الوضعين (بلا أصفر ليليًا) */}
            <div className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary-soft px-2.5 py-1.5 dark:bg-primary/10">
              <Award size={11} className="text-primary" />
              <span className="text-xs font-bold tabular-nums text-primary">
                {stats.totalXP.toLocaleString()}
              </span>
              <span className="text-micro font-black text-primary">XP</span>
            </div>
            {showAddButton && (
              <button
                onClick={onAddClick}
                className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 md:h-10"
              >
                <Plus size={11} /> تقييم
              </button>
            )}
          </div>
        </div>

        {/* Stats Chips */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {[
            {
              icon: Users,
              value: stats.totalStudents,
              label: 'إجمالي الطلاب',
              tone: 'bg-primary-soft dark:bg-primary/10',
              text: 'text-primary',
              wide: false,
            },
            {
              icon: UserCheck,
              value: stats.evaluatedCount,
              label: 'تم تقييمهم',
              tone: 'bg-success-soft',
              text: 'text-success-strong',
              wide: false,
            },
            {
              icon: UserX,
              value: stats.notEvaluatedCount,
              label: 'غير مقيمين',
              tone: 'bg-hover',
              text: 'text-muted',
              wide: false,
            },
            {
              icon: Star,
              value: stats.avgRating,
              label: 'متوسط التقييم',
              tone: 'bg-info-soft',
              text: 'text-info-strong',
              wide: false,
            },
            {
              icon: TrendingUp,
              value: stats.totalXP.toLocaleString(),
              label: 'إجمالي XP',
              tone: 'bg-primary-soft dark:bg-primary/10',
              text: 'text-primary',
              wide: true,
            },
          ].map((item, i) => (
            <div
              key={i}
              className={cn(
                'rounded-xl border border-border bg-surface p-2.5 transition-colors hover:border-primary/30',
                item.wide && 'col-span-2 sm:col-span-1',
              )}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md',
                    item.tone,
                  )}
                >
                  <item.icon size={11} className={item.text} />
                </span>
                <span className="truncate text-sm font-black tabular-nums text-main">
                  {item.value}
                </span>
              </div>
              <p className="text-micro font-medium text-muted">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-2 md:flex-row">
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
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => onFilterStatusChange(f.value)}
                aria-pressed={filterStatus === f.value}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  filterStatus === f.value
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border border-border bg-surface font-medium text-muted hover:bg-hover hover:text-main',
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
