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
    )?.id ?? tabs[0].id

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
        className="px-3 pt-1"
        style={{ paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))' }}
      >
        <div className="relative overflow-hidden rounded-[26px] border border-border/50 bg-card/90 backdrop-blur-2xl shadow-elevation-3 dark:border-white/10 dark:bg-background/90">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          <div className="flex h-[66px] items-center justify-between px-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.id === activeTabId

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab)}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    isActive ? 'text-primary' : 'text-muted hover:text-main',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="app-tab-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-x-1 inset-y-1 rounded-xl bg-primary/12 dark:bg-primary/20"
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-center">
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.3 : 1.7}
                      className={cn(
                        'transition-transform duration-300',
                        isActive ? 'scale-110 text-primary' : 'text-muted',
                      )}
                    />
                  </div>

                  <span
                    className={cn(
                      'relative z-10 text-[10px] font-bold leading-none tracking-tight transition-colors duration-300',
                      isActive ? 'font-black text-primary' : 'text-muted',
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}

            <button
              onClick={handleMore}
              aria-label="المزيد"
              className="relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-focus text-muted hover:text-main"
            >
              <div className="relative z-10 flex items-center justify-center">
                <MoreHorizontal size={20} strokeWidth={1.7} className="text-muted" />
                {totalUnreadCount > 0 && (
                  <span className="absolute -end-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[8px] font-black leading-none text-on-error shadow-elevation-1">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </span>
                )}
              </div>
              <span className="relative z-10 text-[10px] font-bold leading-none tracking-tight text-muted">
                المزيد
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>,
    document.body,
  )
}
