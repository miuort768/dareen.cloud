import { Moon, Sun, User, Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useApp, useSettings } from '../../context/AppContext';
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
    const { adminPhone } = useSettings();

    return (
        <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 dark:bg-gray-900/80 dark:border-gray-800 transition-colors duration-300">

            {/* Search Bar / Quick Search */}
            <div className="flex-1 flex items-center gap-2 lg:gap-6 overflow-hidden">
                <div className="flex flex-col items-center justify-center -mb-1 ml-4 border-l border-gray-100 dark:border-gray-800 pl-6 h-8">
                    <span className="text-[10px] lg:text-xs font-black text-primary-600 dark:text-primary-400 leading-none uppercase tracking-tighter">معهد دارين</span>
                    <span className="text-[8px] lg:text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-none mt-1 whitespace-nowrap">
                        {user.role === 'teacher' ? 'مرحباً بكِ شريكة النجاح' : 'مرحباً بك شريك النجاح'}
                    </span>
                </div>
                {location.pathname === '/chat' && (
                    <a
                        href={`https://wa.me/2${adminPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 h-8 lg:h-10 px-3 lg:px-4 rounded-xl hover:bg-green-50 text-green-600 transition-colors dark:hover:bg-green-900/20 dark:text-green-500 shrink-0 border border-green-200 dark:border-green-900/30"
                        title="تواصل مع الدعم الفني"
                    >
                        <Phone size={18} />
                        <span className="text-xs lg:text-sm font-bold">طلب الدعم</span>
                    </a>
                )}
                {title && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
                        <h1 className="text-sm lg:text-xl font-black text-gray-900 dark:text-gray-100 truncate">{title}</h1>
                        <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 hidden lg:block truncate">{subtitle}</p>
                    </div>
                )}
                <div className="mr-auto ml-8 hidden lg:block">
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 lg:gap-4 ml-2">
                {/* Dark Mode Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="relative w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 transition-colors dark:hover:bg-gray-800 dark:text-gray-400 shrink-0"
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* Notifications Dropdown */}
                <NotificationDropdown />

                {/* User Profile */}
                <div className="flex items-center gap-2 lg:gap-3 pr-2 lg:pr-4 border-r border-gray-100 dark:border-gray-700">
                    <div className="text-center hidden lg:block">
                        <p className="text-xs lg:text-sm font-bold text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                            {user.role === 'teacher' ? 'معلمة' : 'مدير النظام'}
                        </p>
                    </div>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 border border-white shadow-sm dark:bg-primary-900 dark:text-primary-300 dark:border-gray-800 overflow-hidden shrink-0">
                        <User size={16} />
                    </div>
                </div>
            </div>
        </header>
    );
};
