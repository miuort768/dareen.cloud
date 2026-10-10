import { MessageCircle, CalendarDays, MessagesSquare, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  showQuickLinks?: boolean
}

const actions = [
  {
    title: 'الدفعات',
    icon: Wallet,
    href: '/teacher-payment-history',
    tone: 'bg-success-soft text-success-strong',
  },
  {
    title: 'الدردشة',
    icon: MessageCircle,
    href: '/chat',
    tone: 'bg-primary-soft text-primary',
  },
  {
    title: 'المنتدى',
    icon: MessagesSquare,
    href: '/forum',
    tone: 'bg-success-soft text-success-strong',
  },
  {
    title: 'الجدول',
    icon: CalendarDays,
    href: '/schedule',
    tone: 'bg-info-soft text-info-strong',
  },
]

/**
 * أيقونات فقط على الهاتف — أزرار دائرية بلا نص أو بطاقة جامعة.
 * يُستخدم حاليًا في شاشة الهاتف فقط (أُزيل من الديسكتوب والتابلت).
 */
export const QuickActions = ({ showQuickLinks = true }: QuickActionsProps) => {
  const navigate = useNavigate()

  if (!showQuickLinks) return null

  return (
    <div className="grid grid-cols-4 gap-3" role="group" aria-label="إجراءات سريعة">
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <button
            key={`action-${i}`}
            type="button"
            onClick={() => navigate(action.href)}
            aria-label={action.title}
            title={action.title}
            className={cn(
              'flex h-14 w-full items-center justify-center rounded-full transition-all duration-normal',
              action.tone,
              'shadow-elevation-1 outline-none hover:scale-105 focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
            )}
          >
            <Icon size={22} />
          </button>
        )
      })}
    </div>
  )
}