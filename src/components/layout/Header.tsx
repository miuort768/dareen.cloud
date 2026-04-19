import { Moon, Sun, User, GraduationCap, Sparkles } from 'lucide-react';

import { useLocation, Link } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useApp } from '../../context/AppContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { cn } from '../../lib/utils';

export const Header = () => {
    const [theme, setTheme] = useDarkMode();
    const location = useLocation();
    const { user } = useApp();

    const getPageTitle = (path: string) => {
        // Handle generic dashboard paths
        if (path === '/' || path === '/dashboard' || path === '/admin-dashboard') {
            return { title: 'نظرة عامة', subtitle: 'متابعة أداء الأكاديمية وإحصائيات الطلاب.' };
        }

        switch (path) {
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
            default:
                return { title: '', subtitle: '' };
        }
    };

    const getRoleLabel = (role?: string) => {
        if (!role) return 'مستخدم';
        switch (role) {
            case 'admin': return 'مدير النظام';
            case 'teacher': return 'معلمة';
            case 'student': return 'طالب';
            case 'parent': return 'ولي أمر';
            default: return 'مستخدم';
        }
    };

    const { title, subtitle } = getPageTitle(location.pathname);

    return (
        <header className={cn(
            "h-[60px] lg:h-[75px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 flex items-center justify-between transition-all duration-500 z-50",
            "sticky top-2 lg:top-4 mx-auto w-[96%] lg:w-[94%] mb-4 lg:mb-6 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-2 md:px-6"
        )}>

            {/* Left Section: Branding & Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Link to="/" className="shrink-0 pr-1">
                    <div className="w-10 h-10 bg-red-600 flex items-center justify-center text-white shadow-sm rounded-none border border-red-700">
                        <GraduationCap size={20} strokeWidth={2.5} />
                    </div>
                </Link>

                {title && (
                    <div className="min-w-0 overflow-hidden">
                        <h1 className="text-xs md:text-xl font-black text-slate-900 dark:text-white truncate tracking-tight pr-1">
                            {title}
                        </h1>
                    </div>
                )}
            </div>

            {/* Right Actions - Fixed Layout */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none transition-colors shrink-0"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <div className="shrink-0">
                    <NotificationDropdown />
                </div>

                {/* User Identity - Simplified and Consistent */}
                <div className="flex items-center gap-2 pl-2 border-r border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-none shrink-0 border border-slate-200 dark:border-slate-700">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};
