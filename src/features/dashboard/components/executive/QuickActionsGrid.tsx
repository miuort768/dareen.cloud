import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, UserCheck, Receipt, ListTodo, Megaphone, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const QUICK_ACTIONS = [
  {
    label: 'طالب جديد',
    icon: UserPlus,
    color: 'text-primary',
    bg: 'bg-primary-soft',
    path: '/students',
  },
  {
    label: 'تسجيل حضور',
    icon: UserCheck,
    color: 'text-success',
    bg: 'bg-success-soft',
    path: '/attendance',
  },
  {
    label: 'الفواتير',
    icon: Receipt,
    color: 'text-warning',
    bg: 'bg-warning-soft',
    path: '/student-invoices',
  },
  { label: 'المهام', icon: ListTodo, color: 'text-info', bg: 'bg-info-soft', path: '/tasks' },
  {
    label: 'إعلان جديد',
    icon: Megaphone,
    color: 'text-primary',
    bg: 'bg-primary-soft',
    path: '/announcements',
  },
  { label: 'التقارير', icon: FileText, color: 'text-muted', bg: 'bg-surface', path: '/reports' },
]

export const QuickActionsGrid = memo(function QuickActionsGrid() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-3 gap-2.5 font-dash sm:grid-cols-6" dir="rtl">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 outline-none transition-all duration-200 hover:border-border-strong hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            title={action.label}
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110',
                action.bg,
              )}
            >
              <Icon size={18} strokeWidth={1.9} className={action.color} />
            </span>
            <span className="text-[10px] font-bold leading-tight text-muted transition-colors group-hover:text-main">
              {action.label}
            </span>
          </button>
        )
      })}
    </div>
  )
})
