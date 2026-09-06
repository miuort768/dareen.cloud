import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, UserCheck, Receipt, ListTodo, Megaphone, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const QUICK_ACTIONS = [
  {
    label: 'طالب جديد',
    icon: UserPlus,
    btn: 'bg-primary text-on-primary',
    path: '/students',
  },
  {
    label: 'تسجيل حضور',
    icon: UserCheck,
    btn: 'bg-success text-on-success',
    path: '/attendance',
  },
  {
    label: 'الفواتير',
    icon: Receipt,
    btn: 'bg-warning text-on-warning',
    path: '/student-invoices',
  },
  { label: 'المهام', icon: ListTodo, btn: 'bg-info text-on-info', path: '/tasks' },
  {
    label: 'إعلان جديد',
    icon: Megaphone,
    btn: 'bg-accent text-on-accent',
    path: '/announcements',
  },
  { label: 'التقارير', icon: FileText, btn: 'bg-main text-inverse', path: '/reports' },
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
            className={cn(
              'group flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-4 outline-none transition-all duration-normal hover:opacity-90 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]',
              action.btn,
            )}
            title={action.label}
          >
            <Icon
              size={20}
              strokeWidth={1.9}
              className="transition-transform duration-normal group-hover:scale-110"
            />
            <span className="text-[10px] font-bold leading-tight">{action.label}</span>
          </button>
        )
      })}
    </div>
  )
})
