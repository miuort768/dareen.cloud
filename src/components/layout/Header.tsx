import { Sun, Moon, User, MessageSquare, Search, ChevronDown, Command, LogOut } from 'lucide-react'
import { useState, useEffect, memo, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useDarkMode } from '../../shared/hooks/useDarkMode'
import { useCurrentUser, useLogout } from '../../context/AppContext'
import { NotificationDropdown } from '../ui/NotificationDropdown'
import { Image } from '../../shared/components/ui'
import { cn } from '../../lib/utils'
import { confirm } from '../../lib/confirmDialog'
import { useUnreadStore } from '../../store/unreadStore'

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب' },
  '/admin-dashboard': { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب' },
  '/teacher-dashboard': { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب' },
  '/student-dashboard': { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب' },
  '/parent-dashboard': { title: 'لوحة التحكم', subtitle: 'نظرة عامة على أداء أبنائك' },
  '/students': { title: 'الطلاب', subtitle: 'قائمة بجميع الطلاب المسجلين وحالاتهم' },
  '/parents': { title: 'أولياء الأمور', subtitle: 'إدارة بيانات أولياء الأمور' },
  '/teachers': { title: 'المعلمات', subtitle: 'إدارة بيانات المعلمات' },
  '/finance': { title: 'المالية', subtitle: 'متابعة الإيرادات والمصروفات' },
  '/student-invoices': { title: 'فواتير الطلاب', subtitle: 'متابعة الرسوم والمدفوعات' },
  '/teacher-invoices': { title: 'فواتير المعلمات', subtitle: 'إدارة ومتابعة فواتير المعلمات' },
  '/teacher-payment-history': { title: 'سجل الدفعات', subtitle: 'سجل مستحقاتك ومدفوعاتك السابقة' },
  '/parent-payment-history': { title: 'سجل الدفعات', subtitle: 'سجل فواتير ومدفوعات الأبناء' },
  '/attendance': { title: 'الحضور والغياب', subtitle: 'متابعة حضور الطلاب اليومي' },
  '/schedule': { title: 'الجداول الدراسية', subtitle: 'جدول الحصص الأسبوعي' },
  '/appointments': { title: 'المواعيد', subtitle: 'إدارة المواعيد والتقويم' },
  '/tasks': { title: 'المهام', subtitle: 'إدارة وتكليف المهام للمعلمات' },
  '/announcements': { title: 'الإعلانات', subtitle: 'نشر الإعلانات العامة والتنبيهات' },
  '/chat': { title: 'المحادثات', subtitle: 'التواصل المباشر' },
  '/reports': { title: 'التقارير', subtitle: 'التقارير والإحصائيات العامة' },
  '/forum': { title: 'منتدى دارين السابعة', subtitle: 'مساحة لمشاركة الأفكار' },
  '/settings': { title: 'إعدادات النظام', subtitle: 'تكوين إعدادات النظام' },
  '/parent-students': { title: 'أبنائي', subtitle: 'متابعة الحضور والتقويم' },
  '/parent-announcements': { title: 'إعلانات المنصة', subtitle: 'آخر المستجدات' },
  '/evaluations': { title: 'التقييمات', subtitle: 'متابعة تقييمات الطلاب' },
  '/monthly-closing': { title: 'الإقفال الشهري', subtitle: 'إدارة التقارير الشهرية' },
  '/leads': { title: 'العملاء المحتملين', subtitle: 'إدارة طلبات التسجيل' },
  '/trial-sessions': { title: 'جلسات المراجعة', subtitle: 'متابعة جلسات الطلاب' },
  '/admin-contacts': { title: 'رسائل الاتصال', subtitle: 'إدارة رسائل التواصل' },
  '/admin-jobs': { title: 'طلبات التوظيف', subtitle: 'إدارة طلبات التوظيف' },
  '/advertisers': { title: 'المعلنون', subtitle: 'المساحات الإعلانية في صفحة المكتبة' },
  '/student-profile': { title: 'الملف الشخصي', subtitle: 'معلومات حسابك الشخصي' },
  '/teacher-profile': { title: 'الملف الشخصي', subtitle: 'معلومات حسابك الشخصي' },
  '/parent-profile': { title: 'الملف الشخصي', subtitle: 'معلومات حسابك الشخصي' },
}

const SEARCH_ROUTES: [string, string][] = [
  ['الطلاب', '/students'],
  ['المعلمات', '/teachers'],
  ['المالية', '/finance'],
  ['الفواتير', '/student-invoices'],
  ['فواتير المعلمات', '/teacher-invoices'],
  ['الحضور', '/attendance'],
  ['الجداول', '/schedule'],
  ['المواعيد', '/appointments'],
  ['المهام', '/tasks'],
  ['الإعلانات', '/announcements'],
  ['المحادثات', '/chat'],
  ['الدردشة', '/chat'],
  ['التقارير', '/reports'],
  ['الإعدادات', '/settings'],
  ['المنتدى', '/forum'],
  ['العملاء', '/leads'],
  ['الجلسات', '/trial-sessions'],
  ['الرسائل', '/admin-contacts'],
  ['التوظيف', '/admin-jobs'],
  ['التقييمات', '/evaluations'],
  ['الإغلاق', '/monthly-closing'],
  ['أولياء', '/parents'],
  ['الأدوار', '/roles'],
  ['الصلاحيات', '/roles'],
  ['المراقبة', '/monitoring'],
]

export const Header = memo(() => {
  const [theme, setTheme] = useDarkMode()
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const logout = useLogout()
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Ctrl/⌘+K focuses the search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const getPageMeta = (path: string) => {
    const basePath = '/' + path.split('/')[1]
    if (basePath === '/' || routeMeta[basePath])
      return routeMeta[basePath] || { title: 'لوحة التحكم', subtitle: 'نظرة عامة على النظام' }
    if (path.includes('/blog')) return { title: 'المدونة', subtitle: 'إدارة مقالات المدونة والكتب' }
    return { title: 'لوحة التحكم', subtitle: 'نظرة عامة على النظام' }
  }

  const meta = getPageMeta(location.pathname)

  const userLink = !currentUser
    ? '/settings'
    : currentUser.role === 'admin'
      ? '/settings'
      : currentUser.role === 'parent'
        ? '/parent-profile'
        : currentUser.role === 'student'
          ? '/student-profile'
          : '/teacher-profile'

  const firstName = currentUser?.name?.split(' ')[0] ?? ''

  const runSearch = () => {
    const q = searchQuery.trim()
    if (!q) return
    const match = SEARCH_ROUTES.find(([k]) => q.includes(k))
    navigate(match ? match[1] : '/students')
    setSearchQuery('')
    searchRef.current?.blur()
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-background backdrop-blur-xl dark:border-white/5',
        'transition-all duration-300',
      )}
    >
      <div className="mx-auto flex h-14 max-w-page items-center gap-2 px-2.5 sm:px-4 md:h-16 lg:h-[68px] lg:gap-4 lg:px-8">
        {/* ===== Start: identity ===== */}
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-3">
          <Link to="/admin-dashboard" aria-label="الرئيسية" className="shrink-0">
            <Image
              src="/dareen_logo_new.webp"
              alt="دارين السابعة"
              className="h-9 w-9 overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-white/5 lg:h-10 lg:w-10"
              imgClassName="object-contain scale-[1.28]"
            />
          </Link>

          <div className="hidden h-6 w-px shrink-0 bg-divider lg:block" />

          <div className="min-w-0">
            <h1 className="truncate text-sm font-black leading-tight text-main md:text-base lg:text-base">
              {meta.title}
            </h1>
            {isDesktop && (
              <p className="mt-0.5 truncate text-[11px] leading-snug text-muted">{meta.subtitle}</p>
            )}
          </div>
        </div>

        {/* ===== End: actions ===== */}
        <div className="flex shrink-0 items-center gap-1.5 lg:gap-2.5">
          {/* Desktop search */}
          {isDesktop && (
            <div className="relative hidden lg:block">
              <Search
                size={15}
                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="بحث سريع..."
                aria-label="بحث سريع في الصفحات"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch()
                  if (e.key === 'Escape') searchRef.current?.blur()
                }}
                className="h-10 w-52 rounded-full border border-border bg-surface pe-16 ps-10 text-xs font-bold text-main outline-none transition-all duration-200 placeholder:text-muted focus-visible:w-64 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 dark:border-white/5 xl:w-64"
              />
              <kbd className="pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-bold text-muted dark:border-white/5">
                <Command size={9} />K
              </kbd>
            </div>
          )}

          {/* Icon actions */}
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-sm dark:border-white/5">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-main active:scale-95 md:h-8 md:w-8"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <div className="h-5 w-px bg-divider" />

            <Link
              to="/chat"
              aria-label="الدردشة"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-main active:scale-95 md:h-8 md:w-8"
            >
              <MessageSquare size={15} />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-0.5 start-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[9px] font-black leading-none text-on-error">
                  {totalUnreadCount > 99 ? '+99' : totalUnreadCount}
                </span>
              )}
            </Link>

            <NotificationDropdown />

            <div className="h-5 w-px bg-divider" />

            <button
              onClick={async () => {
                if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout()
              }}
              aria-label="تسجيل الخروج"
              className="flex h-10 w-10 items-center justify-center rounded-full text-error transition-colors hover:bg-error-light active:scale-95 md:h-8 md:w-8"
            >
              <LogOut size={15} />
            </button>
          </div>

          {/* User chip */}
          <Link
            to={userLink}
            aria-label="الملف الشخصي"
            className="flex h-10 items-center gap-2 rounded-full border border-border bg-card py-1 pe-1 ps-1 shadow-sm transition-all hover:bg-hover hover:shadow-md active:scale-[0.97] dark:border-white/5 lg:pe-2.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-on-primary">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <User size={15} />
              )}
            </span>
            <span className="hidden min-w-0 lg:block">
              <span className="block max-w-[90px] truncate text-xs font-black leading-tight text-main">
                {firstName}
              </span>
              <span className="block text-[9px] font-bold leading-tight text-muted">حسابي</span>
            </span>
            <ChevronDown size={13} className="hidden shrink-0 text-muted lg:block" />
          </Link>
        </div>
      </div>
    </header>
  )
})
