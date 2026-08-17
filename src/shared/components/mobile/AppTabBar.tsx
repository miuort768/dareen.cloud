import type { LucideIcon } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Wallet,
  Users,
  Megaphone,
  MessageCircle,
  User,
  Menu,
} from 'lucide-react'
import { useCurrentUser } from '../../../context/AppContext'
import { useUnreadStore } from '../../../store/unreadStore'
import { triggerHaptic } from '../../../lib/haptics'
import { cn } from '../../../lib/utils'

interface TabItem {
  id: string
  label: string
  icon: LucideIcon
  path: string
}

interface AppTabBarProps {
  onMore: () => void
}

/** Routes that already render their own bottom tab bar (dashboards + chat). */
const SELF_NAV_PATHS = ['/teacher-dashboard', '/student-dashboard', '/parent-dashboard', '/chat']

const ADMIN_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, path: '/admin-dashboard' },
  { id: 'schedule', label: 'الجدول', icon: CalendarDays, path: '/schedule' },
  { id: 'tasks', label: 'المهام', icon: ClipboardList, path: '/tasks' },
  { id: 'finance', label: 'المالية', icon: Wallet, path: '/finance' },
]

const TEACHER_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, path: '/teacher-dashboard' },
  { id: 'schedule', label: 'الجدول', icon: CalendarDays, path: '/schedule' },
  { id: 'tasks', label: 'المهام', icon: ClipboardList, path: '/tasks' },
  { id: 'payments', label: 'سجل الدفع', icon: Wallet, path: '/teacher-payment-history' },
]

const PARENT_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, path: '/parent-dashboard' },
  { id: 'children', label: 'أبنائي', icon: Users, path: '/parent-students' },
  { id: 'announcements', label: 'الإعلانات', icon: Megaphone, path: '/parent-announcements' },
  { id: 'payments', label: 'سجل الدفع', icon: Wallet, path: '/parent-payment-history' },
]

const STUDENT_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, path: '/student-dashboard' },
  { id: 'schedule', label: 'الجدول', icon: CalendarDays, path: '/schedule' },
  { id: 'forum', label: 'المنتدى', icon: MessageCircle, path: '/forum' },
  { id: 'profile', label: 'الحساب', icon: User, path: '/student-profile' },
]

/**
 * Global iOS-style bottom tab bar. Role-aware, renders on mobile only,
 * and hides itself on routes that provide their own navigation.
 */
export const AppTabBar = ({ onMore }: AppTabBarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useCurrentUser()
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount)

  const isChatOnly = currentUser?.role === 'chat_user'
  if (isChatOnly) return null

  const isHiddenOnSelfNav = SELF_NAV_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
  )
  if (isHiddenOnSelfNav) return null

  const tabs =
    currentUser?.role === 'teacher'
      ? TEACHER_TABS
      : currentUser?.role === 'parent'
        ? PARENT_TABS
        : currentUser?.role === 'student'
          ? STUDENT_TABS
          : ADMIN_TABS

  const isActive = (tab: TabItem) => {
    if (location.pathname === tab.path) return true
    if (tab.id === 'home' && (location.pathname === '/' || location.pathname.includes('dashboard')))
      return true
    if (tab.path !== '/' && location.pathname.startsWith(tab.path)) return true
    return false
  }

  const activeTab = (tabs.find(isActive) ?? tabs[0])?.id ?? ''

  const handleTab = (tab: TabItem) => {
    if (location.pathname === tab.path) return
    triggerHaptic('light')
    navigate(tab.path)
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[45] md:hidden">
      <div className="h-2 bg-background" />
      <div className="border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl shadow-black/10">
        <div className="flex items-center justify-around px-1 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isTabActive = tab.id === activeTab
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTab(tab)}
                aria-label={tab.label}
                className="relative flex min-w-[56px] flex-col items-center gap-0.5 px-3 py-1"
              >
                <div
                  className={cn(
                    'relative rounded-xl p-1.5 transition-all duration-300',
                    isTabActive && 'bg-primary-soft',
                  )}
                >
                  <Icon
                    size={20}
                    strokeWidth={isTabActive ? 2 : 1.5}
                    className={cn(
                      'transition-colors duration-300',
                      isTabActive ? 'text-primary' : 'text-muted',
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold leading-none transition-all duration-300',
                    isTabActive ? 'text-primary' : 'text-muted',
                  )}
                >
                  {tab.label}
                </span>
                {isTabActive && (
                  <motion.div
                    layoutId="app-tab-indicator"
                    className="absolute -top-1.5 h-1 w-7 rounded-full bg-primary shadow-lg shadow-primary/30"
                  />
                )}
              </motion.button>
            )
          })}

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('light')
              onMore()
            }}
            aria-label="القائمة"
            className="relative flex min-w-[56px] flex-col items-center gap-0.5 px-3 py-1"
          >
            <div className="relative rounded-xl p-1.5">
              <Menu size={20} strokeWidth={1.5} className="text-muted" />
              {totalUnreadCount > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[9px] font-black leading-none text-on-error">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold leading-none text-muted">المزيد</span>
          </motion.button>
        </div>
      </div>
    </nav>
  )
}

export const appTabBarHidden = (pathname: string) =>
  SELF_NAV_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
