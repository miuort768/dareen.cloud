import { motion } from 'framer-motion'
import { Plus, X, Users, BookOpen, DollarSign } from 'lucide-react'
import { cn } from '../../../../lib/utils'

interface TeachersPageHeaderProps {
  totalTeachers: number
  uniqueSubjects: number
  averagePrice: number
  showAddForm: boolean
  onToggleForm: () => void
}

export const TeachersPageHeader = ({
  totalTeachers,
  uniqueSubjects,
  averagePrice,
  showAddForm,
  onToggleForm,
}: TeachersPageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 shadow-xl dark:border-amber-500/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-black md:p-6"
  >
    <div className="absolute inset-0 opacity-[0.06]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="tch-hero-grid"
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
        <rect width="100%" height="100%" fill="url(#tch-hero-grid)" />
      </svg>
    </div>
    <div className="relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30 dark:bg-amber-500/20 dark:ring-amber-500/40">
            <Users size={18} className="text-white dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-on-primary dark:text-white md:text-lg">
              إدارة المعلمات
            </h1>
            <p className="text-[11px] font-bold text-white/80 dark:text-amber-400/80">
              {totalTeachers} معلمة نشطة
            </p>
          </div>
        </div>
        <button
          onClick={onToggleForm}
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[11px] font-black shadow-lg transition-all active:scale-[0.97]',
            showAddForm
              ? 'bg-white/25 text-white hover:bg-white/35 dark:border dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-300'
              : 'bg-white text-primary shadow-amber-500/20 hover:bg-white/95 dark:bg-accent dark:text-on-accent dark:hover:bg-accent-hover',
          )}
        >
          {showAddForm ? <X size={13} /> : <Plus size={13} />}
          {showAddForm ? 'إلغاء' : 'إضافة معلمة'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Users, value: totalTeachers, label: 'عدد المعلمات' },
          { icon: BookOpen, value: uniqueSubjects, label: 'عدد التخصصات' },
          { icon: DollarSign, value: `${averagePrice.toLocaleString()} ج.م`, label: 'متوسط السعر' },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm dark:border-amber-500/30 dark:bg-zinc-900/90"
          >
            <div className="mb-0.5 flex items-center gap-1.5">
              <item.icon size={12} className="text-white/80 dark:text-amber-400" />
              <span className="text-sm font-black tabular-nums text-white dark:text-amber-300">
                {item.value}
              </span>
            </div>
            <p className="text-[9px] font-bold text-white/70 dark:text-zinc-400">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)
