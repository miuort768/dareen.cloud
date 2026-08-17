import { useRef, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
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

export const AppTabBar = ({ onMore }: AppTabBarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useCurrentUser()
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount)
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)

  const isChatOnly = currentUser?.role === 'chat_user'

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

  // Scroll active tab into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeTabId])

  // Detect scroll edges for fade indicators
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const check = () => {
      const maxScroll = el.scrollWidth - el.clientWidth
      setShowLeftFade(el.scrollLeft > 4)
      setShowRightFade(el.scrollLeft < maxScroll - 4)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [tabs])

  if (isChatOnly) return null

  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden" aria-label="التنقل الرئيسي">
      <div
        className="px-2 pt-1"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="border-border/40 bg-card/85 dark:bg-background/85 relative overflow-hidden rounded-[22px] border shadow-[0_-2px_20px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/[0.06] dark:shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
          {/* Top highlight line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="no-scrollbar flex items-stretch overflow-x-auto scroll-smooth"
            style={{ scrollSnapType: 'x proximity' }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.id === activeTabId

              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => handleTab(tab)}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                  style={{ scrollSnapAlign: 'center' }}
                  className={cn(
                    'relative flex min-w-[60px] flex-1 flex-col items-center justify-center gap-1 py-2.5 outline-none transition-all duration-200',
                  )}
                >
                  {/* Active background pill */}
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-2xl p-2 transition-all duration-300',
                      isActive ? 'scale-110 bg-primary/10 dark:bg-primary/15' : 'p-2',
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

                  {/* Label */}
                  <span
                    className={cn(
                      'text-[9px] font-semibold leading-none transition-all duration-300',
                      isActive ? 'text-primary' : 'text-muted',
                    )}
                  >
                    {tab.label}
                  </span>

                  {/* Active dot indicator */}
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

            {/* More button */}
            <button
              onClick={handleMore}
              aria-label="المزيد"
              className="relative flex min-w-[60px] flex-1 flex-col items-center justify-center gap-1 py-2.5 outline-none"
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

          {/* Scroll fade edges */}
          {showLeftFade && (
            <div className="from-card/90 dark:from-background/90 pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r to-transparent" />
          )}
          {showRightFade && (
            <div className="from-card/90 dark:from-background/90 pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l to-transparent" />
          )}
        </div>
      </div>
    </nav>,
    document.body,
  )
}
