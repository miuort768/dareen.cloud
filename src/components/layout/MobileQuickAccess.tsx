import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, CalendarDays, ChevronLeft, Sparkles, X, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Image } from '../../shared/components/ui'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../ui/sheet'
import { cn } from '../../lib/utils'
import { useCurrentUser } from '../../context/AppContext'

interface NavItem {
  name: string
  href: string
  id: string
  icon: LucideIcon
}

interface MobileQuickAccessProps {
  navigation: NavItem[]
  mobileMenuOpen: boolean
  totalUnreadCount: number
  academyName: string
  academicYear?: string
  onCloseMenu: () => void
  onLogout: () => void
}

/** Priority page-ids per role — matched against permission-filtered navigation */
const FEATURED_BY_ROLE: Record<string, string[]> = {
  admin: ['students', 'teachers', 'parents', 'finance'],
  teacher: ['attendance', 'evaluations', 'schedule'],
  parent: ['parent_students', 'parent_announcements', 'chat', 'parent_payment_history'],
  student: ['student_dashboard', 'forum', 'schedule', 'chat'],
}

const getProfileLink = (role: string) => {
  if (role === 'student') return '/student-profile'
  if (role === 'parent') return '/parent-profile'
  if (role === 'admin') return '/settings'
  return '/teacher-profile'
}

const roleLabels: Record<string, string> = {
  admin: 'مدير',
  teacher: 'معلمة',
  parent: 'ولي أمر',
  student: 'طالب',
}

const TILE_STYLES = [
  'bg-primary-soft text-primary',
  'bg-info-soft text-info',
  'bg-success-soft text-success',
  'bg-warning-soft text-warning',
] as const

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export const MobileQuickAccess = ({
  navigation,
  mobileMenuOpen,
  totalUnreadCount,
  academyName,
  academicYear,
  onCloseMenu,
  onLogout,
}: MobileQuickAccessProps) => {
  const currentUser = useCurrentUser()
  const role = currentUser?.role ?? 'admin'

  const priorityIds = FEATURED_BY_ROLE[role] ?? FEATURED_BY_ROLE['admin'] ?? []

  const byId = new Map(navigation.map((n) => [n.id, n]))
  const featured = priorityIds
    .map((id) => byId.get(id))
    .filter((n): n is NavItem => Boolean(n))
    .slice(0, 4)
  const featuredIds = new Set(featured.map((f) => f.id))
  const rest = navigation.filter((n) => !featuredIds.has(n.id))

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={(open) => !open && onCloseMenu()}>
      <SheetContent
        side="bottom"
        className="flex max-h-[88dvh] flex-col gap-0 rounded-t-[28px] border border-border p-0 dark:border-white/10 sm:max-w-none"
      >
        <SheetTitle className="sr-only">قائمة الوصول السريع</SheetTitle>
        <SheetDescription className="sr-only">
          تنقل سريع بين جميع صفحات {academyName}
        </SheetDescription>

        {/* Grabber */}
        <div className="flex shrink-0 justify-center pt-2">
          <div className="h-1.5 w-11 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center gap-2.5 px-4 pb-2 pt-1.5">
          <Image
            src="/dareen_logo_new.webp"
            alt=""
            className="h-11 w-11 rounded-2xl"
            imgClassName="object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-main">{academyName}</p>
            <p className="mt-0.5 flex items-center gap-1 text-micro font-bold text-primary">
              <Sparkles size={11} />
              الوصول السريع
            </p>
          </div>
          {academicYear && (
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-primary-soft px-2 py-1 text-[10px] font-bold text-primary">
              <CalendarDays size={11} />
              {academicYear}
            </span>
          )}
          <button
            onClick={onCloseMenu}
            aria-label="إغلاق القائمة"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-error-soft bg-error-soft text-error shadow-sm outline-none transition-all duration-200 hover:bg-error hover:text-on-error hover:shadow-md focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-1">
          {featured.length > 0 && (
            <motion.section
              variants={container}
              initial="hidden"
              animate="show"
              aria-label="الأكثر استخدامًا"
            >
              <motion.p
                variants={item}
                className="mb-1 text-micro font-black uppercase tracking-label text-muted"
              >
                الأكثر استخدامًا
              </motion.p>
              <div className="grid grid-cols-4 gap-1.5">
                {featured.map((navItem, i) => {
                  const Icon = navItem.icon
                  return (
                    <motion.div key={`feat-${navItem.id}`} variants={item}>
                      <NavLink
                        to={navItem.href}
                        onClick={onCloseMenu}
                        aria-label={navItem.name}
                        className={({ isActive }) =>
                          cn(
                            'group flex touch-manipulation flex-col items-center gap-1 rounded-2xl border p-1.5 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.95]',
                            isActive
                              ? 'border-primary/40 bg-primary-soft dark:bg-primary/15'
                              : 'border-border bg-surface hover:bg-hover dark:bg-card',
                          )
                        }
                      >
                        <span
                          className={cn(
                            'flex h-9 w-full items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
                            TILE_STYLES[i % TILE_STYLES.length],
                          )}
                        >
                          <Icon size={21} strokeWidth={1.9} />
                        </span>
                        <span className="line-clamp-1 w-full truncate text-center text-[10px] font-bold leading-tight text-main">
                          {navItem.name}
                        </span>
                      </NavLink>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          )}

          {rest.length > 0 && (
            <motion.section
              variants={container}
              initial="hidden"
              animate="show"
              transition={{ delayChildren: 0.1 }}
              className="mt-2.5"
              aria-label="جميع الصفحات"
            >
              <motion.p
                variants={item}
                className="mb-1 text-micro font-black uppercase tracking-label text-muted"
              >
                جميع الصفحات
              </motion.p>
              <div>
                {rest.map((navItem) => {
                  const Icon = navItem.icon
                  return (
                    <motion.div key={`row-${navItem.id}`} variants={item}>
                      <NavLink
                        to={navItem.href}
                        onClick={onCloseMenu}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 rounded-xl px-2 py-1.5 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus',
                            isActive
                              ? 'bg-primary-soft font-bold text-primary'
                              : 'text-muted hover:bg-hover hover:text-main',
                          )
                        }
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                          <Icon size={15} strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {navItem.name}
                        </span>
                        {navItem.id === 'chat' && totalUnreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="flex h-4 min-w-[16px] items-center justify-center px-1 text-[8px] leading-none"
                          >
                            {totalUnreadCount > 99 ? '+99' : totalUnreadCount}
                          </Badge>
                        )}
                        <ChevronLeft size={14} className="shrink-0 opacity-40 rtl:rotate-180" />
                      </NavLink>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-2.5 dark:border-white/10">
          {currentUser && (
            <Link
              to={getProfileLink(currentUser.role ?? '')}
              onClick={onCloseMenu}
              aria-label="الملف الشخصي"
              className="mb-1.5 flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2 text-start outline-none transition-colors duration-150 hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus dark:bg-card"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-black text-on-primary">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : currentUser.name ? (
                  currentUser.name.charAt(0)
                ) : (
                  <User size={16} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-black leading-tight text-main">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] font-bold leading-tight text-muted">
                  {roleLabels[currentUser.role ?? ''] ?? 'حسابي'} • الملف الشخصي
                </span>
              </span>
              <ChevronLeft size={14} className="shrink-0 opacity-40 rtl:rotate-180" />
            </Link>
          )}
          <Button
            variant="destructive"
            onClick={() => {
              onLogout()
              onCloseMenu()
            }}
            className="h-10 w-full gap-2 rounded-xl"
          >
            <LogOut size={16} className="rtl:rotate-180" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
