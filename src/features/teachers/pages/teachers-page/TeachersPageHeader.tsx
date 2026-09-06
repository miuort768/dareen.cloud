import { motion } from 'framer-motion'
import { Plus, X, Users, BookOpen, DollarSign } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { MobilePageHeader } from '../../../../shared/components/mobile'

interface TeachersPageHeaderProps {
  totalTeachers: number
  uniqueSubjects: number
  averagePrice: number
  showAddForm: boolean
  onToggleForm: () => void
  totalStudents?: number
}

const HERO_STATS = [
  { key: 'teachers', icon: Users, tone: 'bg-primary-soft', text: 'text-primary' },
  { key: 'subjects', icon: BookOpen, tone: 'bg-success-soft', text: 'text-success' },
  { key: 'price', icon: DollarSign, tone: 'bg-warning-soft', text: 'text-warning' },
]

export const TeachersPageHeader = ({
  totalTeachers,
  uniqueSubjects,
  averagePrice,
  showAddForm,
  onToggleForm,
}: TeachersPageHeaderProps) => {
  const statValues: Record<string, string> = {
    teachers: String(totalTeachers),
    subjects: String(uniqueSubjects),
    price: `${averagePrice.toLocaleString()} ج.م`,
  }
  const statLabels: Record<string, string> = {
    teachers: 'عدد المعلمات',
    subjects: 'عدد التخصصات',
    price: 'متوسط السعر',
  }

  return (
    <>
      {/* ====== DESKTOP (md+): clean hero card ====== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative hidden overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm md:block md:p-6"
      >
        <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="bg-accent/10 pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                <Users size={20} className="text-on-primary" />
              </div>
              <div>
                <h1 className="text-lg font-black text-main">إدارة المعلمات</h1>
                <p className="text-[11px] font-bold text-muted">{totalTeachers} معلمة نشطة</p>
              </div>
            </div>
            <button
              onClick={onToggleForm}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[11px] font-black outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
                showAddForm
                  ? 'border border-border bg-surface text-main hover:bg-hover'
                  : 'bg-primary text-on-primary shadow-md shadow-primary/25 hover:bg-primary-hover',
              )}
            >
              {showAddForm ? <X size={13} /> : <Plus size={13} />}
              {showAddForm ? 'إلغاء' : 'إضافة معلمة'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {HERO_STATS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary/20"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-black tabular-nums text-main">
                      {statValues[item.key]}
                    </span>
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg',
                        item.tone,
                        item.text,
                      )}
                    >
                      <Icon size={13} />
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-muted">{statLabels[item.key]}</p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* ====== MOBILE (< md) ====== */}
      <div className="space-y-3 px-1 md:hidden">
        <MobilePageHeader
          title="إدارة المعلمات"
          subtitle={`${totalTeachers} معلمة نشطة`}
          icon={<Users size={20} />}
          action={
            <button
              onClick={onToggleForm}
              className={cn(
                'flex h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
                showAddForm
                  ? 'border border-border bg-surface text-main'
                  : 'bg-primary text-on-primary shadow-md shadow-primary/25',
              )}
            >
              {showAddForm ? <X size={15} /> : <Plus size={15} />}
              {showAddForm ? 'إلغاء' : 'إضافة'}
            </button>
          }
        />

        {/* 3 soft stat cards */}
        <div className="grid grid-cols-3 gap-2">
          {HERO_STATS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.key}
                className={cn(
                  'flex flex-col items-center rounded-2xl border p-3 text-center',
                  item.tone,
                  'border-border',
                )}
              >
                <span
                  className={cn(
                    'mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-card',
                    item.text,
                  )}
                >
                  <Icon size={14} />
                </span>
                <span className={cn('text-xl font-black tabular-nums', item.text)}>
                  {statValues[item.key]}
                </span>
                <p className="mt-1 text-[10px] font-bold text-muted">{statLabels[item.key]}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
