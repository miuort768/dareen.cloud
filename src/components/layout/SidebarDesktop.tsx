import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface NavItem {
    name: string;
    href: string;
    id: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

interface SidebarDesktopProps {
    navigation: NavItem[];
    collapsed: boolean;
    totalUnreadCount: number;
    onToggleCollapse: () => void;
    onLogout: () => void;
}

export const SidebarDesktop = ({ navigation, collapsed, totalUnreadCount, onToggleCollapse, onLogout }: SidebarDesktopProps) => (
    <div className={cn("hidden lg:flex bg-card h-screen border-e border-border transition-all duration-300 flex-col fixed top-0 start-0 z-50 shrink-0", collapsed ? "w-20" : "w-72")}>
        <div className={cn("h-14 items-center border-b border-border transition-all duration-300", collapsed ? "flex justify-center px-0" : "hidden xl:flex justify-between px-6")}>
            <div className={cn("flex items-center gap-2 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                <div className={cn("shrink-0", collapsed ? "w-8 h-8" : "w-6 h-6")}>
                    <Image src="/dareen_logo_new.webp" alt="الشعار" className="w-full h-full" imgClassName="object-contain" />
                </div>
                <span className={cn("font-medium text-lg text-main transition-all duration-300 uppercase tracking-tighter", collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100 pe-3")}>
                    نظام دارين السابعة
                </span>
            </div>
        </div>

        <nav data-sidebar-nav className={cn("flex-1 py-2 space-y-0.5 overflow-y-auto custom-scrollbar", collapsed ? "px-2" : "px-4")}>
            {navigation.map((item) => (
                <NavLink key={`${item.href}-${item.id}`} to={item.href}
                    className={({ isActive }) => cn(
                        "flex items-center gap-2.5 px-3 py-1.5 transition-all duration-200 group relative text-sm rounded-lg",
                        isActive ? "bg-primary-soft text-primary font-medium" : "text-muted hover:bg-hover hover:text-main",
                        collapsed && "justify-center py-2"
                    )}
                    title={collapsed ? item.name : ''}
                >
                    <div className="relative shrink-0">
                        <item.icon size={collapsed ? 20 : 18} className="shrink-0" strokeWidth={collapsed ? 2.5 : 2} />
                        {item.id === 'chat' && totalUnreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-2 -start-2 h-4 min-w-[16px] px-1 text-[9px] leading-none flex items-center justify-center">
                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                            </Badge>
                        )}
                    </div>
                    <span className={cn("whitespace-nowrap transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>{item.name}</span>
                    {collapsed && (
                        <div className="absolute end-full top-1/2 -translate-y-1/2 ms-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-border">
                            {item.name}
                        </div>
                    )}
                </NavLink>
            ))}
        </nav>

        <div className="px-4 pt-2 pb-0 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="w-full flex items-center gap-3 justify-start text-muted">
                {collapsed ? <ChevronRight size={18} className="mx-auto" /> : <><ChevronLeft size={18} /><span>تصغير القائمة</span></>}
            </Button>
        </div>

        <div className="px-4 pb-4 pt-2">
            <Button variant="ghost" size="sm" onClick={onLogout} className={cn("w-full flex items-center gap-3 text-error hover:text-error hover:bg-error-soft", collapsed && "justify-center")}>
                <LogOut size={18} />
                <span className={cn("whitespace-nowrap", collapsed ? "hidden" : "")}>تسجيل الخروج</span>
            </Button>
        </div>
    </div>
);
