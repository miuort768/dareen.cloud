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
        <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMenu}
            aria-label="فتح القائمة"
            className="lg:hidden fixed bottom-20 start-3 z-[60] h-10 w-10 rounded-full bg-card/90 backdrop-blur-xl border border-border shadow-lg text-muted hover:text-primary"
        >
            <Menu size={18} />
        </Button>

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

                <nav aria-label="قائمة التنقل السريع" className="p-3 space-y-1">
                    {navigation.map((item) => (
                        <NavLink key={`menu-${item.href}-${item.id}`} to={item.href} onClick={onCloseMenu}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 text-sm",
                                isActive ? "bg-primary-soft text-primary font-medium" : "text-muted hover:bg-hover hover:text-main"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="relative">
                                        <item.icon size={18} aria-hidden="true" />
                                        {item.id === 'chat' && totalUnreadCount > 0 && (
                                            <Badge variant="destructive" className="absolute -top-2 -start-2 h-3.5 min-w-[14px] px-1 text-micro leading-none flex items-center justify-center">
                                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                    <span>{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

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
