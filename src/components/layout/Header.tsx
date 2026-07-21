import { Sun, Moon, User, Search, Bell, ChevronLeft, Command } from 'lucide-react';
import { useState, useEffect, memo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useDarkMode } from '../../shared/hooks/useDarkMode';
import { useCurrentUser } from '../../context/AppContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

export const Header = memo(() => {
    const [theme, setTheme] = useDarkMode();
    const location = useLocation();
    const currentUser = useCurrentUser();
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') setSearchOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getBreadcrumbs = (path: string) => {
        const segments = path.split('/').filter(Boolean);
        const breadcrumbs: { label: string; href: string }[] = [];
        let current = '';
        for (const seg of segments) {
            current += `/${seg}`;
            const label = titles[current] || seg.replace(/-/g, ' ');
            breadcrumbs.push({ label, href: current });
        }
        return breadcrumbs;
    };

    const titles: Record<string, string> = {
        '/admin-dashboard': 'لوحة التحكم',
        '/teacher-dashboard': 'لوحة التحكم',
        '/parent-dashboard': 'لوحة التحكم',
        '/student-dashboard': 'لوحة التحكم',
        '/students': 'الطلاب',
        '/parents': 'أولياء الأمور',
        '/teachers': 'المعلمات',
        '/finance': 'المالية',
        '/student-invoices': 'فواتير الطلاب',
        '/teacher-invoices': 'فواتير المعلمات',
        '/attendance': 'الحضور والغياب',
        '/schedule': 'الجداول الدراسية',
        '/agenda': 'الأجندة',
        '/appointments': 'المواعيد',
        '/tasks': 'المهام',
        '/announcements': 'الإعلانات',
        '/chat': 'المحادثات',
        '/reports': 'التقارير',
        '/forum': 'المنتدى',
        '/settings': 'الإعدادات',
        '/evaluations': 'التقييمات',
        '/monthly-closing': 'الإقفال الشهري',
        '/leads': 'العملاء المحتملين',
        '/trial-sessions': 'جلسات المراجعة',
        '/admin-contacts': 'رسائل الاتصال',
        '/admin-jobs': 'طلبات التوظيف',
        '/admin/blog': 'المدونة',
    };

    const breadcrumbs = getBreadcrumbs(location.pathname);

    const userLink = currentUser?.role === 'admin' ? '/settings' : currentUser?.role === 'parent' ? '/parent-dashboard' : currentUser?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard';

    return (
        <>
            <header className={cn(
                "sticky top-0 z-40 w-full h-16 px-4 md:px-6",
                "bg-background/80 backdrop-blur-xl border-b border-border/50",
                "flex items-center justify-between gap-4"
            )}>
                {/* Left: Breadcrumbs */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isDesktop && breadcrumbs.length > 0 && (
                        <nav className="flex items-center gap-1.5 text-sm text-muted">
                            <Link to="/admin-dashboard" className="hover:text-main transition-colors">
                                <LayoutDashboardIcon className="w-4 h-4" />
                            </Link>
                            {breadcrumbs.map((crumb, i) => (
                                <span key={crumb.href} className="flex items-center gap-1.5">
                                    <ChevronLeft size={14} className="text-dim" />
                                    <Link
                                        to={crumb.href}
                                        className={cn(
                                            "hover:text-main transition-colors truncate max-w-[120px]",
                                            i === breadcrumbs.length - 1 ? "text-main font-medium" : "text-muted"
                                        )}
                                    >
                                        {crumb.label}
                                    </Link>
                                </span>
                            ))}
                        </nav>
                    )}
                    {!isDesktop && (
                        <h1 className="text-sm font-bold text-main truncate">
                            {breadcrumbs[breadcrumbs.length - 1]?.label || 'لوحة التحكم'}
                        </h1>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                    {/* Search */}
                    {isDesktop && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchOpen(true)}
                            className="relative h-9 w-[200px] justify-start gap-2 text-muted text-xs font-normal border-border/50 bg-card/50"
                        >
                            <Search size={14} className="shrink-0" />
                            <span>بحث...</span>
                            <kbd className="absolute end-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted bg-background rounded border border-border/50">
                                <Command size={10} />K
                            </kbd>
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchOpen(true)}
                        className="md:hidden h-9 w-9"
                    >
                        <Search size={16} />
                    </Button>

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="h-9 w-9 text-muted hover:text-main"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </Button>

                    {/* Notifications */}
                    {isDesktop && <NotificationDropdown />}

                    {/* User Profile */}
                    {isDesktop && (
                        <Link to={userLink} className="flex items-center gap-2.5 ps-2 border-s border-border/50 ms-1">
                            <div className="text-end hidden sm:block">
                                <p className="text-xs font-medium text-main leading-tight">{currentUser?.name || 'المستخدم'}</p>
                                <p className="text-[10px] text-muted leading-tight">
                                    {currentUser?.role === 'admin' ? 'مدير النظام' :
                                     currentUser?.role === 'teacher' ? 'معلم' :
                                     currentUser?.role === 'parent' ? 'ولي أمر' :
                                     currentUser?.role === 'student' ? 'طالب' : 'مستخدم'}
                                </p>
                            </div>
                            <Avatar className="w-8 h-8 ring-2 ring-border/50">
                                {currentUser?.avatar ? (
                                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                        <User size={14} />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </Link>
                    )}

                    {/* Mobile user icon */}
                    {!isDesktop && (
                        <Link to={userLink}>
                            <Avatar className="w-8 h-8 ring-2 ring-border/50">
                                {currentUser?.avatar ? (
                                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <User size={14} />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </Link>
                    )}
                </div>
            </header>

            {/* Search Modal */}
            {searchOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-background/60 backdrop-blur-sm"
                    onClick={() => setSearchOpen(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                            <Search size={16} className="text-muted shrink-0" />
                            <Input
                                autoFocus
                                placeholder="ابحث في لوحة التحكم..."
                                className="border-0 bg-transparent p-0 h-auto text-sm shadow-none focus-visible:ring-0"
                            />
                        </div>
                        <div className="p-2">
                            <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-muted">
                                <Command size={12} />
                                <span>اكتب لأوامر سريعة أو اضغط Escape للإغلاق</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

const LayoutDashboardIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
);
