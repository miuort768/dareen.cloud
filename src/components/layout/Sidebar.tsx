import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    Wallet,
    UserCheck,
    CalendarDays,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    FileText,
    Receipt,
    DollarSign,
    ListTodo,
    Presentation,
    MessageCircle,
    Award,
    CalendarCheck,
    UserPlus,
    Home,
    Megaphone,
    MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';
import { X, Menu } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext';
import { SessionCallAlert } from '../ui/SessionCallAlert';

export const Sidebar = () => {
    const {
        academyName,
        logout,
        currentUser,
        isLoading,
        sidebarCollapsed: collapsed,
        setSidebarCollapsed: setCollapsed
    } = useApp();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { totalUnreadCount, activeConversationId } = useChatContext();
    const navigate = useNavigate();

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(collapsed));
    }, [collapsed]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (currentUser?.role === 'parent') return '/parent-dashboard';
        if (currentUser?.role === 'student') return '/student-dashboard';
        if (currentUser?.role === 'teacher') return '/teacher-dashboard';
        return '/admin-dashboard';
    };

    const navigation = [
        { name: 'لوحة التحكم', href: getDashboardLink(), id: 'dashboard', icon: LayoutDashboard },
        { name: 'الدردشة', href: '/chat', id: 'chat', icon: totalUnreadCount > 0 ? MessageSquare : MessageCircle },
        { name: 'العملاء والمهتمين', href: '/leads', id: 'leads', icon: UserPlus },
        { name: 'المعلمات', href: '/teachers', id: 'teachers', icon: Presentation },
        { name: 'الطلاب', href: '/students', id: 'students', icon: GraduationCap },
        { name: 'أولياء الأمور', href: '/parents', id: 'parents', icon: Users },
        { name: 'التقييمات والنقاط', href: '/evaluations', id: 'dashboard', icon: Award },
        { name: 'المالية', href: '/finance', id: 'finance', icon: Wallet },
        { name: 'تقفيل الشهر', href: '/monthly-closing', id: 'monthly_closing', icon: CalendarCheck },
        { name: 'الحضور والغياب', href: '/attendance', id: 'attendance', icon: UserCheck },
        { name: 'الجداول الدراسية', href: '/schedule', id: 'schedule', icon: CalendarDays },
        { name: 'المواعيد', href: '/appointments', id: 'appointments', icon: CalendarCheck },
        { name: 'التقارير', href: '/reports', id: 'reports', icon: FileText },
        { name: 'فواتير الطلاب', href: '/student-invoices', id: 'student-invoices', icon: DollarSign },
        { name: 'فواتير المعلمات', href: '/teacher-invoices', id: 'teacher-invoices', icon: Receipt },
        { name: 'إدارة الإعلانات', href: '/announcements', id: 'announcements', icon: Megaphone },
        { name: 'إدارة المدونة', href: '/admin/blog', id: 'admin-blog', icon: FileText },
        { name: 'المنتدى', href: '/forum', id: 'forum', icon: MessageSquare },
        { name: 'الإعدادات', href: '/settings', id: 'settings', icon: Settings },
        { name: 'بوابة المتابعة', href: '/parent-dashboard', id: 'parent_dashboard', icon: Home },
        { name: 'حساب الطالب', href: '/student-dashboard', id: 'student_dashboard', icon: GraduationCap },
        { name: 'الأبناء', href: '/parent-students', id: 'parent_students', icon: Users },
        { name: 'لوحة الإعلانات', href: '/parent-announcements', id: 'parent_announcements', icon: Megaphone },
        { name: 'المهام والطلبات', href: '/tasks', id: 'tasks', icon: ListTodo },
    ];

    // Filter navigation based on permissions
    const filteredNavigation = navigation.filter(item => {
        // If no user, show nothing
        if (!currentUser) return false;

        // Admin access ('*')
        if (currentUser.permissions?.includes('*')) {
            // Admin sees EVERYTHING except portal specific pages and tasks
            if (['parent_dashboard', 'parent_students', 'parent_announcements', 'student_dashboard', 'tasks'].includes(item.id)) return false;
            return true;
        }

        // Parent specific access
        // Exclude general dashboard for parents as they have parent-dashboard
        if (currentUser.role === 'parent') {
            if (item.id === 'dashboard') return false;
            if (['parent_dashboard', 'chat', 'parent_students', 'parent_announcements', 'forum'].includes(item.id)) return true;
        }

        // Student specific access
        if (currentUser.role === 'student') {
            if (item.id === 'dashboard') return false;
            if (['student_dashboard', 'chat', 'forum', 'parent_announcements'].includes(item.id)) return true;
        }

        // Explicitly allow Dashboard for Teachers
        if (item.id === 'dashboard' && currentUser.role === 'teacher') return true;

        // Explicitly allow Forum for Teachers
        if (item.id === 'forum' && currentUser.role === 'teacher') return true;

        // Specific page access
        return currentUser.permissions?.includes(item.id);
    });

    // Show loading state instead of hiding sidebar completely
    if (isLoading || !currentUser) {
        return (
            <>
                {/* Desktop Sidebar - Loading State */}
                <div
                    className={cn(
                        "hidden lg:flex bg-white h-screen border-l border-gray-200 transition-all duration-300 flex-col sticky top-0 z-50 shrink-0 dark:bg-slate-950 dark:border-slate-900",
                        collapsed ? "w-20" : "w-72"
                    )}
                >
                    <div className={cn(
                        "h-16 flex items-center border-b border-gray-100 transition-all duration-300 dark:border-slate-900",
                        collapsed ? "justify-center px-0" : "justify-between px-6"
                    )}>
                        <div className={cn("flex items-center gap-3 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                            <div className={cn("shrink-0", collapsed ? "w-10 h-10" : "w-8 h-8")}>
                                <img src="/dareen_logo_new.jpg" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className={cn(
                                "font-black text-lg text-gray-950 transition-all duration-300 dark:text-gray-100 uppercase tracking-tighter",
                                collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100 pl-3"
                            )}>
                                دارين السابعة
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Desktop Sidebar - Hidden on Mobile */}
            <div
                className={cn(
                    "hidden lg:flex bg-white h-screen border-l border-gray-200 transition-all duration-300 flex-col fixed top-0 right-0 z-50 shrink-0 dark:bg-slate-950 dark:border-slate-900",
                    collapsed ? "w-20" : "w-72"
                )}
            >
                {/* Search & Logo Area */}
                <div className={cn(
                    "h-14 items-center border-b border-gray-100 transition-all duration-300 dark:border-gray-800",
                    collapsed ? "flex justify-center px-0" : "hidden xl:flex justify-between px-6"
                )}>
                    <div className={cn("flex items-center gap-2 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                        <div className={cn("shrink-0", collapsed ? "w-8 h-8" : "w-6 h-6")}>
                            <img src="/dareen_logo_new.jpg" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className={cn(
                            "font-black text-lg text-gray-950 transition-all duration-300 dark:text-gray-100 uppercase tracking-tighter",
                            collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100 pl-3"
                        )}>
                            نظام دارين السابعة
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={cn("flex-1 py-2 space-y-0.5 overflow-y-auto custom-scrollbar", collapsed ? "px-2" : "px-4")}>
                    {filteredNavigation.map((item) => (
                        <NavLink
                            key={`${item.href}-${item.id}`}
                            to={item.href}
                            className={({ isActive }) => cn(
                                "flex items-center gap-2.5 px-3 py-1.5 rounded-none transition-all duration-200 group relative text-[13px]",
                                isActive
                                    ? "bg-primary-50 text-primary-700 font-bold dark:bg-primary-900/50 dark:text-primary-400"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                                collapsed && "justify-center py-1"
                            )}
                            title={collapsed ? item.name : ''}
                        >
                            <div className="relative shrink-0">
                                <item.icon
                                    size={collapsed ? 20 : 18}
                                    className="shrink-0"
                                    strokeWidth={collapsed ? 2.5 : 2}
                                />
                                {item.id === 'chat' && totalUnreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full animate-pulse shadow-sm border border-white dark:border-slate-950">
                                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "whitespace-nowrap transition-all duration-300 font-bold",
                                collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                            )}>
                                {item.name}
                            </span>
                            {collapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 rtl:mr-2 rtl:left-full ltr:ml-2 ltr:left-auto ltr:right-full px-2 py-1 bg-gray-900 text-white text-xs rounded-none opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 dark:bg-gray-800 dark:text-gray-200">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Collapse Toggle */}
                <div className="px-4 pt-2 pb-0 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-none hover:bg-gray-50 text-gray-500 transition-colors dark:hover:bg-gray-800 dark:text-gray-400"
                    >
                        {collapsed ? <ChevronRight size={18} className="mx-auto" /> : <ChevronLeft size={18} />}
                        <span className={cn(
                            "whitespace-nowrap transition-all duration-300",
                            collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                        )}>
                            تصغير القائمة
                        </span>
                    </button>
                </div>

                {/* Logout */}
                <div className="px-4 pb-4 pt-0">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 rounded-none text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20",
                            collapsed && "justify-center"
                        )}
                    >
                        <LogOut size={18} />
                        <span className={cn(
                            "whitespace-nowrap transition-all duration-300",
                            collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                        )}>
                            تسجيل الخروج
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navigation - Redesigned to match image */}
            <div className={cn(
                "lg:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 flex items-center justify-around px-2 z-[100] shadow-[0_-5px_15px_rgba(0,0,0,0.05)] overflow-hidden max-w-full transition-transform duration-300",
                activeConversationId ? "translate-y-[100%]" : "translate-y-0"
            )}>
                {[
                    ...filteredNavigation.slice(0, 4)
                ].map((item) => (
                    <NavLink
                        key={`mobile-${item.href}-${item.id}`}
                        to={item.href}
                        className={({ isActive }) => cn(
                            "flex items-center justify-center transition-all duration-500 rounded-full",
                            isActive
                                ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-4 py-2"
                                : "text-gray-400 dark:text-gray-500 p-2"
                        )}
                    >
                        {({ isActive }) => (
                            <div className="flex items-center gap-2 relative">
                                <span className={cn(
                                    "text-xs font-black whitespace-nowrap overflow-hidden transition-all duration-500",
                                    isActive ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0"
                                )}>
                                    {item.name}
                                </span>

                                <div className="relative">
                                    <item.icon size={20} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />

                                    {/* Notification Badge for Chat */}
                                    {item.id === 'chat' && totalUnreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-950 shadow-sm md:animate-pulse">
                                            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                    </NavLink>
                ))}

                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex items-center justify-center p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <Menu size={22} strokeWidth={2} />
                </button>
            </div>

            {/* Mobile Full Menu Overlay - Modern Sheet Design */}
            <div className={cn(
                "fixed inset-0 z-[110] bg-gray-950/40 backdrop-blur-md lg:hidden transition-all duration-500 overflow-hidden",
                mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div
                    className="absolute inset-0"
                    onClick={() => setMobileMenuOpen(false)}
                />
                <div className={cn(
                    "absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-none p-4 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_-10px_25px_rgba(0,0,0,0.15)] overflow-hidden max-h-[90vh] flex flex-col border-t border-white/10 w-full max-w-full",
                    mobileMenuOpen ? "translate-y-0" : "translate-y-full"
                )}>
                    {/* Pull Bar */}
                    <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-none mx-auto mb-4 shrink-0" />

                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <img src="/dareen_logo_new.jpg" alt="Logo" className="w-8 h-8 object-contain" />
                            <div>
                                <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight">{academyName}</h2>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">قائمة الوصول السريع</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-1.5 bg-gray-50 dark:bg-gray-900 rounded-none text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar pt-1 pb-4 px-1">
                        <div className="grid grid-cols-2 gap-2">
                            {filteredNavigation.map((item) => (
                                <NavLink
                                    key={`menu-${item.href}-${item.id}`}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-2 py-1.5 px-2.5 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-primary-50 text-primary-700 font-bold dark:bg-primary-900/20 dark:text-primary-400 shadow-sm border border-primary-100 dark:border-primary-900/30"
                                            : "bg-gray-50/50 text-gray-600 hover:bg-gray-50 dark:bg-gray-900/30 dark:text-gray-400"
                                    )}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={cn(
                                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all relative",
                                                isActive ? "bg-white text-primary-600 shadow-sm dark:bg-gray-800" : "bg-white/50 text-gray-400 dark:bg-gray-800/50"
                                            )}>
                                                <item.icon size={14} />
                                                {item.id === 'chat' && totalUnreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center bg-rose-500 text-white text-[8px] font-black rounded-full shadow-sm border border-white dark:border-gray-950">
                                                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-bold tracking-tight truncate">{item.name}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-none bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-md"
                            >
                                <LogOut size={16} />
                                <span className="uppercase tracking-widest text-[10px]">تسجيل الخروج</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SessionCallAlert />
        </>
    );
};
