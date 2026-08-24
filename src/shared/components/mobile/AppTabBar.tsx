import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Users,
  Megaphone,
  MessageSquare,
  User,
  MoreHorizontal,
  GraduationCap,
  UserCheck,
  DollarSign,
  Home,
} from 'lucide-react'
import { useCurrentUser } from '../../../context/AppContext'
import { useUnreadStore } from '../../../store/unreadStore'
import { triggerHaptic } from '../../../lib/haptics'
import { cn } from '../../../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface TabItem {
  id: string
  label: string
  icon: LucideIcon
  path: string
}

interface AppTabBarProps {
  onMore: () => void
}

const ADMIN_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, path: '/admin-dashboard' },
  { id: 'students', label: 'الطلاب', icon: GraduationCap, path: '/students' },
  { id: 'schedule', label: 'الجدول', icon: CalendarDays, path: '/schedule' },
  { id: 'finance', label: 'المالية', icon: Wallet, path: '/finance' },
]

const TEACHER_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, path: '/teacher-dashboard' },
  { id: 'schedule', label: 'الجدول', icon: CalendarDays, path: '/schedule' },
  { id: 'attendance', label: 'الحضور', icon: UserCheck, path: '/attendance' },
  { id: 'payments', label: 'الدفع', icon: DollarSign, path: '/teacher-payment-history' },
]

const PARENT_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/parent-dashboard' },
  { id: 'children', label: 'الأبناء', icon: Users, path: '/parent-students' },
  { id: 'announcements', label: 'الإعلانات', icon: Megaphone, path: '/parent-announcements' },
  { id: 'chat', label: 'المحادثة', icon: MessageSquare, path: '/chat' },
]

const STUDENT_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: GraduationCap, path: '/student-dashboard' },
  { id: 'schedule', label: 'الجدول', icon: CalendarDays, path: '/schedule' },
  { id: 'forum', label: 'المنتدى', icon: MessageSquare, path: '/forum' },
  { id: 'profile', label: 'حسابي', icon: User, path: '/student-profile' },
]

export const AppTabBar = ({ onMore }: AppTabBarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useCurrentUser()
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount)

  if (currentUser?.role === 'chat_user') return null

  const tabs =
    currentUser?.role === 'teacher'
      ? TEACHER_TABS
      : currentUser?.role === 'parent'
        ? PARENT_TABS
        : currentUser?.role === 'student'
          ? STUDENT_TABS
          : ADMIN_TABS

  const activeTabId =
    tabs.find(
      (t) =>
        location.pathname === t.path || (t.path !== '/' && location.pathname.startsWith(t.path)),
    )?.id ?? tabs[0]?.id

  const handleTab = (tab: TabItem) => {
    if (location.pathname === tab.path) return
    triggerHaptic('light')
    navigate(tab.path)
  }

  const handleMore = () => {
    triggerHaptic('light')
    onMore()
  }

  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden" aria-label="التنقل الرئيسي للهاتف">
      <div
        className="px-4 pt-1"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="border-border/60 bg-card/90 dark:bg-background/90 relative overflow-hidden rounded-[28px] border shadow-elevation-3 backdrop-blur-2xl dark:border-white/10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          <div className="flex h-[62px] items-center justify-between gap-0.5 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.id === activeTabId

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab)}
                  aria-label={isActive ? undefined : tab.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-[46px] min-w-[46px] flex-none items-center justify-center gap-1.5 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-focus',
                    isActive ? 'h-[46px] flex-grow basis-0 rounded-full px-4' : 'rounded-full p-2',
                    isActive ? 'text-on-primary' : 'text-muted',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="app-tab-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-primary shadow-elevation-2"
                    />
                  )}

                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    className={cn(
                      'relative z-10 shrink-0 transition-all duration-300',
                      isActive ? 'scale-105 text-on-primary' : 'text-muted',
                    )}
                  />

                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18, delay: 0.08 }}
                      className="relative z-10 whitespace-nowrap text-xs font-black leading-none"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </button>
              )
            })}

            <button
              onClick={handleMore}
              aria-label="المزيد — قائمة الوصول السريع"
              className="relative flex h-[46px] min-h-[46px] min-w-[46px] flex-none items-center justify-center rounded-full p-2 text-muted outline-none transition-colors duration-300 hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
            >
              <MoreHorizontal size={22} strokeWidth={1.7} />
              {totalUnreadCount > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[8px] font-black leading-none text-on-error shadow-elevation-1">
                  {totalUnreadCount > 99 ? '+99' : totalUnreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>,
    document.body,
  )
}
