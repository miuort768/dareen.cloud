import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, LogOut, CalendarDays } from 'lucide-react'
import { Image } from '../../shared/components/ui'
import { Badge } from '../ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { cn } from '../../lib/utils'
import type { NavSection, NavItem } from './Sidebar'

const getProfileLink = (role: string) => {
  if (role === 'student') return '/student-profile'
  if (role === 'parent') return '/parent-profile'
  return '/teacher-profile'
}

interface UserData {
  name: string
  avatar?: string
  role: string
}

interface SidebarDesktopProps {
  sections: NavSection[]
  collapsed: boolean
  totalUnreadCount: number
  user: UserData | null
  academicYear?: string
  onToggleCollapse: () => void
  onLogout: () => void
}

const roleLabels: Record<string, string> = {
  admin: 'مدير',
  teacher: 'معلمة',
  parent: 'ولي أمر',
  student: 'طالب',
}

interface SidebarLinkProps {
  item: NavItem
  collapsed: boolean
  totalUnreadCount: number
}

const SidebarLink = ({ item, collapsed, totalUnreadCount }: SidebarLinkProps) => (
  <NavLink
    to={item.href}
    className={({ isActive }) =>
      cn(
        'group relative flex items-center gap-2.5 overflow-visible rounded-xl text-sm transition-all duration-normal',
        collapsed ? 'mx-1 my-0 justify-center px-0 py-1.5' : 'mx-2 my-0.5 px-3 py-2',
        isActive
          ? 'bg-primary/10 font-semibold text-primary'
          : 'text-muted hover:bg-hover hover:text-main',
      )
    }
    title={collapsed ? item.name : ''}
  >
    <div className="relative shrink-0 transition-transform duration-normal group-hover:scale-110">
      <item.icon size={18} className="shrink-0" strokeWidth={1.8} />
      {item.id === 'chat' && totalUnreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -start-1.5 -top-1.5 flex h-3.5 min-w-[14px] items-center justify-center px-0.5 text-[8px] leading-none"
        >
          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
        </Badge>
      )}
    </div>
    <span
      className={cn(
        'whitespace-nowrap text-sm transition-all duration-slow',
        collapsed ? 'hidden w-0 opacity-0' : 'w-auto opacity-100',
      )}
    >
      {item.name}
    </span>
    {collapsed && (
      <div className="bg-popover text-popover-foreground pointer-events-none absolute end-full top-1/2 z-50 me-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg border border-border px-2.5 py-1.5 text-xs opacity-0 shadow-lg transition-all duration-fast group-hover:translate-x-0 group-hover:opacity-100">
        {item.name}
        <div className="bg-popover absolute -start-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-s border-t border-border" />
      </div>
    )}
  </NavLink>
)

export const SidebarDesktop = ({
  sections,
  collapsed,
  totalUnreadCount,
  user,
  academicYear,
  onToggleCollapse,
  onLogout,
}: SidebarDesktopProps) => (
  <div
    className={cn(
      'fixed start-0 top-0 z-50 hidden h-screen shrink-0 flex-col border-e border-border bg-card transition-all duration-slow lg:flex',
      collapsed ? 'w-16' : 'w-56',
    )}
  >
    {/* Logo */}
    <div
      className={cn(
        'flex shrink-0 items-center border-b border-border transition-all duration-slow',
        collapsed ? 'h-11 justify-center px-0' : 'h-14 justify-between px-5',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2.5 overflow-hidden whitespace-nowrap',
          collapsed && 'gap-0',
        )}
      >
        <div
          className={cn(
            'shrink-0 overflow-hidden rounded-xl transition-all duration-slow',
            collapsed ? 'h-7 w-7' : 'h-8 w-8',
          )}
        >
          <Image
            src="/dareen_logo_new.webp"
            alt="الشعار"
            className="h-full w-full"
            imgClassName="object-contain"
          />
        </div>
        <span
          className={cn(
            'whitespace-nowrap text-sm font-bold text-main transition-all duration-slow',
            collapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100',
          )}
        >
          دارين السابعة
        </span>
      </div>
      {academicYear && (
        <span
          className={cn(
            'shrink-0 overflow-hidden transition-all duration-slow',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          )}
        >
          <span className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-primary-soft px-2 py-1 text-[10px] font-bold text-primary">
            <CalendarDays size={11} />
            {academicYear}
          </span>
        </span>
      )}
    </div>

    {/* Navigation */}
    <nav
      className={cn(
        'custom-scrollbar min-h-0 flex-1 overflow-y-auto transition-all duration-slow',
        collapsed ? 'py-1.5' : 'py-3',
      )}
      data-sidebar-nav
    >
      {sections.map((section, sIdx) => (
        <div key={section.label} className={cn(sIdx > 0 && (collapsed ? 'mt-0' : 'mt-1'))}>
          <div
            className={cn(
              'overflow-hidden transition-all duration-slow',
              collapsed ? 'h-0 opacity-0' : 'h-auto opacity-100',
            )}
          >
            <span className="block px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
              {section.label}
            </span>
          </div>
          {section.items.map((item) => (
            <SidebarLink
              key={`${item.href}-${item.id}`}
              item={item}
              collapsed={collapsed}
              totalUnreadCount={totalUnreadCount}
            />
          ))}
        </div>
      ))}
    </nav>

    {/* User profile + actions */}
    <div className="shrink-0 border-t border-border">
      {user && (
        <NavLink
          to={getProfileLink(user.role)}
          className={({ isActive }) =>
            cn(
              'group flex items-center rounded-xl transition-all duration-slow',
              collapsed ? 'mx-1 mt-1.5 justify-center py-1.5' : 'mx-2 mt-2 gap-2.5 px-3 py-2',
              isActive ? 'bg-primary/10 text-primary' : 'text-main hover:bg-hover',
            )
          }
        >
          <Avatar
            className={cn(
              'shrink-0 transition-all duration-slow group-hover:scale-105',
              collapsed ? 'h-7 w-7' : 'h-8 w-8',
            )}
          >
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {user.name?.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div
            className={cn(
              'overflow-hidden transition-all duration-slow',
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
            )}
          >
            <p className="truncate text-xs font-semibold leading-tight text-main">{user.name}</p>
            <p className="truncate text-[10px] leading-tight text-muted">
              {roleLabels[user.role] || user.role}
            </p>
          </div>
        </NavLink>
      )}
      <div
        className={cn(
          'transition-all duration-slow',
          collapsed ? 'space-y-0 px-1.5 pb-1.5' : 'space-y-0.5 px-2 pb-2',
        )}
      >
        <button
          onClick={onToggleCollapse}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl text-muted transition-all duration-normal hover:bg-hover hover:text-main',
            collapsed ? 'justify-center px-0 py-1.5' : 'px-3 py-2',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} strokeWidth={1.8} />
          ) : (
            <>
              <PanelLeftClose size={18} strokeWidth={1.8} />
              <span className="text-sm">تصغير</span>
            </>
          )}
        </button>
        <button
          onClick={onLogout}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl text-error transition-all duration-normal hover:bg-error-soft hover:text-error',
            collapsed ? 'justify-center px-0 py-1.5' : 'px-3 py-2',
          )}
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span
            className={cn(
              'whitespace-nowrap text-sm transition-all duration-slow',
              collapsed ? 'hidden' : '',
            )}
          >
            خروج
          </span>
        </button>
      </div>
    </div>
  </div>
)
