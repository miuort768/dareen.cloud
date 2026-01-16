import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    Wallet,
    UserCheck,
    CalendarDays,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    CalendarClock,
    FileText,
    Receipt,
    DollarSign,
    ListTodo,
    Presentation
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';
import { X, Menu } from 'lucide-react';

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved !== null ? saved === 'true' : true;
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { academyName, logout, currentUser } = useApp();
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
        { name: 'لوحة التحكم', href: '/', id: 'dashboard', icon: LayoutDashboard },
        { name: 'المعلمات', href: '/teachers', id: 'teachers', icon: Presentation },
        { name: 'الطلاب', href: '/students', id: 'students', icon: GraduationCap },
        { name: 'أولياء الأمور', href: '/parents', id: 'parents', icon: Users },
        { name: 'المالية', href: '/finance', id: 'finance', icon: Wallet },
        { name: 'الحضور والغياب', href: '/attendance', id: 'attendance', icon: UserCheck },
        { name: 'الجداول الدراسية', href: '/schedule', id: 'schedule', icon: CalendarDays },
        { name: 'المواعيد', href: '/appointments', id: 'appointments', icon: CalendarClock },
        { name: 'التقارير', href: '/reports', id: 'reports', icon: FileText },
        { name: 'فواتير الطلاب', href: '/student-invoices', id: 'student-invoices', icon: DollarSign },
        { name: 'فواتير المعلمات', href: '/teacher-invoices', id: 'teacher-invoices', icon: Receipt },
        { name: 'المهام والطلبات', href: '/tasks', id: 'tasks', icon: ListTodo },
        { name: 'الإعدادات', href: '/settings', id: 'settings', icon: Settings },
    ];

    // Filter navigation based on permissions
    const filteredNavigation = navigation.filter(item => {
        // If no user or no permissions, show nothing (or default safe pages)
        if (!currentUser?.permissions) return false;

        // Admin access ('*')
        if (currentUser.permissions.includes('*')) return true;

        // Specific page access
        return currentUser.permissions.includes(item.id);
    });

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
                        <div className="w-10 h-10 bg-primary-600 rounded-none flex items-center justify-center text-white shrink-0">
                            <GraduationCap size={24} />
                        </div>
                        <span className={cn(
                            "font-bold text-xl text-gray-800 transition-all duration-300 dark:text-gray-100",
                            collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100 pl-3"
                        )}>
                            {academyName}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {filteredNavigation.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 rounded-none transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary-50 text-primary-700 font-bold dark:bg-primary-900/50 dark:text-primary-400"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                                collapsed && "justify-center"
                            )}
                            title={collapsed ? item.name : ''}
                        >
                            <item.icon size={18} className={cn("shrink-0", collapsed ? "w-[22px] h-[22px]" : "w-[18px] h-[18px]")} />
                            <span className={cn(
                                "whitespace-nowrap transition-all duration-300",
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
                <div className="px-4 pt-4 pb-1 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-none hover:bg-gray-50 text-gray-500 transition-colors dark:hover:bg-gray-800 dark:text-gray-400"
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
                            "w-full flex items-center gap-3 px-4 py-3 rounded-none text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20",
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

            {/* Mobile Bottom Navigation - Enhanced Premium Design */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/90 backdrop-blur-xl border border-white/20 flex items-center justify-around px-4 z-[100] dark:bg-gray-900/90 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem]">
                {filteredNavigation.slice(0, 4).map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all duration-500 relative",
                            isActive
                                ? "text-primary-600 dark:text-primary-400 font-black scale-105"
                                : "text-gray-400 dark:text-gray-500"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "p-2 rounded-xl transition-all duration-300",
                                    isActive ? "bg-primary-50 dark:bg-primary-900/40 shadow-sm" : ""
                                )}>
                                    <item.icon size={22} className={cn("transition-transform duration-300", isActive && "rotate-3")} />
                                </div>
                                <span className="text-[9px] font-black tracking-tighter uppercase">{item.name}</span>
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full dark:bg-primary-400" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}

                {/* More Button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full text-gray-400 dark:text-gray-500 active:scale-95 transition-all group"
                >
                    <div className="p-2 group-active:bg-gray-100 dark:group-active:bg-gray-800 rounded-xl transition-colors">
                        <Menu size={22} />
                    </div>
                    <span className="text-[9px] font-black tracking-tighter uppercase">المزيد</span>
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
                    "absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-[3rem] p-8 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] overflow-hidden max-h-[90vh] flex flex-col border-t border-white/10",
                    mobileMenuOpen ? "translate-y-0" : "translate-y-full"
                )}>
                    {/* Pull Bar */}
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-8 shrink-0" />

                    <div className="flex items-center justify-between mb-8 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{academyName}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">قائمة الوصول السريع</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-inner"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pt-2 pb-12">
                        <div className="grid grid-cols-2 gap-4">
                            {filteredNavigation.map((item) => (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => cn(
                                        "flex flex-col items-center justify-center p-5 rounded-[2rem] transition-all duration-300 border-2",
                                        isActive
                                            ? "bg-primary-600 text-white border-primary-500 shadow-xl shadow-primary-600/20 scale-[1.02]"
                                            : "bg-gray-50 text-gray-500 border-transparent hover:border-gray-100 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:border-gray-800"
                                    )}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={24} className={cn("mb-3", isActive ? "animate-pulse" : "opacity-70")} />
                                            <span className="text-[11px] font-black text-center leading-tight tracking-tight">{item.name}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-4 py-5 rounded-[2rem] bg-rose-50 text-rose-600 font-black dark:bg-rose-950/30 dark:text-rose-400 transition-all active:scale-[0.98] shadow-sm hover:shadow-md border border-rose-100 dark:border-rose-900/30"
                            >
                                <LogOut size={22} />
                                <span className="uppercase tracking-widest text-sm">تسجيل الخروج من النظام</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
