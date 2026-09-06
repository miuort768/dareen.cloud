import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu,
  X,
  GraduationCap,
  LogIn,
  Sun,
  Bed,
  Home,
  BookOpen,
  Book,
  Info,
  Phone,
  LayoutDashboard,
} from 'lucide-react'
import { PublicNavbar } from './PublicNavbar'
import { useDarkMode } from '../../shared/hooks/useDarkMode'
import { useIsAuthenticated } from '../../context/useApp'
import { useAcademyName } from '../../context/AppContext'

export const MobileHeader = ({ hideThemeToggle }: { hideThemeToggle?: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useDarkMode()
  const isAuthenticated = useIsAuthenticated()
  const academyName = useAcademyName()

  const navItems = [
    { label: 'الرئيسية', path: '/', icon: Home },
    { label: 'الدورات', path: '/courses', icon: BookOpen },
    { label: 'المكتبة', path: '/books', icon: Book },
    { label: 'من نحن', path: '/about', icon: Info },
    { label: 'اتصل بنا', path: '/contact', icon: Phone },
  ]

  return (
    <>
      <div className="hidden md:block">
        <PublicNavbar />
      </div>
      <header className="flex items-center justify-between bg-surface px-2 pb-2 pt-3 dark:bg-black md:hidden">
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary shadow-elevation-3 shadow-primary/20 dark:from-primary dark:to-warning dark:shadow-primary/20">
              <div className="animate-shine pointer-events-none absolute inset-0 z-0 h-full w-[150%] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              <GraduationCap className="relative z-10 h-6 w-6 text-on-primary dark:text-on-primary" />
            </div>
            <div>
              <p className="text-base font-black leading-tight text-main dark:text-main">
                {academyName}
              </p>
              <p className="dark:text-soft text-micro font-bold leading-tight text-main">
                أفضل مدرسة افتراضية
              </p>
              <p className="mt-0.5 text-micro leading-tight text-main dark:text-muted">
                Dareen for Education & Online Learning
              </p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface shadow-elevation-1 outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-primary/30 dark:bg-card ${hideThemeToggle ? 'hidden' : ''}`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-primary" />
            ) : (
              <Bed className="h-4 w-4 text-primary" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface shadow-elevation-1 outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-primary/30 dark:bg-card"
            >
              {menuOpen ? (
                <X className="h-5 w-5 text-muted dark:text-primary" />
              ) : (
                <Menu className="h-5 w-5 text-muted dark:text-primary" />
              )}
            </button>
            {menuOpen && (
              <div className="absolute end-0 top-12 z-50 min-w-[180px] rounded-2xl border border-border bg-surface shadow-2xl dark:border-primary/30 dark:bg-card">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 whitespace-nowrap border-b border-border px-4 py-3 text-xs font-bold text-main transition-colors last:border-0 hover:bg-primary-soft hover:text-primary dark:border-primary/20 dark:text-main dark:hover:bg-primary/10 dark:hover:text-primary"
                  >
                    <item.icon size={16} className="shrink-0 dark:text-primary" />
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs font-bold text-primary transition-colors hover:bg-info-light dark:border-primary/20 dark:text-primary dark:hover:bg-primary/10"
                  >
                    <LayoutDashboard size={14} />
                    لوحة التحكم
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs font-bold text-primary transition-colors hover:bg-info-light dark:border-primary/20 dark:text-primary dark:hover:bg-primary/10"
                  >
                    <LogIn size={14} />
                    تسجيل الدخول
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
