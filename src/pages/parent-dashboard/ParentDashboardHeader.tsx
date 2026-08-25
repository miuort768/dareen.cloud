import {
  LogOut,
  Sun,
  Moon,
  Bell,
  Home,
  Users,
  MessageCircle,
  Wallet,
  User,
  CalendarDays,
  Calendar,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDarkMode } from '../../shared/hooks/useDarkMode'
import { useCurrentUser, useAcademicYear } from '../../context/AppContext'
import { confirm } from '../../lib/confirmDialog'
import { cn } from '../../lib/utils'
import { Image } from '../../shared/components/ui'

interface ParentDashboardHeaderProps {
  logout: () => void
}

const navTabs = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/parent-dashboard' },
  { id: 'children', label: 'أبنائي', icon: Users, path: '/parent-students' },
  { id: 'schedule', label: 'الجداول', icon: Calendar, path: '/schedule' },
  { id: 'forum', label: 'المنتدى', icon: MessageCircle, path: '/forum' },
  { id: 'appointments', label: 'المواعيد', icon: CalendarDays, path: '/appointments' },
  { id: 'payments', label: 'سجل الدفع', icon: Wallet, path: '/parent-payment-history' },
  { id: 'announcements', label: 'الإعلانات', icon: Bell, path: '/parent-announcements' },
  { id: 'profile', label: 'الحساب', icon: User, path: '/parent-profile' },
]

export const ParentDashboardHeader = ({ logout }: ParentDashboardHeaderProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useCurrentUser()
  const academicYear = useAcademicYear()
  const [theme, setTheme] = useDarkMode()
  const firstName =
    (currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0] ?? 'ولي الأمر'

  return (
    <header className="border-border/70 bg-background/85 sticky top-0 z-[100] w-full border-b backdrop-blur-xl transition-colors duration-300 dark:border-white/5">
      <div className="mx-auto max-w-page">
        <div className="flex h-16 items-center justify-between px-2.5 sm:px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/dareen_logo_new.webp"
              alt="دارين السابعة"
              className="border-border/60 h-9 w-9 shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm dark:border-white/5"
              imgClassName="object-contain scale-[1.28]"
            />
            <button
              onClick={() => navigate('/parent-profile')}
              className="-m-1.5 flex items-center gap-3 rounded-xl p-1.5 text-start transition-all duration-200 hover:bg-hover active:scale-[0.98] dark:hover:bg-hover"
              aria-label="الملف الشخصي"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary dark:bg-primary">
                <span className="text-sm font-bold text-on-primary dark:text-on-primary">
                  {firstName.charAt(0)}
                </span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold leading-tight text-main dark:text-main">
                  مرحباً {firstName}
                </h1>
                <p className="text-[11px] font-medium text-muted dark:text-muted">ولي أمر</p>
              </div>
            </button>
          </div>

          {academicYear && (
            <span className="hidden items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-[11px] font-bold text-primary sm:flex">
              <CalendarDays size={13} />
              {academicYear}
            </span>
          )}

          <div className="border-border/70 flex items-center gap-0.5 rounded-full border bg-card p-1 shadow-sm dark:border-white/5">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-main active:scale-95"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className="bg-border/60 h-5 w-px" />
            <button
              onClick={async () => {
                if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout()
              }}
              aria-label="تسجيل الخروج"
              className="dark:hover:bg-error/20 flex h-8 w-8 items-center justify-center rounded-full text-error transition-colors hover:bg-error-light active:scale-95"
            >
              <LogOut size={15} />
            </button>
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
                    ? 'border-x border-t border-border bg-background text-primary dark:border-border dark:bg-background dark:text-primary'
                    : 'text-muted hover:bg-hover hover:text-main active:scale-[0.97] dark:text-muted dark:hover:bg-hover dark:hover:text-main',
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
