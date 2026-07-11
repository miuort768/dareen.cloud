import { Sun, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useDarkMode } from '../../shared/hooks/useDarkMode';
import { useCurrentUser } from '../../context/AppContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';

export const Header = () => {
    const [theme, setTheme] = useDarkMode();
    const location = useLocation();
    const currentUser = useCurrentUser();
    const [headerVisible, setHeaderVisible] = useState(true);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 60) {
                setHeaderVisible(currentScrollY < lastScrollY.current);
            } else {
                setHeaderVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

        switch (basePath) {
            case '/students':
                return { title: 'إدارة الطلاب', subtitle: 'قائمة بجميع الطلاب المسجلين وحالاتهم.' };
            case '/parents':
                return { title: 'أولياء الأمور', subtitle: 'إدارة بيانات أولياء الأمور.' };
            case '/teachers':
                return { title: 'المعلمات', subtitle: 'إدارة بيانات المعلمات.' };
            case '/finance':
                return { title: 'المالية', subtitle: 'متابعة الإيرادات والمصروفات.' };
            case '/student-invoices':
                return { title: 'فواتير الطلاب', subtitle: 'متابعة الرسوم والمدفوعات الخاصة بالطلاب.' };
            case '/teacher-invoices':
                return { title: 'فواتير المعلمات', subtitle: 'إدارة ومتابعة فواتير ومستحقات المعلمات.' };
            case '/attendance':
                return { title: 'الحضور والغياب', subtitle: 'متابعة حضور الطلاب اليومي.' };
            case '/schedule':
                return { title: 'الجداول الدراسية', subtitle: 'جدول الحصص الأسبوعي.' };
            case '/agenda':
                return { title: 'الأجندة', subtitle: 'متابعة المواعيد والمهام القادمة.' };
            case '/appointments':
                return { title: 'المواعيد', subtitle: 'إدارة المواعيد والتقويم.' };
            case '/tasks':
                return { title: 'المهام', subtitle: 'إدارة وتكليف المهام للمعلمات.' };
            case '/announcements':
                return { title: 'الإعلانات', subtitle: 'نشر الإعلانات العامة والتنبيهات.' };
            case '/chat':
                return { title: 'المحادثات', subtitle: 'التواصل المباشر مع أولياء الأمور والمعلمات.' };
            case '/reports':
                return { title: 'التقارير', subtitle: 'التقارير والإحصائيات العامة للمدرسة.' };
            case '/forum':
                return { title: 'منتدى دارين', subtitle: 'مساحة لمشاركة الأفكار والنقاشات الهادفة.' };
            case '/settings':
                return { title: 'إعدادات النظام', subtitle: 'تكوين إعدادات النظام.' };
            case '/parent-dashboard':
                return { title: 'لوحة التحكم', subtitle: 'نظرة عامة على أداء أبنائك.' };
            case '/parent-students':
                return { title: 'أبنائي', subtitle: 'متابعة الحضور والتقويم الخاص بالأبناء.' };
            case '/parent-announcements':
                return { title: 'إعلانات المنصة', subtitle: 'آخر المستجدات والتنبيهات العامة.' };
            case '/evaluations':
                return { title: 'التقييمات', subtitle: 'متابعة تقييمات الطلاب الأكاديمية.' };
            case '/monthly-closing':
                return { title: 'الإقفال الشهري', subtitle: 'إدارة الإقفال الشهري والتقارير.' };
            case '/leads':
                return { title: 'العملاء المحتملين', subtitle: 'إدارة طلبات التسجيل والمهتمين.' };
            case '/trial-sessions':
                return { title: 'جلسات المراجعة', subtitle: 'تسجيل ومتابعة جلسات الطلاب غير المقيدين.' };
            case '/admin-contacts':
                return { title: 'رسائل الاتصال', subtitle: 'إدارة رسائل التواصل الواردة من الزوار.' };
            case '/admin-jobs':
                return { title: 'طلبات التوظيف', subtitle: 'إدارة طلبات التوظيف المقدمة.' };
            case '/admin':
                if (path.includes('/blog')) return { title: 'إدارة المدونة', subtitle: 'إدارة مقالات المدونة والكتب.' };
                if (path.includes('/jobs')) return { title: 'طلبات التوظيف', subtitle: 'إدارة طلبات التوظيف المقدمة.' };
                return { title: 'الإدارة', subtitle: 'لوحة تحكم الإدارة.' };
            case '/profile':
                return { title: 'الملف الشخصي', subtitle: 'إدارة الحساب والإعدادات الشخصية.' };
            default:
                return { title: 'لوحة التحكم', subtitle: 'نظرة عامة على النظام' };
        }
    };

    const { title, subtitle } = getPageTitle(location.pathname);

    return (
        <header className={cn(
            "h-[60px] lg:h-[75px] flex items-center justify-between transition-all duration-500 z-[9999]",
            "sticky top-0 lg:top-2 mx-auto w-full lg:w-[96%] mb-0.5 lg:mb-1",
            "header-nav",
            "backdrop-blur-md",
            "shadow-sm shadow-black/10",
            "px-4 md:px-6 max-w-full",
            "md:translate-y-0 rounded-b-xl lg:rounded-xl",
            "md:top-2 md:border md:border-border",
            "translate-y-0"
        )}>
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                <Link to="/" className="shrink-0">
                    <div className="w-8 h-8 overflow-hidden rounded-lg shadow-[0_0_14px_rgba(var(--color-primary),0.45)] hover:shadow-[0_0_22px_rgba(var(--color-primary),0.7)] transition-shadow duration-300">
                        <Image src="/dareen_logo_new.webp" alt="الشعار" className="w-full h-full" />
                    </div>
                </Link>

                <div className="w-px h-8 bg-white/20 shrink-0 hidden md:block" />
                {title && (
                    <div className="min-w-0 flex-1">
                        <h1 className="text-sm md:text-lg font-bold text-on-primary truncate tracking-tight leading-none">
                            {title}
                        </h1>
                        <p className="hidden md:block text-micro font-normal text-on-primary opacity-70 uppercase tracking-widest leading-none mt-0.5">
                            {subtitle || 'دارين للتعليم والتدريب'}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-9 h-9 flex items-center justify-center text-on-primary hover:bg-white/10 transition-colors shrink-0"
                >
                    <Sun size={18} />
                </button>

                {isDesktop && (
                    <div className="shrink-0">
                        <NotificationDropdown />
                    </div>
                )}

                <Link
                    to={currentUser?.role === 'admin' ? '/settings' : currentUser?.role === 'parent' ? '/parent-dashboard' : currentUser?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
                    className="flex items-center ps-2 border-s border-white/20 shrink-0 group transition-all"
                >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-light to-primary-soft flex items-center justify-center text-muted rounded-full shrink-0 border-2 border-success/30 dark:border-success/40 shadow-[0_0_12px_rgba(52,211,153,0.20)] group-hover:scale-105 group-active:scale-95 transition-all overflow-hidden">
                        {currentUser?.avatar ? (
                            <Image src={currentUser.avatar} alt={currentUser.name} className="w-full h-full" />
                        ) : (
                            <User size={18} className="text-muted dark:text-success" />
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
};
