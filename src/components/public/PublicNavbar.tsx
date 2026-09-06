import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles, ChevronDown, LogOut, GraduationCap, User } from 'lucide-react'
import {
  useIsAuthenticated,
  useCurrentUser,
  useLogout,
  useAcademyName,
} from '../../context/AppContext'
import { confirm } from '../../lib/confirmDialog'
import { NotificationDropdown } from '../ui/NotificationDropdown'
import { Image } from '../../shared/components/ui'
import { cn } from '../../lib/utils'

export const PublicNavbar = () => {
  const academyName = useAcademyName()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isAuthenticated = useIsAuthenticated()
  const currentUser = useCurrentUser()
  const logout = useLogout()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { name: 'الرئيسية', path: '/' },
    { name: 'الدورات', path: '/courses' },
    { name: 'المكتبة', path: '/books' },
    { name: 'من نحن', path: '/about' },
    { name: 'اتصل بنا', path: '/contact' },
  ]

  const isActive = (path: string) => location.pathname === path

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <header className="fixed end-0 start-0 top-2 z-50 mx-auto w-[95%] transition-all duration-500 md:top-4 md:w-[92%] lg:max-w-[90%]">
      <nav className="relative rounded-full border border-border bg-card px-3 py-2 shadow-[var(--shadow-navbar)] md:rounded-[2rem] md:px-4 md:py-3 lg:px-6">
        <div className="flex h-12 min-w-0 items-center justify-between md:h-14">
          {/* Logo */}
          <Link to="/" className="group flex shrink-0 items-center gap-3 ps-2">
            <div className="group relative">
              <div className="absolute inset-0 rounded-xl bg-primary-light opacity-20 blur-md transition-opacity group-hover:opacity-40"></div>
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-gradient-to-tr from-primary via-primary to-primary text-on-primary shadow-elevation-3 transition-all duration-500 group-hover:rotate-[10deg]">
                <div className="animate-shine pointer-events-none absolute inset-0 z-0 h-full w-[150%] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                <GraduationCap size={24} className="relative z-10" />
              </div>
              <Sparkles
                size={12}
                className="absolute -start-[2px] -top-[2px] z-20 animate-pulse fill-warning text-warning transition-transform group-hover:scale-110"
              />
            </div>
            <div
              className={cn(
                'flex-col items-center pt-0.5 text-center',
                isAuthenticated ? 'hidden md:flex' : 'flex',
              )}
            >
              <p className="site-title text-sm font-black leading-tight text-primary dark:text-main md:text-base md:dark:text-primary">
                {academyName}
              </p>
              <span className="mt-0.5 hidden items-center gap-1.5 text-xs font-bold italic text-primary dark:text-main md:dark:text-primary lg:inline-flex">
                <svg
                  viewBox="0 0 40 20"
                  className="h-3.5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 10 C10 2 18 2 20 10 C22 18 30 18 38 10" />
                  <circle cx="20" cy="10" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                أفضل مدرسة افتراضية
                <svg
                  viewBox="0 0 40 20"
                  className="h-3.5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 10 C10 18 18 18 20 10 C22 2 30 2 38 10" />
                  <circle cx="20" cy="10" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span className="mt-0.5 rounded-md bg-primary-soft px-2 py-0.5 text-micro font-bold italic text-primary dark:bg-primary/40 dark:text-main md:hidden">
                أفضل مدرسة افتراضية
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="relative z-10 hidden min-w-0 shrink items-center gap-1 rounded-full border border-primary bg-primary-soft px-1.5 py-1.5 shadow-elevation-1 md:flex lg:gap-2 lg:px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition-colors duration-150 lg:px-5 lg:text-sm xl:px-6 ${
                  isActive(item.path)
                    ? 'bg-primary text-on-primary shadow-elevation-3 shadow-primary/30'
                    : 'text-main hover:bg-primary hover:text-on-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side: Auth & Notifications */}
          <div className="flex shrink-0 items-center gap-1 md:gap-2 lg:gap-4">
            {/* Dark Mode Toggle Removed from here */}

            {isAuthenticated && isDesktop && (
              <div className="hidden h-8 items-center border-e border-border pe-3 lg:flex xl:pe-4">
                <NotificationDropdown />
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="group flex items-center gap-3 px-2 py-2 text-main transition-all hover:text-primary md:px-4"
                  aria-label={isDropdownOpen ? 'إغلاق القائمة' : 'فتح قائمة المستخدم'}
                  aria-expanded={isDropdownOpen}
                  aria-controls="user-dropdown"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-primary shadow-elevation-1 transition-all group-hover:border-primary">
                    {currentUser?.avatar ? (
                      <Image
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-soft dark:bg-primary">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                  <span className="hidden text-xs font-bold lg:block xl:text-sm">
                    {currentUser?.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-300 lg:h-4 lg:w-4 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  id="user-dropdown"
                  className={`absolute end-0 z-50 mt-4 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-4 transition-all duration-300 ${isDropdownOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}
                >
                  <div className="border-b border-border bg-background p-4">
                    <p className="text-sm font-bold text-main">{currentUser?.name}</p>
                    <p className="text-xs text-muted">{currentUser?.username}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-main transition-colors hover:bg-primary-soft hover:text-primary dark:hover:bg-primary"
                  >
                    <Sparkles className="h-5 w-5 text-primary" />
                    لوحة التحكم
                  </Link>
                  <button
                    onClick={async () => {
                      if (!(await confirm('هل أنت متأكد من تسجيل الخروج؟'))) return
                      logout()
                      setIsDropdownOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-start text-sm text-error transition-colors hover:bg-error-light dark:hover:bg-error"
                    aria-label="تسجيل الخروج"
                  >
                    <LogOut className="h-5 w-5" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-primary px-4 py-2 text-xs font-bold text-on-primary transition-all hover:scale-105 hover:shadow-elevation-3 md:flex md:py-2.5 lg:px-6 lg:text-sm xl:px-8"
              >
                تسجيل الدخول
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full p-2 text-primary transition-all hover:bg-primary-soft active:scale-90 dark:text-main dark:hover:bg-white/10 md:hidden"
              aria-label={isMenuOpen ? 'إغلاق القائمة الجانبية' : 'فتح القائمة الجانبية'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Floating Card Style */}
        <div
          className={`absolute end-0 start-0 top-full mt-3 rounded-[2rem] border border-border bg-card p-4 shadow-2xl transition-all duration-500 md:hidden ${isMenuOpen ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-4 opacity-0'} `}
          style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
        >
          <div className="space-y-2">
            {navItems
              .filter((item) => !isActive(item.path))
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-full px-6 py-4 font-bold transition-all ${
                    isActive(item.path)
                      ? 'bg-primary text-on-primary shadow-elevation-3'
                      : 'text-main hover:bg-surface dark:text-main dark:hover:bg-hover'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isActive(item.path) ? 'bg-white' : 'bg-primary'}`}
                  ></span>
                  {item.name}
                </Link>
              ))}

            <div className="mt-2 border-t border-border pt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-full px-6 py-4 font-bold text-main hover:bg-surface dark:hover:bg-hover"
                  >
                    <Sparkles className="h-5 w-5 text-primary" />
                    لوحة التحكم
                  </Link>
                  <button
                    onClick={async () => {
                      if (!(await confirm('هل أنت متأكد من تسجيل الخروج؟'))) return
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-full px-6 py-4 font-bold text-error hover:bg-error-light dark:hover:bg-error"
                  >
                    <LogOut size={20} className="rotate-180" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary py-4 font-bold text-on-primary shadow-elevation-3 transition-transform active:scale-[0.98]"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
