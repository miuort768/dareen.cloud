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

    const { title, subtitle } = getPageTitle(location.pathname);

    return (
        <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 dark:bg-slate-900/80 dark:border-slate-800 transition-colors duration-300">

            {/* Search Bar / Quick Search */}
            <div className="flex-1 flex items-center min-w-0">
                <div className="flex flex-col items-center justify-center ml-2 md:ml-4 border-l border-gray-100 dark:border-slate-800 pl-2 md:pl-6 py-1 shrink-0">
                    <span className="text-[8px] md:text-xs font-black text-primary-600 dark:text-teal-400 leading-none uppercase tracking-tighter">دارين</span>
                    <span className="text-[6px] md:text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-none mt-0.5 whitespace-nowrap">
                        {user.role === 'teacher' ? 'ملمة' : 'مدير'}
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
            <div className="flex items-center gap-1 md:gap-4 shrink-0">
                {/* Dark Mode Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 transition-colors dark:hover:bg-gray-800 dark:text-gray-400 shrink-0"
                >
                    {theme === 'dark' ? <Sun size={14} className="md:size-[16px]" /> : <Moon size={14} className="md:size-[16px]" />}
                </button>

                {/* Notifications Dropdown */}
                <NotificationDropdown />

                {/* User Profile */}
                <div className="flex items-center gap-2 lg:gap-3 pr-1.5 md:pr-4 border-r border-gray-100 dark:border-slate-800 shrink-0">
                    <div className="text-center hidden lg:block">
                        <p className="text-xs lg:text-sm font-bold text-gray-900 dark:text-slate-100">{user.name}</p>
                        <p className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">
                            {user.role === 'teacher' ? 'معلمة' : 'مدير النظام'}
                        </p>
                    </div>
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 border border-white shadow-sm dark:bg-slate-800 dark:text-teal-300 dark:border-slate-700 overflow-hidden shrink-0">
                        <User size={14} className="md:size-[16px]" />
                    </div>
                </div>
            </div>
        </header>
    );
};
