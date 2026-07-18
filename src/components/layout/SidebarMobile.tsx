import { NavLink } from 'react-router-dom';
import { X, Menu, LogOut } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';

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
                <NavLink key={`mobile-${item.href}-${item.id}`} to={item.href} className={({ isActive }) => cn("flex items-center justify-center transition-all duration-500 rounded-full", isActive ? "bg-primary-soft text-primary px-4 py-2" : "text-muted p-2")}>
                    {({ isActive }) => (
                        <div className="flex items-center gap-2 relative">
                            <span className={cn("text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-500", isActive ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0")}>{item.name}</span>
                            <div className="relative">
                                <item.icon size={20} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                                {item.id === 'chat' && totalUnreadCount > 0 && (
                                    <span className="absolute -top-2 -start-2 w-5 h-5 bg-error text-on-error text-micro font-medium flex items-center justify-center rounded-full ring-2 ring-border shadow-sm md:animate-pulse">
                                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </NavLink>
            ))}
            <button onClick={onToggleMenu} className="flex items-center justify-center p-2 text-muted hover:text-primary transition-colors">
                <Menu size={22} strokeWidth={2} />
            </button>
        </div>

        <div className={cn("fixed inset-0 z-[110] bg-background/40 backdrop-blur-md lg:hidden transition-all duration-500 overflow-hidden", mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
            <div className="absolute inset-0" onClick={onCloseMenu} />
            <div className={cn("absolute bottom-0 end-0 start-0 bg-card p-4 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden max-h-[90vh] flex flex-col border-t border-white/10 w-full max-w-full", mobileMenuOpen ? "translate-y-0" : "translate-y-full")}>
                <div className="w-12 h-1 bg-surface mx-auto mb-4 shrink-0" />

                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Image src="/dareen_logo_new.webp" alt="الشعار" className="w-8 h-8" imgClassName="object-contain" />
                        <div>
                            <h2 className="text-base font-medium text-main leading-tight">{academyName}</h2>
                            <p className="text-micro text-muted font-normal uppercase tracking-widest">قائمة الوصول السريع</p>
                        </div>
                    </div>
                    <button onClick={onCloseMenu} className="p-3 bg-error text-on-error rounded-xl hover:bg-error-hover transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pt-1 pb-4 px-1">
                    <div className="grid grid-cols-2 gap-2">
                        {navigation.map((item) => (
                            <NavLink key={`menu-${item.href}-${item.id}`} to={item.href} onClick={onCloseMenu} className={({ isActive }) => cn("flex items-center gap-2 py-1.5 px-2.5 rounded-xl transition-all duration-200", isActive ? "bg-primary-soft text-primary shadow-sm border border-primary-soft" : "bg-surface text-muted hover:bg-hover")}>
                                {({ isActive }) => (
                                    <>
                                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all relative", isActive ? "bg-card text-primary shadow-sm" : "bg-card/50 text-muted")}>
                                            <item.icon size={14} />
                                            {item.id === 'chat' && totalUnreadCount > 0 && (
                                                <span className="absolute -top-1 -start-1 w-3.5 h-3.5 flex items-center justify-center bg-error text-on-error text-micro font-medium rounded-full shadow-sm border border-border">
                                                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-normal tracking-tight truncate">{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                        <button onClick={() => { onLogout(); onCloseMenu(); }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-none bg-error text-on-error font-normal hover:bg-error-hover transition-colors shadow-md">
                            <LogOut size={16} />
                            <span className="uppercase tracking-widest text-micro">تسجيل الخروج</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
);
