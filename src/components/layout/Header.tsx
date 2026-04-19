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
            "sticky top-2 lg:top-4 mx-auto w-[94%] mb-4 lg:mb-6 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-4 lg:px-6"
        )}>

            {/* Left Section: Branding & Title */}
            <div className="flex items-center gap-3 lg:gap-6 flex-1 min-w-0 relative">
                {/* Unified Premium Icon with Shine Effect */}
                <Link to="/" className="flex items-center gap-2 pr-1 group shrink-0">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-red-300 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative w-11 h-11 overflow-hidden bg-gradient-to-tr from-red-600 via-red-500 to-red-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-[10deg] transition-all duration-500 border border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%] h-full animate-shine pointer-events-none z-0"></div>
                            <GraduationCap size={22} strokeWidth={2.5} className="relative z-10" />
                        </div>
                        <Sparkles size={12} className="absolute -top-[2px] -right-[2px] text-green-600 fill-green-600 animate-pulse z-20 group-hover:scale-110 transition-transform" />
                    </div>
                </Link>

                {/* Vertical Separator */}
                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />




                {title && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 min-w-0 overflow-hidden">
                        <h1 className="text-[11px] md:text-xl font-black text-gray-900 dark:text-gray-100 truncate pr-2">{title}</h1>
                        <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 hidden lg:block truncate">{subtitle}</p>
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 lg:gap-6 shrink-0">
                {/* Dark Mode Toggle */}
                <button
                    onClick={() => {
                        console.log('Switching theme from:', theme);
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-none bg-transparent hover:bg-gray-100 dark:hover:bg-slate-900 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-teal-400 transition-all duration-300 shadow-none border border-transparent hover:border-gray-200 dark:hover:border-slate-800 shrink-0"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications Dropdown */}
                <NotificationDropdown />

                {/* User Profile */}
                <div className="flex items-center gap-3 pr-4 border-r-2 border-primary-500/10 dark:border-white/10 shrink-0">
                    <div className="text-right">
                        <p className="text-[12px] md:text-sm font-black text-gray-900 dark:text-slate-100 leading-tight md:max-w-none">
                            {user.name?.split(' ')[0]}
                        </p>
                        <p className="text-[9px] md:text-[10px] font-bold text-primary-600 dark:text-teal-400 opacity-80">
                            {getRoleLabel(user.role)}
                        </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-700 dark:from-slate-800 dark:to-slate-900 dark:text-teal-300 border border-primary-400/30 dark:border-teal-500/30 shadow-[0_0_10px_rgba(52,211,153,0.3)] overflow-hidden shrink-0 rotate-3 hover:rotate-0 transition-all duration-300">
                        <User size={22} />
                    </div>
                </div>
            </div>
        </header>
    );
};
