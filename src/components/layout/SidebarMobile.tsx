import { NavLink } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '../ui/sheet';

interface NavItem {
    name: string;
    href: string;
    id: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

interface SidebarMobileProps {
    navigation: NavItem[];
    mobileMenuOpen: boolean;
    totalUnreadCount: number;
    academyName: string;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onLogout: () => void;
}

export const SidebarMobile = ({ navigation, mobileMenuOpen, totalUnreadCount, academyName, onToggleMenu, onCloseMenu, onLogout }: SidebarMobileProps) => (
    <>
        <div className="lg:hidden fixed bottom-0 end-0 start-0 h-[70px] bg-card/95 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 z-[100] overflow-hidden max-w-full transition-transform duration-300">
            {navigation.slice(0, 4).map((item) => (
                <NavLink key={`mobile-${item.href}-${item.id}`} to={item.href}
                    className={({ isActive }) => cn(
                        "flex items-center justify-center transition-all duration-500 rounded-full",
                        isActive ? "bg-primary-soft text-primary px-4 py-2" : "text-muted p-2"
                    )}
                >
                    {({ isActive }) => (
                        <div className="flex items-center gap-2 relative">
                            <span className={cn("text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-500", isActive ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0")}>{item.name}</span>
                            <div className="relative">
                                <item.icon size={20} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                                {item.id === 'chat' && totalUnreadCount > 0 && (
                                    <Badge variant="destructive" className="absolute -top-2 -start-2 h-4 min-w-[16px] px-1 text-[9px] leading-none flex items-center justify-center">
                                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </NavLink>
            ))}
            <Button variant="ghost" size="icon" onClick={onToggleMenu} className="text-muted hover:text-primary">
                <Menu size={22} />
            </Button>
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={(open) => !open && onCloseMenu()}>
            <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0 overflow-y-auto">
                <SheetHeader className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Image src="/dareen_logo_new.webp" alt="الشعار" className="w-8 h-8" imgClassName="object-contain" />
                        <div>
                            <SheetTitle className="text-base text-start">{academyName}</SheetTitle>
                            <SheetDescription className="text-micro text-start">قائمة الوصول السريع</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="p-3 space-y-1">
                    {navigation.map((item) => (
                        <NavLink key={`menu-${item.href}-${item.id}`} to={item.href} onClick={onCloseMenu}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 text-sm",
                                isActive ? "bg-primary-soft text-primary font-medium" : "text-muted hover:bg-hover hover:text-main"
                            )}
                        >
                            <div className="relative">
                                <item.icon size={18} />
                                {item.id === 'chat' && totalUnreadCount > 0 && (
                                    <Badge variant="destructive" className="absolute -top-2 -start-2 h-3.5 min-w-[14px] px-1 text-[8px] leading-none flex items-center justify-center">
                                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                    </Badge>
                                )}
                            </div>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="p-3 pt-2 border-t border-border mt-2">
                    <Button variant="destructive" size="sm" onClick={() => { onLogout(); onCloseMenu(); }} className="w-full gap-2">
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    </>
);
