import { Moon, Sun, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useApp } from '../../context/AppContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';

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
            case '/settings':
                return { title: 'الإعدادات', subtitle: 'تكوين إعدادات النظام.' };
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
        <header className="h-[75px] lg:h-[80px] bg-[#f2f8ff]/95 dark:bg-slate-950/95 backdrop-blur-md border-b-2 border-primary-100/50 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40 shadow-sm transition-all duration-500 overflow-hidden">
            {/* Edge Design Accent - Slanted Side */}
            <div className="absolute top-0 left-0 w-48 h-full bg-primary-600/5 -skew-x-[25deg] -translate-x-20 lg:hidden" />
            <div className="absolute top-0 left-0 w-32 h-[2px] bg-gradient-to-r from-primary-600 to-transparent" />
            <div className="absolute bottom-0 right-0 w-32 h-[2px] bg-gradient-to-l from-primary-300 to-transparent dark:from-teal-500/50" />

            {/* Left Section: Branding & Title */}
            <div className="flex items-center gap-4 lg:gap-8 flex-1 min-w-0 relative">
                <div className="flex flex-col items-center justify-center border-l-2 border-primary-500/20 dark:border-white/10 pl-4 py-1 shrink-0 bg-white/40 dark:bg-slate-900/40 rounded-r-xl pr-2 lg:bg-transparent lg:rounded-none lg:p-0">
                    <span className="text-[10px] md:text-xs font-black text-primary-600 dark:text-teal-400 leading-none uppercase tracking-[0.2em]">DARIN</span>
                    <span className="text-[9px] md:text-[11px] font-black text-primary-700/80 dark:text-teal-300/80 mt-1 whitespace-nowrap">
                        {getRoleLabel(user.role)}
                    </span>
                </div>

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
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-none bg-gray-100/50 dark:bg-slate-900 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-teal-400 transition-all duration-300 shadow-sm border border-gray-200 dark:border-slate-800 shrink-0"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications Dropdown */}
                <NotificationDropdown />

                {/* User Profile */}
                <div className="flex items-center gap-3 pr-4 border-r-2 border-primary-500/10 dark:border-white/10 shrink-0">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs lg:text-sm font-black text-gray-900 dark:text-slate-100 leading-tight">{user.name}</p>
                        <p className="text-[10px] font-bold text-primary-600 dark:text-teal-400 opacity-70">
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
