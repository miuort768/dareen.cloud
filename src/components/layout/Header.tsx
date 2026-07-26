import { Sun, Moon, User, MessageSquare } from 'lucide-react';
import { useState, useEffect, memo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useDarkMode } from '../../shared/hooks/useDarkMode';
import { useCurrentUser } from '../../context/AppContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useUnreadStore } from '../../store/unreadStore';

export const Header = memo(() => {
    const [theme, setTheme] = useDarkMode();
    const location = useLocation();
    const currentUser = useCurrentUser();
    const totalUnreadCount = useUnreadStore(s => s.totalUnreadCount);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getPageTitle = (path: string) => {
        const basePath = '/' + path.split('/')[1];
        if (basePath === '/' || basePath === '/dashboard' || basePath === '/admin-dashboard' || basePath === '/teacher-dashboard' || basePath === '/student-dashboard') {
            return { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب.' };
        }
        const titles: Record<string, { title: string; subtitle: string }> = {
            '/students': { title: 'إدارة الطلاب', subtitle: 'قائمة بجميع الطلاب المسجلين وحالاتهم.' },
            '/parents': { title: 'أولياء الأمور', subtitle: 'إدارة بيانات أولياء الأمور.' },
            '/teachers': { title: 'المعلمات', subtitle: 'إدارة بيانات المعلمات.' },
            '/finance': { title: 'المالية', subtitle: 'متابعة الإيرادات والمصروفات.' },
            '/student-invoices': { title: 'فواتير الطلاب', subtitle: 'متابعة الرسوم والمدفوعات.' },
            '/teacher-invoices': { title: 'فواتير المعلمات', subtitle: 'إدارة ومتابعة فواتير المعلمات.' },
            '/attendance': { title: 'الحضور والغياب', subtitle: 'متابعة حضور الطلاب اليومي.' },
            '/schedule': { title: 'الجداول الدراسية', subtitle: 'جدول الحصص الأسبوعي.' },
            '/agenda': { title: 'الأجندة', subtitle: 'متابعة المواعيد والمهام القادمة.' },
            '/appointments': { title: 'المواعيد', subtitle: 'إدارة المواعيد والتقويم.' },
            '/tasks': { title: 'المهام', subtitle: 'إدارة وتكليف المهام للمعلمات.' },
            '/announcements': { title: 'الإعلانات', subtitle: 'نشر الإعلانات العامة والتنبيهات.' },
            '/chat': { title: 'المحادثات', subtitle: 'التواصل المباشر.' },
            '/reports': { title: 'التقارير', subtitle: 'التقارير والإحصائيات العامة.' },
            '/forum': { title: 'منتدى دارين', subtitle: 'مساحة لمشاركة الأفكار.' },
            '/settings': { title: 'إعدادات النظام', subtitle: 'تكوين إعدادات النظام.' },
            '/parent-dashboard': { title: 'لوحة التحكم', subtitle: 'نظرة عامة على أداء أبنائك.' },
            '/parent-students': { title: 'أبنائي', subtitle: 'متابعة الحضور والتقويم.' },
            '/parent-announcements': { title: 'إعلانات المنصة', subtitle: 'آخر المستجدات.' },
            '/evaluations': { title: 'التقييمات', subtitle: 'متابعة تقييمات الطلاب.' },
            '/monthly-closing': { title: 'الإقفال الشهري', subtitle: 'إدارة التقارير الشهرية.' },
            '/leads': { title: 'العملاء المحتملين', subtitle: 'إدارة طلبات التسجيل.' },
            '/trial-sessions': { title: 'جلسات المراجعة', subtitle: 'متابعة جلسات الطلاب.' },
            '/admin-contacts': { title: 'رسائل الاتصال', subtitle: 'إدارة رسائل التواصل.' },
            '/admin-jobs': { title: 'طلبات التوظيف', subtitle: 'إدارة طلبات التوظيف.' },
        };
        if (titles[basePath]) return titles[basePath];
        if (path.includes('/blog')) return { title: 'إدارة المدونة', subtitle: 'إدارة مقالات المدونة والكتب.' };
        return { title: 'لوحة التحكم', subtitle: 'نظرة عامة على النظام' };
    };

    const { title, subtitle } = getPageTitle(location.pathname);

    const userLink = currentUser?.role === 'admin' ? '/settings' : currentUser?.role === 'parent' ? '/parent-dashboard' : currentUser?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard';

    return (
        <header className={cn(
            "h-[60px] lg:h-[75px] flex items-center justify-between transition-all duration-500 z-[9999]",
            "sticky top-0 lg:top-2 mx-auto w-full lg:w-[96%] mb-0.5 lg:mb-1",
            "header-nav backdrop-blur-md shadow-sm shadow-black/10",
            "px-4 md:px-6 max-w-full",
            "md:translate-y-0 rounded-b-xl lg:rounded-xl",
            "md:top-2 md:border md:border-border",
            "translate-y-0"
        )}>
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                <div className="w-px h-8 bg-on-primary/20 shrink-0 hidden md:block" />
                {title && (
                    <div className="min-w-0 flex-1">
                        <h1 className="text-sm md:text-lg font-bold text-on-primary truncate tracking-tight leading-none">
                            {title}
                        </h1>
                        <p className="text-micro font-normal text-on-primary opacity-70 uppercase tracking-widest leading-none mt-0.5">
                            {subtitle || 'دارين للتعليم والتدريب'}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {isDesktop && (
                    <div className="flex items-center bg-on-primary/10 rounded-xl p-1 gap-0.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="text-on-primary hover:bg-on-primary/15 gap-1.5 h-8 px-2.5 rounded-lg"
                        >
                            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                            <span className="text-xs font-medium hidden sm:inline">{theme === 'dark' ? 'النهار' : 'الليل'}</span>
                        </Button>

                        <div className="w-px h-5 bg-on-primary/15" />

                        <NotificationDropdown showLabel />

                        <div className="w-px h-5 bg-on-primary/15" />

                        <Link
                            to="/chat"
                            className={cn(
                                "relative flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg",
                                "text-on-primary hover:bg-on-primary/15 transition-colors"
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
                )}

                {!isDesktop && (
                    <div className="flex items-center bg-on-primary/10 rounded-xl p-1 gap-0.5">
                        <Link
                            to="/chat"
                            className={cn(
                                "relative flex items-center justify-center w-8 h-8 rounded-lg",
                                "text-on-primary hover:bg-on-primary/15 transition-colors"
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

                <div className="w-px h-8 bg-on-primary/20 shrink-0" />

                <Link to={userLink} className="shrink-0">
                    <Avatar className="w-9 h-9 border-2 border-success/30 dark:border-success/40">
                        {currentUser?.avatar ? (
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary-light to-primary-soft text-muted dark:text-success">
                                <User size={18} />
                            </AvatarFallback>
                        )}
                    </Avatar>
                </Link>
            </div>
        </header>
    );
});
