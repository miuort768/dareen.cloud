import { Sun, Moon, User, MessageSquare, Search } from 'lucide-react'
import { useState, useEffect, memo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useDarkMode } from '../../shared/hooks/useDarkMode'
import { useCurrentUser } from '../../context/AppContext'
import { NotificationDropdown } from '../ui/NotificationDropdown'
import { Button } from '../ui/button'
import { Image } from '../../shared/components/ui'
import { cn } from '../../lib/utils'
import { useUnreadStore } from '../../store/unreadStore'

const routeMeta: Record<string, { title: string; subtitle: string; icon?: string }> = {
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
  '/attendance': { title: 'الحضور والغياب', subtitle: 'متابعة حضور الطلاب اليومي' },
  '/schedule': { title: 'الجداول الدراسية', subtitle: 'جدول الحصص الأسبوعي' },
  '/agenda': { title: 'الأجندة', subtitle: 'متابعة المواعيد والمهام القادمة' },
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
  '/student-profile': { title: 'الملف الشخصي', subtitle: 'معلومات حسابك الشخصي' },
  '/teacher-profile': { title: 'الملف الشخصي', subtitle: 'معلومات حسابك الشخصي' },
  '/parent-profile': { title: 'الملف الشخصي', subtitle: 'معلومات حسابك الشخصي' },
}

export const Header = memo(() => {
  const [theme, setTheme] = useDarkMode()
  const location = useLocation()
  const currentUser = useCurrentUser()
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const dashboardPaths = ['/teacher-dashboard', '/student-dashboard', '/parent-dashboard', '/chat']
  if (
    !isDesktop &&
    dashboardPaths.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))
  )
    return null

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

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'h-16 lg:h-[72px]',
        'bg-surface dark:bg-card',
        'border-b border-border backdrop-blur-xl',
        'transition-all duration-300',
      )}
    >
      <div className="mx-auto flex h-full max-w-page items-center justify-between px-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Image
            src="/dareen_logo_new.webp"
            alt="دارين السابعة"
            className="hidden h-9 w-9 shrink-0 rounded-xl sm:block"
            imgClassName="object-contain"
          />
          {meta && (
            <div className="min-w-0">
              <h1 className="truncate text-sm font-extrabold leading-tight text-main lg:text-base">
                {meta.title}
              </h1>
              {isDesktop && meta.subtitle && (
                <p className="mt-0.5 truncate text-[11px] leading-snug text-muted">
                  {meta.subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:gap-3">
          {isDesktop && (
            <>
              <div className="relative hidden items-center xl:flex">
                <Search size={16} className="pointer-events-none absolute right-3 text-muted" />
                <input
                  type="text"
                  placeholder="بحث..."
                  aria-label="بحث"
                  className="h-9 w-[200px] rounded-xl border border-border bg-background pl-3 pr-9 text-xs text-main outline-none transition-colors placeholder:text-muted focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-px rounded-xl border border-border bg-background p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="hover:bg-accent/10 h-8 gap-1.5 rounded-lg px-2.5 text-muted hover:text-main"
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  <span className="hidden text-xs font-medium sm:inline">
                    {theme === 'dark' ? 'النهار' : 'الليل'}
                  </span>
                </Button>

                <div className="bg-border/60 h-5 w-px" />

                <NotificationDropdown showLabel />

                <div className="bg-border/60 h-5 w-px" />

                <Link
                  to="/chat"
                  className={cn(
                    'relative flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5',
                    'hover:bg-accent/10 text-muted transition-colors hover:text-main',
                  )}
                >
                  <MessageSquare size={15} />
                  <span className="hidden text-xs font-medium sm:inline">الدردشة</span>
                  {totalUnreadCount > 0 && (
                    <span className="absolute -start-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[9px] font-black leading-none text-on-error">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                </Link>
              </div>
            </>
          )}

          {!isDesktop && (
            <div className="flex items-center gap-px rounded-xl border border-border bg-background p-0.5">
              <Link
                to="/chat"
                aria-label="الدردشة"
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-lg',
                  'hover:bg-accent/10 text-muted transition-colors hover:text-main',
                )}
              >
                <MessageSquare size={17} />
                {totalUnreadCount > 0 && (
                  <span className="absolute -start-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[9px] font-black leading-none text-on-error">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </span>
                )}
              </Link>
              <NotificationDropdown />
            </div>
          )}

          <Link to={userLink} className="shrink-0" aria-label="الملف الشخصي">
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-primary transition-all hover:shadow-md">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <User size={15} className="text-on-primary" />
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
})
