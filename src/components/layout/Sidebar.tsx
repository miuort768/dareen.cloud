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
    MessageSquare,
    BookOpen,
    Clock,
    Briefcase
} from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';
import { confirm } from '../../lib/confirmDialog';
import { useAcademyName, useLogout, useCurrentUser, useSidebarCollapsed, useSetSidebarCollapsed } from '../../context/AppContext';
import { X, Menu } from 'lucide-react';
import { useUnreadStore } from '../../store/unreadStore';
import { SessionCallAlert } from '../ui/SessionCallAlert';

export const Sidebar = () => {
    const academyName = useAcademyName();
    const logout = useLogout();
    const currentUser = useCurrentUser();
    const collapsed = useSidebarCollapsed();
    const setCollapsed = useSetSidebarCollapsed();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const activeConversationId = useUnreadStore(s => s.activeConversationId);
    const totalUnreadCount = useUnreadStore(s => s.totalUnreadCount);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(collapsed));
    }, [collapsed]);

    const handleLogout = async () => {
        if (!await confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
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
        { name: 'بوابة المتابعة', href: '/parent-dashboard', id: 'parent_dashboard', icon: Home },
        { name: 'حساب الطالب', href: '/student-dashboard', id: 'student_dashboard', icon: GraduationCap },
        { name: 'الدردشة', href: '/chat', id: 'chat', icon: totalUnreadCount > 0 ? MessageSquare : MessageCircle },
        { name: 'العملاء والمهتمين', href: '/leads', id: 'leads', icon: UserPlus },
        { name: 'جلسات المراجعة', href: '/trial-sessions', id: 'trial_sessions', icon: BookOpen },
        { name: 'المعلمات', href: '/teachers', id: 'teachers', icon: Presentation },
        { name: 'الطلاب', href: '/students', id: 'students', icon: GraduationCap },
        { name: 'أولياء الأمور', href: '/parents', id: 'parents', icon: Users },
        { name: 'التقييمات والنقاط', href: '/evaluations', id: 'evaluations', icon: Award },
        { name: 'المالية', href: '/finance', id: 'finance', icon: Wallet },
        { name: 'تقفيل الشهر', href: '/monthly-closing', id: 'monthly_closing', icon: CalendarCheck },
        { name: 'الحضور والغياب', href: '/attendance', id: 'attendance', icon: UserCheck },
        { name: 'الجداول الدراسية', href: '/schedule', id: 'schedule', icon: CalendarDays },
        { name: 'المواعيد', href: '/appointments', id: 'appointments', icon: CalendarCheck },
        { name: 'التقارير', href: '/reports', id: 'reports', icon: FileText },
        { name: 'فواتير الطلاب', href: '/student-invoices', id: 'student_invoices', icon: DollarSign },
        { name: 'فواتير المعلمات', href: '/teacher-invoices', id: 'teacher_invoices', icon: Receipt },
        { name: 'إدارة الإعلانات', href: '/announcements', id: 'announcements', icon: Megaphone },
        { name: 'إدارة المدونة', href: '/admin/blog', id: 'admin-blog', icon: FileText },
        { name: 'المنتدى', href: '/forum', id: 'forum', icon: MessageSquare },
        { name: 'الإعدادات', href: '/settings', id: 'settings', icon: Settings },
        { name: 'الأبناء', href: '/parent-students', id: 'parent_students', icon: Users },
        { name: 'لوحة الإعلانات', href: '/parent-announcements', id: 'parent_announcements', icon: Megaphone },
        { name: 'المهام والطلبات', href: '/tasks', id: 'tasks', icon: ListTodo },
        { name: 'طلبات التوظيف', href: '/admin-jobs', id: 'admin_jobs', icon: Briefcase },
    ];

    const filteredNavigation = navigation.filter(item => {
        if (!currentUser) return false;
        if (currentUser.permissions?.includes('*')) {
            if (['parent_dashboard', 'parent_students', 'parent_announcements', 'student_dashboard', 'tasks'].includes(item.id)) return false;
            return true;
        }
        if (currentUser.role === 'parent') {
            if (item.id === 'dashboard') return false;
            if (['parent_dashboard', 'chat', 'parent_students', 'parent_announcements', 'forum'].includes(item.id)) return true;
        }
        if (currentUser.role === 'student') {
            if (item.id === 'dashboard') return false;
            if (['student_dashboard', 'chat', 'forum', 'parent_announcements'].includes(item.id)) return true;
        }
        if (item.id === 'dashboard' && currentUser.role === 'teacher') return true;
        if (item.id === 'forum' && currentUser.role === 'teacher') return true;
        if (item.id === 'evaluations' && currentUser.role === 'teacher') return false;
        return currentUser.permissions?.includes(item.id);
    });

    if (!currentUser) {
        return (
            <>
                <div
                    className={cn(
                        "hidden lg:flex bg-card h-screen border-e border-border transition-all duration-300 flex-col sticky top-0 z-50 shrink-0",
                        collapsed ? "w-20" : "w-72"
                    )}
                >
                    <div className={cn(
                        "h-16 flex items-center border-b border-border transition-all duration-300",
                        collapsed ? "justify-center px-0" : "justify-between px-6"
                    )}>
                        <div className={cn("flex items-center gap-3 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                            <div className={cn("shrink-0", collapsed ? "w-10 h-10" : "w-8 h-8")}>
                                <Image src="/dareen_logo_new.jpg" alt="الشعار" className="w-full h-full" imgClassName="object-contain" />
                            </div>
                            <span className={cn(
                                "font-medium text-lg text-main transition-all duration-300 uppercase tracking-tighter",
                                collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100 pe-3"
                            )}>
                                دارين السابعة
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary-light border-t-primary rounded-full animate-spin"></div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div
                className={cn(
                    "hidden lg:flex bg-card h-screen border-e border-border transition-all duration-300 flex-col fixed top-0 start-0 z-50 shrink-0",
                    collapsed ? "w-20" : "w-72"
                )}
            >
                <div className={cn(
                    "h-14 items-center border-b border-border transition-all duration-300",
                    collapsed ? "flex justify-center px-0" : "hidden xl:flex justify-between px-6"
                )}>
                    <div className={cn("flex items-center gap-2 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                        <div className={cn("shrink-0", collapsed ? "w-8 h-8" : "w-6 h-6")}>
                            <Image src="/dareen_logo_new.jpg" alt="الشعار" className="w-full h-full" imgClassName="object-contain" />
                        </div>
                        <span className={cn(
                            "font-medium text-lg text-main transition-all duration-300 uppercase tracking-tighter",
                            collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100 pe-3"
                        )}>
                            نظام دارين السابعة
                        </span>
                    </div>
                </div>

                <nav className={cn("flex-1 py-2 space-y-0.5 overflow-y-auto custom-scrollbar", collapsed ? "px-2" : "px-4")}>
                    {filteredNavigation.map((item) => (
                        <NavLink
                            key={`${item.href}-${item.id}`}
                            to={item.href}
                            className={({ isActive }) => cn(
                                "flex items-center gap-2.5 px-3 py-1.5 rounded-none transition-all duration-200 group relative text-sm",
                                isActive
                                    ? "bg-primary-soft text-primary"
                                    : "text-muted hover:bg-hover hover:text-main",
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
                                    <span className="absolute -top-1.5 -start-1.5 w-4 h-4 flex items-center justify-center bg-error text-on-error text-micro font-medium rounded-full animate-pulse shadow-sm border border-border">
                                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "whitespace-nowrap transition-all duration-300",
                                collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                            )}>
                                {item.name}
                            </span>
                            {collapsed && (
                                <div className="absolute end-full top-1/2 -translate-y-1/2 rtl:ms-2 rtl:end-full ltr:me-2 ltr:end-auto ltr:start-full px-2 py-1 bg-surface text-main text-xs rounded-none opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="px-4 pt-2 pb-0 border-t border-border">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-none hover:bg-hover text-muted transition-colors"
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

                <div className="px-4 pb-4 pt-0">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 rounded-none text-error hover:bg-error-soft transition-colors",
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

            <div className={cn(
                "lg:hidden fixed bottom-0 end-0 start-0 h-[70px] bg-card/95 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 z-[100] overflow-hidden max-w-full transition-transform duration-300",
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
                                ? "bg-primary-soft text-primary px-4 py-2"
                                : "text-muted p-2"
                        )}
                    >
                        {({ isActive }) => (
                            <div className="flex items-center gap-2 relative">
                                <span className={cn(
                                    "text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-500",
                                    isActive ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0"
                                )}>
                                    {item.name}
                                </span>

                                <div className="relative">
                                    <item.icon size={20} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />

                                    {item.id === 'chat' && totalUnreadCount > 0 && (
                                        <span className="absolute -top-2 -start-2 w-5 h-5 bg-error text-on-error text-micro font-medium flex items-center justify-center rounded-full ring-2 ring-border shadow-sm md:animate-pulse">
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
                    className="flex items-center justify-center p-2 text-muted hover:text-primary transition-colors"
                >
                    <Menu size={22} strokeWidth={2} />
                </button>
            </div>

            <div className={cn(
                "fixed inset-0 z-[110] bg-background/40 backdrop-blur-md lg:hidden transition-all duration-500 overflow-hidden",
                mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div
                    className="absolute inset-0"
                    onClick={() => setMobileMenuOpen(false)}
                />
                <div className={cn(
                    "absolute bottom-0 end-0 start-0 bg-card p-4 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden max-h-[90vh] flex flex-col border-t border-white/10 w-full max-w-full",
                    mobileMenuOpen ? "translate-y-0" : "translate-y-full"
                )}>
                    <div className="w-12 h-1 bg-surface mx-auto mb-4 shrink-0" />

                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                        <div className="flex items-center gap-3">
                            <Image src="/dareen_logo_new.jpg" alt="الشعار" className="w-8 h-8" imgClassName="object-contain" />
                            <div>
                                <h2 className="text-base font-medium text-main leading-tight">{academyName}</h2>
                                <p className="text-micro text-muted font-normal uppercase tracking-widest">قائمة الوصول السريع</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-3 bg-error text-on-error rounded-xl hover:bg-error-hover transition-colors"
                        >
                            <X size={22} />
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
                                            ? "bg-primary-soft text-primary shadow-sm border border-primary-soft"
                                            : "bg-surface text-muted hover:bg-hover"
                                    )}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={cn(
                                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all relative",
                                                isActive ? "bg-card text-primary shadow-sm" : "bg-card/50 text-muted"
                                            )}>
                                                <item.icon size={14} />
                                                {item.id === 'chat' && totalUnreadCount > 0 && (
                                                    <span className="absolute -top-1 -start-1 w-3.5 h-3.5 flex items-center justify-center bg-error text-on-error text-micro font-medium rounded-full shadow-sm border border-border">
                                                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs font-normal tracking-tight truncate">{item.name}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-none bg-error text-on-error font-normal hover:bg-error-hover transition-colors shadow-md"
                            >
                                <LogOut size={16} />
                                <span className="uppercase tracking-widest text-micro">تسجيل الخروج</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SessionCallAlert />
        </>
    );
};
