import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { CalendarDays, UserPlus, MessageSquare, LayoutGrid, UserCheck, Home } from 'lucide-react'
import { useCurrentUser } from '../../../context/AppContext'
import { useUnreadStore } from '../../../store/unreadStore'
import { useChatUIStore } from '../../../store/chatUIStore'
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
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/admin-dashboard' },
  { id: 'leads', label: 'المهتمون', icon: UserPlus, path: '/leads' },
  { id: 'attendance', label: 'الحضور', icon: UserCheck, path: '/attendance' },
]

const TEACHER_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/teacher-dashboard' },
  { id: 'schedule', label: 'الجداول', icon: CalendarDays, path: '/schedule' },
  { id: 'attendance', label: 'الحضور', icon: UserCheck, path: '/attendance' },
]

// ملاحظة: ولي الأمر والطالب لا يملكان صلاحية مسار /attendance
// (ProtectedRoute يعيد توجيههم إلى "/") — حضور أبنائهم متاح داخل لوحة الولي نفسها.
const PARENT_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/parent-dashboard' },
  { id: 'chat', label: 'الدردشة', icon: MessageSquare, path: '/chat' },
]

const STUDENT_TABS: TabItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/student-dashboard' },
  { id: 'chat', label: 'الدردشة', icon: MessageSquare, path: '/chat' },
]

export const AppTabBar = ({ onMore }: AppTabBarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useCurrentUser()
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount)
  const isConversationOpen = useChatUIStore((s) => s.selectedConv !== null)

  if (currentUser?.role === 'chat_user') return null
  if (location.pathname.includes('/chat') && isConversationOpen) return null

  const tabs =
    currentUser?.role === 'teacher'
      ? TEACHER_TABS
      : currentUser?.role === 'parent'
        ? PARENT_TABS
        : currentUser?.role === 'student'
          ? STUDENT_TABS
          : ADMIN_TABS

  const hasChatTab = tabs.some((t) => t.id === 'chat')

  const activeTabId = tabs.find(
    (t) => location.pathname === t.path || location.pathname.startsWith(`${t.path}/`),
  )?.id

  const handleTab = (tab: TabItem) => {
    if (location.pathname === tab.path) return
    triggerHaptic('light')
    navigate(tab.path)
  }

  const handleMore = () => {
    triggerHaptic('light')
    onMore()
  }

  const renderBadge = (count: number) =>
    count > 0 ? (
      <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[8px] font-black leading-none text-on-error shadow-elevation-1">
        {count > 99 ? '+99' : count}
      </span>
    ) : null

  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden" aria-label="التنقل الرئيسي للهاتف">
      <div
        className="px-3 pt-1"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="relative overflow-hidden rounded-full border border-border bg-card shadow-elevation-3 backdrop-blur-2xl dark:border-white/10 dark:bg-background">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          <div className="flex h-[60px] items-stretch gap-1 px-1.5 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.id === activeTabId

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex min-w-0 flex-1 items-center justify-center rounded-full outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-focus',
                    isActive ? 'text-on-primary' : 'text-muted hover:text-main',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="app-tab-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-primary shadow-elevation-2"
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-1 px-1">
                    <span className="relative shrink-0">
                      <Icon size={19} strokeWidth={isActive ? 2.2 : 1.7} />
                      {tab.id === 'chat' && renderBadge(totalUnreadCount)}
                    </span>
                    <span className="whitespace-nowrap text-[10px] font-black leading-none">
                      {tab.label}
                    </span>
                  </span>
                </button>
              )
            })}

            <button
              onClick={handleMore}
              aria-label="القائمة — الوصول السريع لكل الصفحات"
              className="relative flex min-w-0 flex-1 items-center justify-center rounded-full text-muted outline-none transition-colors duration-300 hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
            >
              <span className="relative z-10 flex items-center gap-1 px-1">
                <span className="relative shrink-0">
                  <LayoutGrid size={19} strokeWidth={1.7} />
                  {!hasChatTab && renderBadge(totalUnreadCount)}
                </span>
                <span className="whitespace-nowrap text-[10px] font-black leading-none">
                  القائمة
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>,
    document.body,
  )
}
