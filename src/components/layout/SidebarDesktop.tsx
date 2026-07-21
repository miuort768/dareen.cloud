import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, LayoutDashboard, Ellipsis } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';
import type { NavItem, NavGroup } from './Sidebar';

interface SidebarDesktopProps {
    navigation: NavItem[];
    navigationGroups: NavGroup[];
    collapsed: boolean;
    totalUnreadCount: number;
    onToggleCollapse: () => void;
    onLogout: () => void;
}

const NavLinkItem = ({ item, collapsed, totalUnreadCount }: { item: NavItem; collapsed: boolean; totalUnreadCount: number }) => (
    <NavLink
        to={item.href}
        className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 transition-all duration-200 group relative text-sm rounded-xl",
            "hover:bg-accent/50",
            isActive
                ? "bg-accent text-accent-foreground font-medium shadow-sm"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
            collapsed && "justify-center px-2 py-2.5"
        )}
        title={collapsed ? item.name : ''}
    >
        {({ isActive }) => (
            <>
                {isActive && !collapsed && (
                    <span className="absolute end-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                )}
                <div className="relative shrink-0">
                    <item.icon
                        size={collapsed ? 20 : 18}
                        className="shrink-0"
                        strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.id === 'chat' && totalUnreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -end-2 h-4 min-w-[16px] px-1 text-micro leading-none flex items-center justify-center">
                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                        </Badge>
                    )}
                </div>
                <span className={cn(
                    "whitespace-nowrap transition-all duration-200",
                    collapsed ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100"
                )}>
                    {item.name}
                </span>
                {collapsed && (
                    <div className="absolute end-full top-1/2 -translate-y-1/2 ms-2 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none whitespace-nowrap z-50 shadow-lg border border-border transition-all duration-200">
                        {item.name}
                    </div>
                )}
            </>
        )}
    </NavLink>
);

export const SidebarDesktop = ({ navigationGroups, collapsed, totalUnreadCount, onToggleCollapse, onLogout }: SidebarDesktopProps) => (
    <aside className={cn(
        "hidden lg:flex bg-sidebar border-l border-sidebar-border h-screen flex-col fixed top-0 start-0 z-50 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
    )}>
        {/* Logo Area */}
        <div className={cn(
            "flex items-center h-16 px-4 border-b border-sidebar-border shrink-0",
            collapsed ? "justify-center px-0" : "gap-3"
        )}>
            <div className={cn("shrink-0 relative", collapsed ? "w-9 h-9" : "w-8 h-8")}>
                <Image src="/dareen_logo_new.webp" alt="الشعار" className="w-full h-full" imgClassName="object-contain" />
            </div>
            <div className={cn(
                "overflow-hidden transition-all duration-300",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
                <span className="block text-sm font-semibold text-sidebar-foreground leading-tight">دارين</span>
                <span className="block text-micro text-sidebar-foreground/50 leading-tight">نظام الإدارة</span>
            </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3 px-2">
            <nav className="space-y-4">
                {navigationGroups.map((group) => (
                    <div key={group.label}>
                        {!collapsed && (
                            <div className="flex items-center gap-2 px-3 mb-1.5">
                                {group.icon && (
                                    <group.icon size={12} className="text-sidebar-foreground/30" strokeWidth={1.5} />
                                )}
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
                                    {group.label}
                                </span>
                                <div className="flex-1 h-px bg-sidebar-border" />
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavLinkItem
                                    key={`${item.href}-${item.id}`}
                                    item={item}
                                    collapsed={collapsed}
                                    totalUnreadCount={totalUnreadCount}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="border-t border-sidebar-border p-2 space-y-1 shrink-0">
            <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className={cn(
                    "w-full flex items-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                    collapsed ? "justify-center h-9 px-0" : "justify-start gap-2 px-3"
                )}
            >
                {collapsed ? <ChevronRight size={16} /> : <><ChevronRight size={16} /><span className="text-xs">تصغير القائمة</span></>}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className={cn(
                    "w-full flex items-center text-sidebar-foreground/50 hover:text-error hover:bg-error/10",
                    collapsed ? "justify-center h-9 px-0" : "justify-start gap-2 px-3"
                )}
            >
                <LogOut size={16} />
                <span className={cn("text-xs", collapsed ? "hidden" : "")}>تسجيل الخروج</span>
            </Button>
        </div>
    </aside>
);
