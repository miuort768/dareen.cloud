import { motion } from 'framer-motion'
import { Plus, X, Users, BookOpen, DollarSign } from 'lucide-react'
import { cn } from '../../../../lib/utils'

interface TeachersPageHeaderProps {
  totalTeachers: number
  uniqueSubjects: number
  averagePrice: number
  showAddForm: boolean
  onToggleForm: () => void
  totalStudents?: number
}

export const TeachersPageHeader = ({
  totalTeachers,
  uniqueSubjects,
  averagePrice,
  showAddForm,
  onToggleForm,
}: TeachersPageHeaderProps) => (
  <>
    {/* ====== DESKTOP (md+): original gradient banner ====== */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative hidden overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 shadow-xl md:block md:p-6"
    >
      <div className="absolute inset-0 opacity-[0.06]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tch-hero-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-on-primary md:text-lg">
                إدارة المعلمات
              </h1>
              <p className="text-[11px] font-bold text-white/80">
                {totalTeachers} معلمة نشطة
              </p>
            </div>
          </div>
          <button
            onClick={onToggleForm}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[11px] font-black shadow-lg transition-all active:scale-[0.97]',
              showAddForm
                ? 'bg-white/25 text-white hover:bg-white/35'
                : 'bg-white text-primary shadow-primary/20 hover:bg-white/95 dark:bg-accent dark:text-on-accent dark:hover:bg-accent-hover',
            )}
          >
            {showAddForm ? <X size={13} /> : <Plus size={13} />}
            {showAddForm ? 'إلغاء' : 'إضافة معلمة'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              icon: Users,
              value: totalTeachers,
              label: 'عدد المعلمات',
              box: 'border-white/10 bg-white/10',
            },
            {
              icon: BookOpen,
              value: uniqueSubjects,
              label: 'عدد التخصصات',
              box: 'bg-success-soft',
            },
            {
              icon: DollarSign,
              value: `${averagePrice.toLocaleString()} ج.م`,
              label: 'متوسط السعر',
              box: 'bg-warning-soft',
            },
          ].map((item, i) => (
            <div key={i} className={cn('rounded-xl border p-3 backdrop-blur-sm', item.box)}>
              <div className="mb-0.5 flex items-center gap-1.5">
                <item.icon size={12} className="text-white/80" />
                <span className="text-sm font-black tabular-nums text-white">
                  {item.value}
                </span>
              </div>
              <p className="text-[9px] font-bold text-white/70">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>

    {/* ====== MOBILE (< md): colored gradient stat cards ====== */}
    <div className="space-y-3 md:hidden">
      {/* Title + add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-outfit text-lg font-black text-main">إدارة المعلمات</h1>
            <p className="text-[11px] text-muted">{totalTeachers} معلمة نشطة</p>
          </div>
        </div>
        <button
          onClick={onToggleForm}
          className={cn(
            'flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-all active:scale-[0.97]',
            showAddForm ? 'border border-border bg-surface text-main' : 'bg-primary text-on-primary',
          )}
        >
          {showAddForm ? <X size={15} /> : <Plus size={15} />}
          {showAddForm ? 'إلغاء' : 'إضافة'}
        </button>
      </div>

      {/* 3 colored stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep p-3 text-center shadow-md shadow-primary/25">
          <p className="mb-2 text-[10px] font-bold text-on-primary">عدد المعلمات</p>
          <div className="flex items-center gap-1.5">
            <span className="font-outfit text-xl font-black tabular-nums text-on-primary">
              {totalTeachers}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <Users size={13} className="text-on-primary" />
            </div>
          </div>
          <p className="mt-1.5 text-[9px] font-medium text-white/70">معلمة نشطة</p>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-success to-success-dark p-3 text-center shadow-md shadow-success">
          <p className="mb-2 text-[10px] font-bold text-on-success">عدد التخصصات</p>
          <div className="flex items-center gap-1.5">
            <span className="font-outfit text-xl font-black tabular-nums text-on-success">
              {uniqueSubjects}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <BookOpen size={13} className="text-on-success" />
            </div>
          </div>
          <p className="mt-1.5 text-[9px] font-medium text-white/70">تخصصات مختلفة</p>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-warning to-warning-dark p-3 text-center shadow-md shadow-warning">
          <p className="mb-2 text-[10px] font-bold text-on-warning">متوسط السعر</p>
          <div className="flex items-center gap-1">
            <span className="font-outfit text-xl font-black tabular-nums text-on-warning">
              {averagePrice}
            </span>
            <span className="text-[10px] font-bold text-on-warning">ج.م</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <DollarSign size={13} className="text-on-warning" />
            </div>
          </div>
          <p className="mt-1.5 text-[9px] font-medium text-white/70">ج.م / حصة</p>
        </div>
      </div>
    </div>
  </>
)
