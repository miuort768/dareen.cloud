import { useState, useEffect, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    GraduationCap, LayoutDashboard, Users, Wallet, UserCheck, CalendarDays,
    Settings, FileText, Receipt, DollarSign, ListTodo, Presentation,
    MessageCircle, Award, CalendarCheck, UserPlus, Home, Megaphone,
    MessageSquare, BookOpen, Briefcase, Mail, BarChart3, BellRing,
    School, PiggyBank, ClipboardCheck, RadioTower
} from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';
import { confirm } from '../../lib/confirmDialog';
import { useAcademyName, useLogout, useCurrentUser, useSidebarCollapsed, useSetSidebarCollapsed } from '../../context/AppContext';
import { useUnreadStore } from '../../store/unreadStore';
import { SessionCallAlert } from '../ui/SessionCallAlert';
import { SidebarDesktop } from './SidebarDesktop';
import { SidebarMobile } from './SidebarMobile';

export interface NavItem {
    name: string;
    href: string;
    id: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

export interface NavGroup {
    label: string;
    icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    items: NavItem[];
}

export const Sidebar = memo(() => {
    const academyName = useAcademyName();
    const logout = useLogout();
    const currentUser = useCurrentUser();
    const collapsed = useSidebarCollapsed();
    const setCollapsed = useSetSidebarCollapsed();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const totalUnreadCount = useUnreadStore(s => s.totalUnreadCount);
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminDashboard = location.pathname.includes('/admin-dashboard');

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

    const navigationGroups: NavGroup[] = [
        {
            label: 'الرئيسية',
            icon: LayoutDashboard,
            items: [
                { name: 'لوحة التحكم', href: getDashboardLink(), id: 'dashboard', icon: LayoutDashboard },
                { name: 'بوابة المتابعة', href: '/parent-dashboard', id: 'parent_dashboard', icon: Home },
                { name: 'حساب الطالب', href: '/student-dashboard', id: 'student_dashboard', icon: GraduationCap },
            ]
        },
        {
            label: 'الأكاديميا',
            icon: School,
            items: [
                { name: 'الطلاب', href: '/students', id: 'students', icon: GraduationCap },
                { name: 'المعلمات', href: '/teachers', id: 'teachers', icon: Presentation },
                { name: 'أولياء الأمور', href: '/parents', id: 'parents', icon: Users },
                { name: 'التقييمات والنقاط', href: '/evaluations', id: 'evaluations', icon: Award },
                { name: 'جلسات المراجعة', href: '/trial-sessions', id: 'trial_sessions', icon: BookOpen },
                { name: 'العملاء والمهتمين', href: '/leads', id: 'leads', icon: UserPlus },
                { name: 'الجداول الدراسية', href: '/schedule', id: 'schedule', icon: CalendarDays },
                { name: 'الحضور والغياب', href: '/attendance', id: 'attendance', icon: UserCheck },
                { name: 'المواعيد', href: '/appointments', id: 'appointments', icon: CalendarCheck },
            ]
        },
        {
            label: 'المالية',
            icon: PiggyBank,
            items: [
                { name: 'المالية', href: '/finance', id: 'finance', icon: Wallet },
                { name: 'تقفيل الشهر', href: '/monthly-closing', id: 'monthly_closing', icon: ClipboardCheck },
                { name: 'فواتير الطلاب', href: '/student-invoices', id: 'student_invoices', icon: DollarSign },
                { name: 'فواتير المعلمات', href: '/teacher-invoices', id: 'teacher_invoices', icon: Receipt },
            ]
        },
        {
            label: 'التقارير',
            icon: BarChart3,
            items: [
                { name: 'التقارير', href: '/reports', id: 'reports', icon: BarChart3 },
                { name: 'المهام والطلبات', href: '/tasks', id: 'tasks', icon: ListTodo },
            ]
        },
        {
            label: 'التواصل',
            icon: RadioTower,
            items: [
                { name: 'الدردشة', href: '/chat', id: 'chat', icon: totalUnreadCount > 0 ? MessageSquare : MessageCircle },
                { name: 'الإعلانات', href: '/announcements', id: 'announcements', icon: Megaphone },
                { name: 'رسائل الاتصال', href: '/admin-contacts', id: 'admin_contacts', icon: Mail },
                { name: 'المنتدى', href: '/forum', id: 'forum', icon: MessageSquare },
                { name: 'طلبات التوظيف', href: '/admin-jobs', id: 'admin_jobs', icon: Briefcase },
                { name: 'إدارة المدونة', href: '/admin/blog', id: 'admin-blog', icon: FileText },
            ]
        },
        {
            label: 'الإعدادات',
            icon: Settings,
            items: [
                { name: 'الإعدادات', href: '/settings', id: 'settings', icon: Settings },
                { name: 'لوحة الإعلانات', href: '/parent-announcements', id: 'parent_announcements', icon: BellRing },
                { name: 'الأبناء', href: '/parent-students', id: 'parent_students', icon: Users },
            ]
        }
    ];

    const allNavigation = navigationGroups.flatMap(g => g.items);

    const filterGroup = (group: NavGroup): NavGroup | null => {
        const filtered = group.items.filter(item => {
            if (!currentUser) return false;
            if (currentUser.permissions?.includes('*')) {
                if (['parent_dashboard', 'parent_students', 'parent_announcements', 'student_dashboard', 'tasks'].includes(item.id)) return false;
                return true;
            }
            if (currentUser.role === 'parent') {
                if (item.id === 'dashboard') return false;
                return ['parent_dashboard', 'chat', 'parent_students', 'parent_announcements', 'forum'].includes(item.id);
            }
            if (currentUser.role === 'student') {
                if (item.id === 'dashboard') return false;
                return ['student_dashboard', 'chat', 'forum', 'parent_announcements'].includes(item.id);
            }
            if (item.id === 'dashboard' && currentUser.role === 'teacher') return true;
            if (item.id === 'forum' && currentUser.role === 'teacher') return true;
            if (item.id === 'evaluations' && currentUser.role === 'teacher') return false;
            return currentUser.permissions?.includes(item.id);
        });
        if (filtered.length === 0) return null;
        return { ...group, items: filtered };
    };

    const filteredGroups = navigationGroups.map(filterGroup).filter(Boolean) as NavGroup[];
    const filteredNavigation = allNavigation.filter(item => {
        if (!currentUser) return false;
        if (currentUser.permissions?.includes('*')) {
            if (['parent_dashboard', 'parent_students', 'parent_announcements', 'student_dashboard', 'tasks'].includes(item.id)) return false;
            return true;
        }
        if (currentUser.role === 'parent') {
            if (item.id === 'dashboard') return false;
            return ['parent_dashboard', 'chat', 'parent_students', 'parent_announcements', 'forum'].includes(item.id);
        }
        if (currentUser.role === 'student') {
            if (item.id === 'dashboard') return false;
            return ['student_dashboard', 'chat', 'forum', 'parent_announcements'].includes(item.id);
        }
        if (item.id === 'dashboard' && currentUser.role === 'teacher') return true;
        if (item.id === 'forum' && currentUser.role === 'teacher') return true;
        if (item.id === 'evaluations' && currentUser.role === 'teacher') return false;
        return currentUser.permissions?.includes(item.id);
    });

    if (!currentUser) {
        return (
            <div className={cn("hidden lg:flex bg-card h-screen border-e border-border transition-all duration-300 flex-col sticky top-0 z-50 shrink-0", collapsed ? "w-20" : "w-72")}>
                <div className={cn("h-16 flex items-center border-b border-border transition-all duration-300", collapsed ? "justify-center px-0" : "justify-between px-6")}>
                    <div className={cn("flex items-center gap-3 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                        <div className={cn("shrink-0", collapsed ? "w-10 h-10" : "w-8 h-8")}>
                            <Image src="/dareen_logo_new.webp" alt="الشعار" className="w-full h-full" imgClassName="object-contain" />
                        </div>
                        <span className={cn("font-medium text-lg text-main transition-all duration-300 uppercase tracking-tighter", collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100 pe-3")}>دارين السابعة</span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary-light border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <>
            <SidebarDesktop
                navigation={filteredNavigation}
                navigationGroups={filteredGroups}
                collapsed={collapsed}
                totalUnreadCount={totalUnreadCount}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                onLogout={handleLogout}
            />
            {!isAdminDashboard && (
                <SidebarMobile
                    navigation={filteredNavigation}
                    mobileMenuOpen={mobileMenuOpen}
                    totalUnreadCount={totalUnreadCount}
                    academyName={academyName}
                    onToggleMenu={() => setMobileMenuOpen(true)}
                    onCloseMenu={() => setMobileMenuOpen(false)}
                    onLogout={handleLogout}
                />
            )}
            <SessionCallAlert />
        </>
    );
});
