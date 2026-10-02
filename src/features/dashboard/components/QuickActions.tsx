import { MessageCircle, CalendarDays, MessagesSquare, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  showQuickLinks?: boolean
}

const actions = [
  {
    title: 'الدفعات',
    subtitle: 'متابعة مستحقاتك وفواتيرك',
    icon: Wallet,
    href: '/teacher-payment-history',
    tone: 'bg-success-soft text-success-strong',
  },
  {
    title: 'الدردشة',
    subtitle: 'تواصل مع الطلاب وأولياء الأمور',
    icon: MessageCircle,
    href: '/chat',
    tone: 'bg-primary-soft text-primary',
  },
  {
    title: 'المنتدى',
    subtitle: 'ناقش وانشر في المجتمع',
    icon: MessagesSquare,
    href: '/forum',
    tone: 'bg-success-soft text-success-strong',
  },
  {
    title: 'الجدول',
    subtitle: 'عرض الحصص القادمة',
    icon: CalendarDays,
    href: '/schedule',
    tone: 'bg-info-soft text-info-strong',
  },
]

/**
 * Single grid for every breakpoint.
 * The two-markup variants (hidden md:block + md:hidden) used to ship the same
 * four actions twice in the DOM and put a bordered card inside the rail SectionCard.
 * Tiles now carry only a soft surface fill, so the rail card stays the single chrome.
 */
export const QuickActions = ({ showQuickLinks = true }: QuickActionsProps) => {
  const navigate = useNavigate()

  if (!showQuickLinks) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <motion.button
            key={`action-${i}`}
            type="button"
            onClick={() => navigate(action.href)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="group flex flex-col items-center gap-3 rounded-xl bg-surface p-4 text-center outline-none transition-colors duration-normal hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                action.tone,
                'transition-transform duration-normal group-hover:scale-105',
              )}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black leading-tight text-main">{action.title}</h3>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">{action.subtitle}</p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
