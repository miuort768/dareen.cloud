import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Wallet,
  Users,
  Megaphone,
  MessageSquare,
  User,
  MoreHorizontal,
  GraduationCap,
  CalendarCheck,
  Settings,
  UserCheck,
  FileText,
  DollarSign,
  Home,
  MessageCircle,
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
  { id: 'teachers', label: 'المعلمات', icon: Users, path: '/teachers' },
  { id: 'schedule', label: 'الجدول', icon: CalendarDays, path: '/schedule' },
  { id: 'attendance', label: 'الحضور', icon: UserCheck, path: '/attendance' },
  { id: 'tasks', label: 'المهام', icon: ClipboardList, path: '/tasks' },
  { id: 'finance', label: 'المالية', icon: Wallet, path: '/finance' },
  { id: 'announcements', label: 'الإعلانات', icon: Megaphone, path: '/announcements' },
  { id: 'forum', label: 'المنتدى', icon: MessageSquare, path: '/forum' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/settings' },
]

const TEACHER_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, path: '/teacher-dashboard' },
  { id: 'schedule', label: 'الجدول', icon: CalendarDays, path: '/schedule' },
  { id: 'tasks', label: 'المهام', icon: ClipboardList, path: '/tasks' },
  { id: 'attendance', label: 'الحضور', icon: UserCheck, path: '/attendance' },
  { id: 'appointments', label: 'المواعيد', icon: CalendarCheck, path: '/appointments' },
  { id: 'reports', label: 'التقارير', icon: FileText, path: '/reports' },
  { id: 'forum', label: 'المنتدى', icon: MessageSquare, path: '/forum' },
  { id: 'payments', label: 'الدفع', icon: DollarSign, path: '/teacher-payment-history' },
]

const PARENT_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/parent-dashboard' },
  { id: 'children', label: 'الأبناء', icon: Users, path: '/parent-students' },
  { id: 'announcements', label: 'الإعلانات', icon: Megaphone, path: '/parent-announcements' },
  { id: 'chat', label: 'المحادثة', icon: MessageSquare, path: '/chat' },
  { id: 'payments', label: 'الدفع', icon: DollarSign, path: '/parent-payment-history' },
]

const STUDENT_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: GraduationCap, path: '/student-dashboard' },
  { id: 'schedule', label: 'الجدول', icon: CalendarDays, path: '/schedule' },
  { id: 'tasks', label: 'المهام', icon: ClipboardList, path: '/tasks' },
  { id: 'forum', label: 'المنتدى', icon: MessageSquare, path: '/forum' },
  { id: 'chat', label: 'الرسائل', icon: MessageCircle, path: '/chat' },
  { id: 'profile', label: 'حسابي', icon: User, path: '/student-profile' },
]

/**
 * Unified global bottom tab bar.
 * Renders on ALL pages for ALL roles (via Layout.tsx).
 * Uses createPortal for consistent z-index stacking.
 */
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
        className="px-3 pt-1"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="bg-card/80 dark:bg-background/80 border-border/30 relative rounded-[20px] border shadow-elevation-3 backdrop-blur-xl dark:border-white/[0.06]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/[0.05]" />

          <div className="relative flex h-[60px] items-center justify-around px-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.id === activeTabId

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab)}
                  aria-label={tab.label}
                  className={cn(
                    'relative flex h-full flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 outline-none transition-all duration-200',
                    isActive && 'scale-105',
                  )}
                >
                  <div
                    className={cn(
                      'rounded-xl p-1.5 transition-all duration-200',
                      isActive && 'bg-primary/10 dark:bg-primary/15',
                    )}
                  >
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.2 : 1.6}
                      className={cn(
                        'transition-colors duration-200',
                        isActive ? 'text-primary' : 'text-muted',
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-bold leading-none transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted',
                    )}
                  >
                    {tab.label}
                  </span>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="active-indicator"
                        layoutId="app-tab-active"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className="absolute -top-0.5 h-[3px] w-5 rounded-full bg-primary"
                      />
                    )}
                  </AnimatePresence>
                </button>
              )
            })}

            {/* زر المزيد */}
            <button
              onClick={handleMore}
              aria-label="المزيد"
              className="relative flex h-full flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 outline-none"
            >
              <div className="relative rounded-xl p-1.5">
                <MoreHorizontal size={20} strokeWidth={1.6} className="text-muted" />
                {totalUnreadCount > 0 && (
                  <span className="absolute -end-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[8px] font-black leading-none text-on-error">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold leading-none text-muted">المزيد</span>
            </button>
          </div>
        </div>
      </div>
    </nav>,
    document.body,
  )
}
