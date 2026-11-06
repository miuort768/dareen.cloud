import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, UserCheck, Receipt, ListTodo, Megaphone, FileText, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionConfig {
  label: string
  sublabel: string
  icon: typeof UserPlus
  iconStyle: string
  iconHover: string
  path: string
}

const QUICK_ACTIONS: ActionConfig[] = [
  {
    label: 'طالب جديد',
    sublabel: 'إضافة تسجيل',
    icon: UserPlus,
    iconStyle: 'bg-primary-soft text-primary',
    iconHover: 'group-hover:bg-primary group-hover:text-on-primary',
    path: '/students',
  },
  {
    label: 'تسجيل حضور',
    sublabel: 'جلسات اليوم',
    icon: UserCheck,
    iconStyle: 'bg-success-soft text-success',
    iconHover: 'group-hover:bg-success group-hover:text-on-success',
    path: '/attendance',
  },
  {
    label: 'الفواتير',
    sublabel: 'متابعة الدفعات',
    icon: Receipt,
    iconStyle: 'bg-warning-soft text-warning',
    iconHover: 'group-hover:bg-warning group-hover:text-on-warning',
    path: '/student-invoices',
  },
  {
    label: 'المهام',
    sublabel: 'قائمة الأعمال',
    icon: ListTodo,
    iconStyle: 'bg-info-soft text-info',
    iconHover: 'group-hover:bg-info group-hover:text-on-info',
    path: '/tasks',
  },
  {
    label: 'إعلان جديد',
    sublabel: 'نشر تعميم',
    icon: Megaphone,
    iconStyle: 'bg-accent-soft text-accent',
    iconHover: 'group-hover:bg-accent group-hover:text-on-accent',
    path: '/announcements',
  },
  {
    label: 'التقارير',
    sublabel: 'الإحصاءات والمالية',
    icon: FileText,
    iconStyle: 'bg-surface text-main border border-border',
    iconHover: 'group-hover:bg-main group-hover:text-inverse group-hover:border-transparent',
    path: '/reports',
  },
]

export const QuickActionsGrid = memo(function QuickActionsGrid() {
  const navigate = useNavigate()

  return (
    <div
      className="rounded-[24px] border border-border bg-card p-4 font-dash shadow-elevation-1 sm:p-5"
      dir="rtl"
    >
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Zap size={13} />
          </span>
          <h2 className="text-xs font-semibold text-main">الإجراءات السريعة</h2>
        </div>
        <span className="text-[10px] text-muted">وصول مباشر للعمليات المتكررة</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={cn(
                'border-border/70 bg-surface/50 group relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 text-center outline-none transition-all duration-normal hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-elevation-1 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
              )}
              title={action.label}
            >
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl shadow-soft transition-all duration-normal group-hover:scale-110 group-hover:shadow-elevation-1',
                  action.iconStyle,
                  action.iconHover,
                )}
              >
                <Icon size={19} strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold text-main transition-colors duration-normal group-hover:text-primary">
                  {action.label}
                </span>
                <span className="block truncate text-[10px] text-muted">{action.sublabel}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
})
