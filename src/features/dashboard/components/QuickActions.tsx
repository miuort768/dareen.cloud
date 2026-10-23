import { MessageCircle, CalendarDays, MessagesSquare, Wallet, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { DashboardSectionHead } from './DashboardSectionHead'

interface QuickActionsProps {
  showQuickLinks?: boolean
  withHeader?: boolean
}

const actions = [
  {
    title: 'الدفعات',
    subtitle: 'المستحقات المالية',
    icon: Wallet,
    href: '/teacher-payment-history',
    iconTone: 'bg-warning-soft text-warning-strong',
    borderTone: 'hover:border-warning',
  },
  {
    title: 'الدردشة',
    subtitle: 'محادثات الطلاب',
    icon: MessageCircle,
    href: '/chat',
    iconTone: 'bg-primary-soft text-primary',
    borderTone: 'hover:border-primary',
  },
  {
    title: 'المنتدى',
    subtitle: 'المجتمع التعليمي',
    icon: MessagesSquare,
    href: '/forum',
    iconTone: 'bg-success-soft text-success-strong',
    borderTone: 'hover:border-success',
  },
  {
    title: 'الجدول',
    subtitle: 'المواعيد الأسبوعية',
    icon: CalendarDays,
    href: '/schedule',
    iconTone: 'bg-info-soft text-info-strong',
    borderTone: 'hover:border-info',
  },
]

export const QuickActions = ({ showQuickLinks = true, withHeader = true }: QuickActionsProps) => {
  const navigate = useNavigate()

  if (!showQuickLinks) return null

  return (
    <div className="flex h-full flex-col justify-between" role="group" aria-label="إجراءات سريعة">
      {withHeader && (
        <DashboardSectionHead
          icon={Zap}
          title="إجراءات سريعة"
          description="روابط مباشرة لأهم الأدوات والصفحات"
          tone="primary"
        />
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon
          return (
            <button
              key={`action-${i}`}
              type="button"
              onClick={() => navigate(action.href)}
              aria-label={action.title}
              className={cn(
                'group relative flex min-h-[58px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-2.5 text-center transition-all duration-normal',
                'shadow-elevation-1 hover:-translate-y-0.5 hover:bg-surface hover:shadow-elevation-2',
                action.borderTone,
                'outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]',
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-normal group-hover:scale-110',
                  action.iconTone,
                )}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <span className="block truncate text-xs font-black text-main">{action.title}</span>
                <span className="hidden text-[10px] font-medium text-muted sm:line-clamp-1">
                  {action.subtitle}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
