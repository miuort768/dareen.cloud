import { Moon, Sun, User } from 'lucide-react';

import { useLocation, Link } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useApp } from '../../context/AppContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { cn } from '../../lib/utils';

export const Header = () => {
    const [theme, setTheme] = useDarkMode();
    const location = useLocation();
    const { currentUser } = useApp();


    const getPageTitle = (path: string) => {
        // Extract base path to handle nested routes like /students/123
        const basePath = '/' + path.split('/')[1];

        // Handle generic dashboard paths
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
            case '/admin':
                if (path.includes('/blog')) return { title: 'إدارة المدونة', subtitle: 'إدارة مقالات المدونة والكتب.' };
                return { title: 'الإدارة', subtitle: 'لوحة تحكم الإدارة.' };
            case '/classroom':
                return { title: 'الفصل الدراسي', subtitle: 'منصة التعلم التفاعلي.' };
            case '/profile':
                return { title: 'الملف الشخصي', subtitle: 'إدارة الحساب والإعدادات الشخصية.' };
            default:
                return { title: 'لوحة التحكم', subtitle: 'نظرة عامة على النظام' };
        }
    };

    const { title } = getPageTitle(location.pathname);

    return (
        <header className={cn(
            "h-[60px] lg:h-[75px] bg-white dark:bg-slate-900 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between transition-all duration-500 z-[9999]",
            "sticky top-0 lg:top-2 mx-auto w-full lg:w-[96%] mb-0.5 lg:mb-1 rounded-none lg:rounded-2xl border border-slate-200 dark:border-white/10 px-4 md:px-8 max-w-full shadow-sm shadow-black/5 dark:shadow-2xl dark:shadow-black/20"
        )}>

            {/* Left Section: Branding & Title */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <Link to="/" className="shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center shadow-sm rounded-none border border-slate-200 dark:border-white/20 bg-white dark:bg-white transform lg:-rotate-3 overflow-hidden">
                        <img src="/dareen_logo_new.jpg" alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                </Link>

                {title && (
                    <div className="min-w-0 overflow-hidden pr-1.5 flex flex-col gap-0.5 justify-center">
                        <h1 className={cn(
                            "text-[14px] md:text-xl font-black text-slate-800 dark:text-white truncate tracking-tight leading-none",
                            (title === 'الجداول الدراسية' || title === 'الحضور والغياب') && "hidden md:block"
                        )}>
                            {title}
                        </h1>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest leading-none m-0">
                            دارين للتعليم والتدريب
                        </p>
                    </div>
                )}
            </div>

            {/* Right Actions - Fixed Layout */}
            <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-none transition-colors shrink-0"
                >
                    <Sun size={20} />
                </button>

                {/* Notifications */}
                <div className="shrink-0">
                    <NotificationDropdown />
                </div>

                <Link 
                    to={currentUser?.role === 'admin' ? '/settings' : '/profile'} 
                    className="flex items-center pr-3 border-r border-slate-200 dark:border-white/20 shrink-0 group transition-all"
                >
                    <div className="w-10 h-10 bg-slate-100 dark:bg-white/20 flex items-center justify-center text-slate-600 dark:text-white rounded-xl shrink-0 border-[0.5px] border-slate-200 dark:border-white/30 group-hover:ring-1 group-hover:ring-slate-300 dark:group-hover:ring-white/20 group-active:scale-95 transition-all overflow-hidden">
                        {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
};
