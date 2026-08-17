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
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden" aria-label="التنقل الرئيسي">
      <div
        className="px-2 pt-1"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="border-border/40 bg-card/85 dark:bg-background/85 relative overflow-hidden rounded-[22px] border shadow-[0_-2px_20px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/[0.06] dark:shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="flex items-stretch">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.id === activeTabId

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab)}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2.5 outline-none"
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-2xl p-2 transition-all duration-300',
                      isActive && 'scale-110 bg-primary/10 dark:bg-primary/15',
                    )}
                  >
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.2 : 1.5}
                      className={cn(
                        'transition-all duration-300',
                        isActive
                          ? 'text-primary drop-shadow-[0_0_6px_rgba(var(--color-primary-rgb),0.3)]'
                          : 'text-muted',
                      )}
                    />
                  </div>

                  <span
                    className={cn(
                      'text-[9px] font-semibold leading-none transition-all duration-300',
                      isActive ? 'text-primary' : 'text-muted',
                    )}
                  >
                    {tab.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute -bottom-0.5 h-[3px] w-4 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.4)]"
                    />
                  )}
                </button>
              )
            })}

            <button
              onClick={handleMore}
              aria-label="المزيد"
              className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2.5 outline-none"
            >
              <div className="relative flex items-center justify-center rounded-2xl p-2">
                <MoreHorizontal size={20} strokeWidth={1.5} className="text-muted" />
                {totalUnreadCount > 0 && (
                  <span className="absolute -end-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[8px] font-black leading-none text-on-error shadow-sm">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-semibold leading-none text-muted">المزيد</span>
            </button>
          </div>
        </div>
      </div>
    </nav>,
    document.body,
  )
}
