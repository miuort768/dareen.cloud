import {
  LogOut,
  Sun,
  Moon,
  Bell,
  Home,
  Calendar,
  MessageSquare,
  User,
  MessageCircle,
  ListTodo,
  Wallet,
  CalendarDays,
  UserCheck,
  Award,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDarkMode } from '../shared/hooks/useDarkMode'
import { useCurrentUser, useAcademicYear } from '../context/AppContext'
import { confirm } from '../lib/confirmDialog'
import { cn } from '../lib/utils'
import { IconButton } from '../shared/components/ui/IconButton'

interface TeacherDashboardHeaderProps {
  logout: () => void
}

const navTabs = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/teacher-dashboard' },
  { id: 'schedule', label: 'الجدول', icon: Calendar, path: '/schedule' },
  { id: 'attendance', label: 'الحضور والغياب', icon: UserCheck, path: '/attendance' },
  { id: 'tasks', label: 'المهام', icon: ListTodo, path: '/tasks' },
  { id: 'forum', label: 'المنتدى', icon: MessageCircle, path: '/forum' },
  { id: 'chat', label: 'الرسائل', icon: MessageSquare, path: '/chat' },
  { id: 'evaluations', label: 'التقييمات', icon: Award, path: '/evaluations' },
  { id: 'payments', label: 'سجل الدفع', icon: Wallet, path: '/teacher-payment-history' },
  { id: 'profile', label: 'الحساب', icon: User, path: '/teacher-profile' },
]

export const TeacherDashboardHeader = ({ logout }: TeacherDashboardHeaderProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useCurrentUser()
  const academicYear = useAcademicYear()
  const [theme, setTheme] = useDarkMode()
  const firstName = (currentUser?.name || currentUser?.username || 'المعلمة').split(' ')[0]

  const handleAnnouncements = () => {
    const canViewAnnouncements =
      currentUser?.permissions?.includes('*') || currentUser?.permissions?.includes('announcements')
    if (canViewAnnouncements) {
      navigate('/announcements')
      return
    }
    navigate('/teacher-dashboard')
    const tryScroll = (attempt = 0) => {
      if (attempt > 10) return
      const el = document.getElementById('announcements-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      setTimeout(() => tryScroll(attempt + 1), 200)
    }
    setTimeout(() => tryScroll(), 200)
  }

  return (
    <header className="bg-surface/90 dark:bg-surface/90 sticky top-0 z-[100] border-b border-border backdrop-blur-xl transition-colors duration-500 dark:border-primary/20">
      <div className="mx-auto max-w-page">
        <div className="flex h-16 items-center justify-between px-4 md:px-5">
          <button
            onClick={() => navigate('/teacher-profile')}
            className="-m-1 flex items-center gap-3 rounded-lg p-1 text-start transition-all duration-200 hover:bg-hover active:scale-[0.98]"
            aria-label="الملف الشخصي"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-elevation-1 dark:bg-primary">
              <span className="text-sm font-bold text-on-primary dark:text-on-primary">
                {firstName.charAt(0)}
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight text-main dark:text-main">
                أهلاً بك {firstName}
              </h1>
              <p className="text-[11px] font-medium text-muted dark:text-muted">
                نظرة عامة على حصصك اليوم
              </p>
            </div>
          </button>

          {academicYear && (
            <span className="hidden items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-[11px] font-bold text-primary sm:flex">
              <CalendarDays size={13} />
              {academicYear}
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <IconButton
              icon={
                theme === 'dark' ? (
                  <Sun size={16} strokeWidth={1.5} />
                ) : (
                  <Moon size={16} strokeWidth={1.5} />
                )
              }
              label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <IconButton
              icon={<Bell size={16} strokeWidth={1.5} />}
              label="الإعلانات"
              onClick={handleAnnouncements}
            />
            <IconButton
              icon={<LogOut size={16} strokeWidth={1.5} />}
              label="تسجيل الخروج"
              variant="error"
              onClick={async () => {
                if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout()
              }}
            />
          </div>
        </div>

        <div className="hidden items-center gap-1 px-4 pb-0 md:flex">
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = location.pathname === tab.path
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={cn(
                  'relative flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200',
                  isActive
                    ? 'border-x border-t border-border bg-background text-primary dark:border-border dark:bg-card dark:text-primary'
                    : 'hover:bg-accent/5 text-muted hover:text-main active:scale-[0.97] dark:text-muted dark:hover:bg-primary/5 dark:hover:text-main',
                )}
              >
                <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary dark:bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
