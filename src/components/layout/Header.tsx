import { Sun, Moon, User, MessageSquare, Search } from 'lucide-react';
import { useState, useEffect, memo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useDarkMode } from '../../shared/hooks/useDarkMode';
import { useCurrentUser } from '../../context/AppContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { Button } from '../ui/button';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';
import { useUnreadStore } from '../../store/unreadStore';
import { appTabBarHidden } from '../../shared/components/mobile';

const routeMeta: Record<string, { title: string; subtitle: string; icon?: string }> = {
    '/dashboard': { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب' },
    '/admin-dashboard': { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب' },
    '/teacher-dashboard': { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب' },
    '/student-dashboard': { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب' },
    '/parent-dashboard': { title: 'لوحة التحكم', subtitle: 'نظرة عامة على أداء أبنائك' },
    '/students': { title: 'الطلاب', subtitle: 'قائمة بجميع الطلاب المسجلين وحالاتهم' },
    '/parents': { title: 'أولياء الأمور', subtitle: 'إدارة بيانات أولياء الأمور' },
    '/teachers': { title: 'المعلمات', subtitle: 'إدارة بيانات المعلمات' },
    '/finance': { title: 'المالية', subtitle: 'متابعة الإيرادات والمصروفات' },
    '/student-invoices': { title: 'فواتير الطلاب', subtitle: 'متابعة الرسوم والمدفوعات' },
    '/teacher-invoices': { title: 'فواتير المعلمات', subtitle: 'إدارة ومتابعة فواتير المعلمات' },
    '/attendance': { title: 'الحضور والغياب', subtitle: 'متابعة حضور الطلاب اليومي' },
    '/schedule': { title: 'الجداول الدراسية', subtitle: 'جدول الحصص الأسبوعي' },
    '/agenda': { title: 'الأجندة', subtitle: 'متابعة المواعيد والمهام القادمة' },
    '/appointments': { title: 'المواعيد', subtitle: 'إدارة المواعيد والتقويم' },
    '/tasks': { title: 'المهام', subtitle: 'إدارة وتكليف المهام للمعلمات' },
    '/announcements': { title: 'الإعلانات', subtitle: 'نشر الإعلانات العامة والتنبيهات' },
    '/chat': { title: 'المحادثات', subtitle: 'التواصل المباشر' },
    '/reports': { title: 'التقارير', subtitle: 'التقارير والإحصائيات العامة' },
    '/forum': { title: 'منتدى دارين', subtitle: 'مساحة لمشاركة الأفكار' },
    '/settings': { title: 'إعدادات النظام', subtitle: 'تكوين إعدادات النظام' },
    '/parent-students': { title: 'أبنائي', subtitle: 'متابعة الحضور والتقويم' },
    '/parent-announcements': { title: 'إعلانات المنصة', subtitle: 'آخر المستجدات' },
    '/evaluations': { title: 'التقييمات', subtitle: 'متابعة تقييمات الطلاب' },
    '/monthly-closing': { title: 'الإقفال الشهري', subtitle: 'إدارة التقارير الشهرية' },
    '/leads': { title: 'العملاء المحتملين', subtitle: 'إدارة طلبات التسجيل' },
    '/trial-sessions': { title: 'جلسات المراجعة', subtitle: 'متابعة جلسات الطلاب' },
    '/admin-contacts': { title: 'رسائل الاتصال', subtitle: 'إدارة رسائل التواصل' },
    '/admin-jobs': { title: 'طلبات التوظيف', subtitle: 'إدارة طلبات التوظيف' },
    '/student-profile': { title: 'الملف الشخصي', subtitle: 'معلومات حسابك الشخصي' },
    '/teacher-profile': { title: 'الملف الشخصي', subtitle: 'معلومات حسابك الشخصي' },
    '/parent-profile': { title: 'الملف الشخصي', subtitle: 'معلومات حسابك الشخصي' },
};

export const Header = memo(() => {
    const [theme, setTheme] = useDarkMode();
    const location = useLocation();
    const currentUser = useCurrentUser();
    const totalUnreadCount = useUnreadStore(s => s.totalUnreadCount);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isDesktop && appTabBarHidden(location.pathname)) return null;

    const getPageMeta = (path: string) => {
        const basePath = '/' + path.split('/')[1];
        if (basePath === '/' || routeMeta[basePath]) return routeMeta[basePath] || { title: 'لوحة التحكم', subtitle: 'نظرة عامة على النظام' };
        if (path.includes('/blog')) return { title: 'المدونة', subtitle: 'إدارة مقالات المدونة والكتب' };
        return { title: 'لوحة التحكم', subtitle: 'نظرة عامة على النظام' };
    };

    const meta = getPageMeta(location.pathname);

    const userLink = !currentUser ? '/settings'
        : currentUser.role === 'admin' ? '/settings'
        : currentUser.role === 'parent' ? '/parent-profile'
        : currentUser.role === 'student' ? '/student-profile'
        : '/teacher-profile';

    return (
        <header className={cn(
            "sticky top-0 z-40 w-full",
            "h-16 lg:h-[72px]",
            "bg-surface dark:bg-card",
            "backdrop-blur-xl border-b border-border",
            "transition-all duration-300"
        )}>
            <div className="flex items-center justify-between h-full px-4 lg:px-8 max-w-page mx-auto">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Image src="/dareen_logo_new.webp" alt="دارين" className="w-9 h-9 rounded-xl shrink-0 hidden sm:block" imgClassName="object-contain" />
                    {meta && (
                        <div className="min-w-0">
                            <h1 className="text-sm lg:text-base font-extrabold text-main leading-tight truncate">
                                {meta.title}
                            </h1>
                            {isDesktop && meta.subtitle && (
                                <p className="text-[11px] text-muted leading-snug mt-0.5 truncate">
                                    {meta.subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                    {isDesktop && (
                        <>
                            <div className="relative hidden xl:flex items-center">
                                <Search size={16} className="absolute right-3 text-muted pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="بحث..."
                                    aria-label="بحث"
                                    className="h-9 w-[200px] rounded-xl border border-border bg-background pr-9 pl-3 text-xs text-main placeholder:text-muted outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div className="flex items-center bg-background border border-border rounded-xl p-0.5 gap-px">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="h-8 px-2.5 rounded-lg text-muted hover:text-main hover:bg-accent/10 gap-1.5"
                                >
                                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                                    <span className="text-xs font-medium hidden sm:inline">{theme === 'dark' ? 'النهار' : 'الليل'}</span>
                                </Button>

                                <div className="w-px h-5 bg-border/60" />

                                <NotificationDropdown showLabel />

                                <div className="w-px h-5 bg-border/60" />

                                <Link
                                    to="/chat"
                                    className={cn(
                                        "relative flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg",
                                        "text-muted hover:text-main hover:bg-accent/10 transition-colors"
                                    )}
                                >
                                    <MessageSquare size={15} />
                                    <span className="text-xs font-medium hidden sm:inline">الدردشة</span>
                                    {totalUnreadCount > 0 && (
                                        <span className="absolute -top-1 -start-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-black bg-error text-on-error rounded-full leading-none">
                                            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </>
                    )}

                    {!isDesktop && (
                        <div className="flex items-center bg-background border border-border rounded-xl p-0.5 gap-px">
                            <Link
                                to="/chat"
                                aria-label="الدردشة"
                                className={cn(
                                    "relative flex items-center justify-center w-8 h-8 rounded-lg",
                                    "text-muted hover:text-main hover:bg-accent/10 transition-colors"
                                )}
                            >
                                <MessageSquare size={17} />
                                {totalUnreadCount > 0 && (
                                    <span className="absolute -top-1 -start-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-black bg-error text-on-error rounded-full leading-none">
                                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                    </span>
                                )}
                            </Link>
                            <NotificationDropdown />
                        </div>
                    )}

                    <Link to={userLink} className="shrink-0" aria-label="الملف الشخصي">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center hover:shadow-md transition-all cursor-pointer">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-lg object-cover" />
                            ) : (
                                <User size={15} className="text-on-primary" />
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
});
