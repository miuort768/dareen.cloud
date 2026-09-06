import { MessageCircle, CalendarDays, Megaphone, MessagesSquare, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  showQuickLinks?: boolean
}

const actions = [
  {
    title: 'الدردشة',
    subtitle: 'تواصل مع الطلاب وأولياء الأمور',
    icon: MessageCircle,
    href: '/chat',
    color: 'text-primary',
    iconBg: 'bg-primary-soft',
  },
  {
    title: 'المنتدى',
    subtitle: 'ناقش وانشر في المجتمع',
    icon: MessagesSquare,
    href: '/forum',
    color: 'text-success',
    iconBg: 'bg-success-soft',
  },
  {
    title: 'الجدول الأسبوعي',
    subtitle: 'عرض الحصص القادمة',
    icon: CalendarDays,
    href: '/schedule',
    color: 'text-info',
    iconBg: 'bg-info-soft',
  },
  {
    title: 'الإعلانات',
    subtitle: 'اطلع على آخر الأخبار',
    icon: Megaphone,
    href: '/announcements',
    color: 'text-warning',
    iconBg: 'bg-warning-soft',
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
                'hover:border-primary/30 hover:shadow-sm dark:hover:border-border',
                'active:scale-[0.97]',
                'group transition-all duration-200',
              )}
            >
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  action.iconBg,
                  'transition-transform duration-200 group-hover:scale-105',
                )}
              >
                <Icon size={20} className={action.color} />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight text-main dark:text-main">
                  {action.title}
                </h3>
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
                      'flex w-full items-center gap-3 rounded-2xl p-3.5',
                      'border border-border bg-card shadow-elevation-1',
                      'group transition-colors duration-200 hover:border-primary/30 active:scale-[0.97]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                        action.iconBg,
                        'transition-transform duration-200 group-hover:scale-105',
                      )}
                    >
                      <Icon size={19} className={action.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold leading-tight text-main">{action.title}</h3>
                      <p className="mt-0.5 text-[10px] font-medium text-muted">{action.subtitle}</p>
                    </div>
                    <ChevronLeft size={14} className="shrink-0 text-muted opacity-50" />
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
