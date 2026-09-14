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
    color: 'text-success',
    iconBg: 'bg-success-soft',
    mobileFill: 'bg-success text-on-success',
  },
  {
    title: 'الدردشة',
    subtitle: 'تواصل مع الطلاب وأولياء الأمور',
    icon: MessageCircle,
    href: '/chat',
    color: 'text-primary',
    iconBg: 'bg-primary-soft',
    mobileFill: 'bg-primary text-on-primary',
  },
  {
    title: 'المنتدى',
    subtitle: 'ناقش وانشر في المجتمع',
    icon: MessagesSquare,
    href: '/forum',
    color: 'text-success',
    iconBg: 'bg-success-soft',
    mobileFill: 'bg-warning text-on-warning',
  },
  {
    title: 'الجدول',
    subtitle: 'عرض الحصص القادمة',
    icon: CalendarDays,
    href: '/schedule',
    color: 'text-info',
    iconBg: 'bg-info-soft',
    mobileFill: 'bg-info text-on-info',
  },
]

export const QuickActions = ({ showQuickLinks = true }: QuickActionsProps) => {
  const navigate = useNavigate()

  const handleAction = (action: (typeof actions)[number]) => {
    navigate(action.href)
  }

  const quickLinksGrid = (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <button
            key={`action-${i}`}
            onClick={() => handleAction(action)}
            className="block rounded-2xl text-start outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={cn(
                'flex h-full w-full flex-col items-center gap-3 rounded-2xl p-4 text-center',
                'border border-border bg-card dark:border-border dark:bg-card',
                'hover:border-primary/30 hover:shadow-elevation-1 dark:hover:border-border',
                'active:scale-[0.97]',
                'group transition-all duration-normal',
              )}
            >
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  action.iconBg,
                  'transition-transform duration-normal group-hover:scale-105',
                )}
              >
                <Icon size={20} className={action.color} />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight text-main">{action.title}</h3>
                <p className="mt-1 text-[10px] text-muted">{action.subtitle}</p>
              </div>
            </motion.div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="flex h-full flex-col gap-3">
      {/* روابط سريعة */}
      {showQuickLinks && (
        <>
          <div className="hidden md:block">{quickLinksGrid}</div>

          {/* أزرار موبايل — عرض كامل بدون ورقة سفلية */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {actions.map((action, i) => {
              const Icon = action.icon
              if (!showQuickLinks) return null

              return (
                <button
                  key={`action-${i}`}
                  onClick={() => handleAction(action)}
                  className="rounded-2xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl p-3.5 shadow-elevation-1',
                      action.mobileFill,
                      'group transition-all duration-normal hover:brightness-110 active:scale-[0.97]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15',
                        'transition-transform duration-normal group-hover:scale-105',
                      )}
                    >
                      <Icon size={19} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-black leading-tight">{action.title}</h3>
                    </div>
                  </motion.div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
