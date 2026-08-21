import { Plus, Users, BookOpen, DollarSign, ChevronLeft } from 'lucide-react'
import { cn } from '../../../../lib/utils'

interface TeachersPageHeaderProps {
  totalTeachers: number
  uniqueSubjects: number
  averagePrice: number
  showAddForm: boolean
  onToggleForm: () => void
  totalStudents?: number // Added for the Students stat in the image
}

export const TeachersPageHeader = ({
  totalTeachers,
  uniqueSubjects,
  averagePrice,
  showAddForm,
  onToggleForm,
  totalStudents = 3, // Default fallback
}: TeachersPageHeaderProps) => (
  <div className="space-y-4">
    {/* Header row */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
          <Users size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="font-outfit text-xl font-black text-main">إدارة المعلمات</h1>
          <p className="text-xs font-medium text-muted">{totalTeachers} معلمة نشطة</p>
        </div>
      </div>
      <button
        onClick={onToggleForm}
        className={cn(
          'flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold shadow-sm transition-all active:scale-[0.97]',
          showAddForm
            ? 'border border-border bg-surface text-main hover:bg-hover'
            : 'bg-primary text-on-primary hover:bg-primary-hover',
        )}
      >
        <Plus size={16} className={cn(showAddForm && "rotate-45 transition-transform")} />
        {showAddForm ? 'إلغاء' : 'إضافة معلمة'}
      </button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-3 gap-3">
      {/* Total Teachers */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
        <p className="mb-2 text-xs font-bold text-main">عدد المعلمات</p>
        <div className="flex w-full items-center justify-center gap-3">
          <span className="font-outfit text-2xl font-black text-primary">{totalTeachers}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
            <Users size={16} className="text-primary" />
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted">معلمة نشطة</p>
      </div>

      {/* Unique Subjects */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
        <p className="mb-2 text-xs font-bold text-main">عدد التخصصات</p>
        <div className="flex w-full items-center justify-center gap-3">
          <span className="font-outfit text-2xl font-black text-primary">{uniqueSubjects}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
            <BookOpen size={16} className="text-primary" />
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted">تخصصات مختلفة</p>
      </div>

      {/* Average Price */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
        <p className="mb-2 text-xs font-bold text-main">متوسط السعر</p>
        <div className="flex w-full items-center justify-center gap-2">
          <div className="flex items-baseline gap-1">
            <span className="font-outfit text-2xl font-black text-warning">{averagePrice}</span>
            <span className="text-xs font-bold text-warning">ج.م</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-soft">
            <DollarSign size={16} className="text-warning" />
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted">ج.م / حصة</p>
      </div>
    </div>

    {/* Users Summary Row */}
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-2 shadow-sm">
      <div className="flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-surface">
        <ChevronLeft size={16} className="text-muted" />
        <div className="flex flex-1 items-center justify-end gap-3 pe-4">
          <div className="text-end">
            <div className="font-outfit text-lg font-black text-primary">{totalTeachers}</div>
            <div className="text-[10px] font-bold text-muted">المعلمات</div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <Users size={18} className="text-primary" />
          </div>
        </div>
      </div>
      <div className="flex cursor-pointer items-center justify-between rounded-xl bg-success-soft p-3 transition-colors hover:bg-success-soft/80">
        <ChevronLeft size={16} className="text-muted" />
        <div className="flex flex-1 items-center justify-end gap-3 pe-4">
          <div className="text-end">
            <div className="font-outfit text-lg font-black text-success">{totalStudents}</div>
            <div className="text-[10px] font-bold text-muted">الطلاب</div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/20">
            <Users size={18} className="text-success" />
          </div>
        </div>
      </div>
    </div>
  </div>
)
