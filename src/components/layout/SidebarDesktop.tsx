import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import type { NavSection } from './Sidebar';

interface SidebarDesktopProps {
    sections: NavSection[];
    collapsed: boolean;
    totalUnreadCount: number;
    onToggleCollapse: () => void;
    onLogout: () => void;
}

export const SidebarDesktop = ({ sections, collapsed, totalUnreadCount, onToggleCollapse, onLogout }: SidebarDesktopProps) => (
    <div className={cn(
        "hidden lg:flex bg-card h-screen border-e border-border transition-all duration-300 flex-col fixed top-0 start-0 z-50 shrink-0",
        collapsed ? "w-16" : "w-56"
    )}>
        {/* Logo */}
        <div className={cn(
            "h-14 flex items-center shrink-0 transition-all duration-300",
            collapsed ? "justify-center px-0" : "justify-between px-5"
        )}>
            <div className={cn("flex items-center gap-2.5 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                <div className={cn("shrink-0 transition-all duration-300", collapsed ? "w-8 h-8" : "w-7 h-7")}>
                    <Image src="/dareen_logo_new.webp" alt="الشعار" className="w-full h-full" imgClassName="object-contain" />
                </div>
                <span className={cn(
                    "font-semibold text-sm text-main transition-all duration-300 whitespace-nowrap",
                    collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                )}>
                    دارين
                </span>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto custom-scrollbar" data-sidebar-nav>
            {sections.map((section, sIdx) => (
                <div key={section.label} className={cn(sIdx > 0 && "mt-3")}>
                    {/* Section label */}
                    <div className={cn(
                        "transition-all duration-300 overflow-hidden",
                        collapsed ? "h-0 opacity-0" : "h-auto opacity-100"
                    )}>
                        <span className="px-5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted/60 block">
                            {section.label}
                        </span>
                    </div>

                    {/* Section items */}
                    {section.items.map((item) => (
                        <NavLink
                            key={`${item.href}-${item.id}`}
                            to={item.href}
                            className={({ isActive }) => cn(
                                "flex items-center gap-2.5 mx-2 my-0.5 transition-all duration-200 group relative rounded-lg text-sm",
                                collapsed ? "justify-center px-0 py-2" : "px-2.5 py-1.5",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium border-s-2 border-primary"
                                    : "text-muted hover:bg-hover hover:text-main border-s-2 border-transparent"
                            )}
                            title={collapsed ? item.name : ''}
                        >
                            <div className="relative shrink-0">
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

                            {/* Collapsed tooltip */}
                            {collapsed && (
                                <div className="absolute end-full top-1/2 -translate-y-1/2 me-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-border transition-opacity duration-150">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </div>
            ))}
        </nav>

        {/* Bottom actions */}
        <div className="shrink-0 border-t border-border py-2">
            {/* Collapse toggle */}
            <button
                onClick={onToggleCollapse}
                className={cn(
                    "flex items-center gap-2.5 w-full transition-all duration-200 text-muted hover:text-main hover:bg-hover rounded-lg mx-2",
                    collapsed ? "justify-center px-0 py-2" : "px-2.5 py-1.5"
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

            {/* Logout */}
            <button
                onClick={onLogout}
                className={cn(
                    "flex items-center gap-2.5 w-full transition-all duration-200 text-error/80 hover:text-error hover:bg-error-soft rounded-lg mx-2",
                    collapsed ? "justify-center px-0 py-2" : "px-2.5 py-1.5"
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
);
