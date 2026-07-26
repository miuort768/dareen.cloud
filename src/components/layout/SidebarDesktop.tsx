import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/utils';
import type { NavSection, NavItem } from './Sidebar';

interface UserData {
    name: string;
    avatar?: string;
    role: string;
}

interface SidebarDesktopProps {
    sections: NavSection[];
    collapsed: boolean;
    totalUnreadCount: number;
    user: UserData | null;
    onToggleCollapse: () => void;
    onLogout: () => void;
}

const roleLabels: Record<string, string> = {
    admin: 'مدير',
    teacher: 'معلمة',
    parent: 'ولي أمر',
    student: 'طالب',
};

interface SidebarLinkProps {
    item: NavItem;
    collapsed: boolean;
    totalUnreadCount: number;
}

const SidebarLink = ({ item, collapsed, totalUnreadCount }: SidebarLinkProps) => (
    <NavLink
        to={item.href}
        className={({ isActive }) => cn(
            "flex items-center gap-2.5 transition-all duration-200 group relative rounded-xl text-sm overflow-visible",
            collapsed ? "justify-center mx-1 my-0 px-0 py-1.5" : "mx-2 my-0.5 px-3 py-2",
            isActive
                ? "bg-primary/10 text-primary font-semibold before:absolute before:-start-0.5 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary"
                : "text-muted hover:bg-hover hover:text-main"
        )}
        title={collapsed ? item.name : ''}
    >
        <div className="relative shrink-0 transition-transform duration-200 group-hover:scale-110">
            <item.icon size={18} className="shrink-0" strokeWidth={1.8} />
            {item.id === 'chat' && totalUnreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1.5 -start-1.5 h-3.5 min-w-[14px] px-0.5 text-[8px] leading-none flex items-center justify-center">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </Badge>
            )}
        </div>
        <span className={cn(
            "whitespace-nowrap transition-all duration-300 text-[13px]",
            collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
        )}>
            {item.name}
        </span>
        {collapsed && (
            <div className="absolute end-full top-1/2 -translate-y-1/2 me-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-border transition-all duration-150 group-hover:translate-x-0 translate-x-1">
                {item.name}
                <div className="absolute top-1/2 -translate-y-1/2 -start-1.5 w-2.5 h-2.5 bg-popover border-s border-t border-border rotate-45" />
            </div>
        )}
    </NavLink>
);

export const SidebarDesktop = ({ sections, collapsed, totalUnreadCount, user, onToggleCollapse, onLogout }: SidebarDesktopProps) => (
    <div className={cn(
        "hidden lg:flex bg-card h-screen border-e border-border transition-all duration-300 flex-col fixed top-0 start-0 z-50 shrink-0",
        collapsed ? "w-16" : "w-56"
    )}>
        {/* Logo */}
        <div className={cn(
            "flex items-center shrink-0 transition-all duration-300 border-b border-border/50",
            collapsed ? "h-11 justify-center px-0" : "h-14 justify-between px-5"
        )}>
            <div className={cn("flex items-center gap-2.5 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                <div className={cn(
                    "shrink-0 transition-all duration-300 rounded-xl overflow-hidden",
                    collapsed ? "w-7 h-7" : "w-8 h-8"
                )}>
                    <Image src="/dareen_logo_new.webp" alt="الشعار" className="w-full h-full" imgClassName="object-contain" />
                </div>
                <span className={cn(
                    "font-bold text-sm text-main transition-all duration-300 whitespace-nowrap",
                    collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                )}>
                    دارين السابعة
                </span>
            </div>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 overflow-y-auto custom-scrollbar transition-all duration-300", collapsed ? "py-1.5" : "py-3")} data-sidebar-nav>
            {sections.map((section, sIdx) => (
                <div key={section.label} className={cn(sIdx > 0 && (collapsed ? "mt-0" : "mt-1"))}>
                    <div className={cn(
                        "transition-all duration-300 overflow-hidden",
                        collapsed ? "h-0 opacity-0" : "h-auto opacity-100"
                    )}>
                        <span className="px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted/50 block">
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
        <div className="shrink-0 border-t border-border/50">
            {user && (
                <div className={cn(
                    "flex items-center transition-all duration-300 rounded-xl",
                    collapsed ? "justify-center mx-1 mt-1.5 py-1.5" : "mx-2 mt-2 gap-2.5 px-3 py-2"
                )}>
                    <Avatar className={cn("shrink-0 transition-all duration-300", collapsed ? "w-7 h-7" : "w-8 h-8")}>
                        {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                        ) : (
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {user.name?.charAt(0)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className={cn(
                        "transition-all duration-300 overflow-hidden",
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                        <p className="text-xs font-semibold text-main truncate leading-tight">{user.name}</p>
                        <p className="text-[10px] text-muted truncate leading-tight">{roleLabels[user.role] || user.role}</p>
                    </div>
                </div>
            )}
            <div className={cn("transition-all duration-300", collapsed ? "px-1.5 pb-1.5 space-y-0" : "px-2 pb-2 space-y-0.5")}>
                <button
                    onClick={onToggleCollapse}
                    className={cn(
                        "flex items-center gap-2.5 w-full transition-all duration-200 text-muted hover:text-main hover:bg-hover rounded-xl",
                        collapsed ? "justify-center px-0 py-1.5" : "px-3 py-2"
                    )}
                >
                    {collapsed ? (
                        <PanelLeftOpen size={18} strokeWidth={1.8} />
                    ) : (
                        <>
                            <PanelLeftClose size={18} strokeWidth={1.8} />
                            <span className="text-[13px]">تصغير</span>
                        </>
                    )}
                </button>
                <button
                    onClick={onLogout}
                    className={cn(
                        "flex items-center gap-2.5 w-full transition-all duration-200 text-error/70 hover:text-error hover:bg-error-soft rounded-xl",
                        collapsed ? "justify-center px-0 py-1.5" : "px-3 py-2"
                    )}
                >
                    <LogOut size={18} strokeWidth={1.8} />
                    <span className={cn(
                        "whitespace-nowrap text-[13px] transition-all duration-300",
                        collapsed ? "hidden" : ""
                    )}>
                        خروج
                    </span>
                </button>
            </div>
        </div>
    </div>
);
