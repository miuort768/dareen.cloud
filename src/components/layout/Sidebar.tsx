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
    Home,
    Megaphone,
    CalendarCheck,
    MessageSquare,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';
import { X, Menu } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext';

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved !== null ? saved === 'true' : true;
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { academyName, logout, currentUser, isLoading } = useApp();
    const { totalUnreadCount } = useChatContext();
    const navigate = useNavigate();

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(collapsed));
    }, [collapsed]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'لوحة التحكم', href: '/admin-dashboard', id: 'dashboard', icon: LayoutDashboard },
        { name: 'بوابة المتابعة', href: '/parent-dashboard', id: 'parent_dashboard', icon: Home },
        { name: 'الأبناء', href: '/parent-students', id: 'parent_students', icon: Users },
        { name: 'لوحة الإعلانات', href: '/parent-announcements', id: 'parent_announcements', icon: Megaphone },
        { name: 'المعلمات', href: '/teachers', id: 'teachers', icon: Presentation },
        { name: 'الطلاب', href: '/students', id: 'students', icon: GraduationCap },
        { name: 'أولياء الأمور', href: '/parents', id: 'parents', icon: Users },
        { name: 'المالية', href: '/finance', id: 'finance', icon: Wallet },
        { name: 'الحضور والغياب', href: '/attendance', id: 'attendance', icon: UserCheck },
        { name: 'الجداول الدراسية', href: '/schedule', id: 'schedule', icon: CalendarDays },
        { name: 'المواعيد', href: '/appointments', id: 'appointments', icon: CalendarCheck },
        { name: 'التقارير', href: '/reports', id: 'reports', icon: FileText },
        { name: 'فواتير الطلاب', href: '/student-invoices', id: 'student-invoices', icon: DollarSign },
        { name: 'فواتير المعلمات', href: '/teacher-invoices', id: 'teacher-invoices', icon: Receipt },
        { name: 'المهام والطلبات', href: '/tasks', id: 'tasks', icon: ListTodo },
        { name: 'الدردشة', href: '/chat', id: 'chat', icon: totalUnreadCount > 0 ? MessageSquare : MessageCircle },
        { name: 'إدارة الإعلانات', href: '/announcements', id: 'announcements', icon: Megaphone },
        { name: 'الإعدادات', href: '/settings', id: 'settings', icon: Settings },
    ];

    // Filter navigation based on permissions
    const filteredNavigation = navigation.filter(item => {
        // If no user, show nothing
        if (!currentUser) return false;

        // Admin access ('*')
        if (currentUser.permissions?.includes('*')) {
            // Admin sees EVERYTHING except parent portal specific pages
            if (['parent_dashboard', 'parent_students', 'parent_announcements'].includes(item.id)) return false;
            return true;
        }

        // Parent specific access
        // Exclude general dashboard for parents as they have parent-dashboard
        if (currentUser.role === 'parent') {
            if (item.id === 'dashboard') return false;
            if (['parent_dashboard', 'parent_students', 'parent_announcements', 'chat'].includes(item.id)) return true;
        }

        // Explicitly allow Dashboard for Teachers
        if (item.id === 'dashboard' && currentUser.role === 'teacher') return true;

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
                        "hidden lg:flex bg-white h-screen border-l border-gray-200 transition-all duration-300 flex-col sticky top-0 z-50 shrink-0 dark:bg-gray-900 dark:border-gray-800",
                        collapsed ? "w-20" : "w-72"
                    )}
                >
                    <div className={cn(
                        "h-16 flex items-center border-b border-gray-100 transition-all duration-300 dark:border-gray-800",
                        collapsed ? "justify-center px-0" : "justify-between px-6"
                    )}>
                        <div className={cn("flex items-center gap-3 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                            <GraduationCap size={collapsed ? 32 : 28} className="text-gold shrink-0" />
                            <span className={cn(
                                "font-bold text-xl text-gray-800 transition-all duration-300 dark:text-gray-100",
                                collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100 pl-3"
                            )}>
                                {academyName}
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
                    "hidden lg:flex bg-white h-screen border-l border-gray-200 transition-all duration-300 flex-col sticky top-0 z-50 shrink-0 dark:bg-gray-900 dark:border-gray-800",
                    collapsed ? "w-20" : "w-72"
                )}
            >
                {/* Search & Logo Area */}
                <div className={cn(
                    "h-16 flex items-center border-b border-gray-100 transition-all duration-300 dark:border-gray-800",
                    collapsed ? "justify-center px-0" : "justify-between px-6"
                )}>
                    <div className={cn("flex items-center gap-3 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                        <GraduationCap size={collapsed ? 32 : 28} className="text-gold shrink-0" />
                        <span className={cn(
                            "font-bold text-xl text-gray-800 transition-all duration-300 dark:text-gray-100",
                            collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100 pl-3"
                        )}>
                            {academyName}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
                    {filteredNavigation.map((item) => (
                        <NavLink
                            key={`${item.href}-${item.id}`}
                            to={item.href}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-1.5 rounded-none transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary-50 text-primary-700 font-bold dark:bg-primary-900/50 dark:text-primary-400"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                                collapsed && "justify-center"
                            )}
                            title={collapsed ? item.name : ''}
                        >
                            <item.icon
                                size={collapsed ? 22 : 18}
                                className="shrink-0"
                                strokeWidth={2}
                            />
                            <span className={cn(
                                "whitespace-nowrap transition-all duration-300",
                                collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                            )}>
                                {item.name}
                            </span>
                            {item.id === 'chat' && totalUnreadCount > 0 && (
                                <span className={cn(
                                    "absolute top-1 right-2 w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full animate-bounce-slow",
                                    collapsed && "top-1 right-1"
                                )}>
                                    {totalUnreadCount > 9 ? '+9' : totalUnreadCount}
                                </span>
                            )}
                            {collapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 rtl:mr-2 rtl:left-full ltr:ml-2 ltr:left-auto ltr:right-full px-2 py-1 bg-gray-900 text-white text-xs rounded-none opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 dark:bg-gray-800 dark:text-gray-200">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Collapse Toggle */}
                <div className="px-4 pt-4 pb-1 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-none hover:bg-gray-50 text-gray-500 transition-colors dark:hover:bg-gray-800 dark:text-gray-400"
                    >
                        {collapsed ? <ChevronRight size={20} className="mx-auto" /> : <ChevronLeft size={20} />}
                        <span className={cn(
                            "whitespace-nowrap transition-all duration-300",
                            collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                        )}>
                            تصغير القائمة
                        </span>
                    </button>
                </div>

                {/* Logout */}
                <div className="px-4 pb-4 pt-1">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 rounded-none text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20",
                            collapsed && "justify-center"
                        )}
                    >
                        <LogOut size={20} />
                        <span className={cn(
                            "whitespace-nowrap transition-all duration-300",
                            collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                        )}>
                            تسجيل الخروج
                        </span>
                    </button>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around px-2 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] pb-safe">
                {[
                    ...filteredNavigation.slice(0, 4),
                    ...(filteredNavigation.find(item => item.id === 'chat' && !filteredNavigation.slice(0, 4).find(i => i.id === 'chat')) ? [filteredNavigation.find(item => item.id === 'chat')!] : [])
                ].map((item) => (
                    <NavLink
                        key={`mobile-${item.href}-${item.id}`}
                        to={item.href}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center flex-1 h-full transition-all duration-500 relative",
                            isActive
                                ? "text-primary-600 dark:text-primary-400 scale-105"
                                : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
                        )}
                    >
                        {({ isActive }) => (
                            <div className={cn(
                                "p-3 rounded-none transition-all duration-300",
                                isActive ? "bg-primary-50 dark:bg-primary-900/40" : ""
                            )}>
                                <item.icon
                                    size={28}
                                    strokeWidth={2}
                                    className={cn("transition-transform duration-300", isActive && "scale-110")}
                                />
                            </div>
                        )}
                    </NavLink>
                ))}

                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center justify-center flex-1 h-full text-gray-400 dark:text-gray-500 active:scale-95 transition-all group"
                >
                    <div className="p-3 group-active:bg-gray-100 dark:group-active:bg-gray-800 rounded-none transition-colors">
                        <Menu size={28} />
                    </div>
                </button>
            </div>

            {/* Mobile Full Menu Overlay - Modern Sheet Design */}
            <div className={cn(
                "fixed inset-0 z-[110] bg-gray-950/40 backdrop-blur-md lg:hidden transition-all duration-500",
                mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div
                    className="absolute inset-0"
                    onClick={() => setMobileMenuOpen(false)}
                />
                <div className={cn(
                    "absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-none p-4 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] overflow-hidden max-h-[90vh] flex flex-col border-t border-white/10",
                    mobileMenuOpen ? "translate-y-0" : "translate-y-full"
                )}>
                    {/* Pull Bar */}
                    <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-none mx-auto mb-4 shrink-0" />

                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <GraduationCap size={24} className="text-gold" />
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
                        <div className="grid grid-cols-1 gap-1">
                            {filteredNavigation.map((item) => (
                                <NavLink
                                    key={`menu-${item.href}-${item.id}`}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 p-2 rounded-none transition-all duration-200 border-l-4",
                                        isActive
                                            ? "bg-primary-50 border-primary-600 text-primary-700 font-bold dark:bg-primary-900/20 dark:text-primary-400"
                                            : "bg-white border-transparent text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400"
                                    )}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={cn(
                                                "w-6 h-6 rounded-none flex items-center justify-center transition-all",
                                                isActive ? "text-primary-600" : "text-gray-400"
                                            )}>
                                                <item.icon size={16} />
                                            </div>
                                            <span className="text-xs font-bold tracking-tight">{item.name}</span>
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
        </>
    );
};
