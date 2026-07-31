import { useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap, LayoutDashboard, Users, Wallet, UserCheck, CalendarDays,
    Settings, FileText, Receipt, DollarSign, ListTodo, Presentation,
    MessageCircle, Award, CalendarCheck, UserPlus, Home, Megaphone,
    MessageSquare, BookOpen, Briefcase, Mail, BookUser
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';
import { confirm } from '../../lib/confirmDialog';
import { useAcademyName, useLogout, useCurrentUser, useSidebarCollapsed, useSetSidebarCollapsed } from '../../context/AppContext';
import { useUnreadStore } from '../../store/unreadStore';
import { SessionCallAlert } from '../ui/SessionCallAlert';
import { SidebarDesktop } from './SidebarDesktop';
import { SidebarMobile } from './SidebarMobile';
import { AppTabBar } from '../../shared/components/mobile';

export interface NavItem {
    name: string;
    href: string;
    id: string;
    icon: LucideIcon;
}

export interface NavSection {
    label: string;
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
        { name: 'سجل الدفعات', href: '/teacher-payment-history', id: 'teacher_payment_history', icon: DollarSign },
        { name: 'سجل الدفعات', href: '/parent-payment-history', id: 'parent_payment_history', icon: DollarSign },
        { name: 'إدارة الإعلانات', href: '/announcements', id: 'announcements', icon: Megaphone },
        { name: 'إدارة المدونة', href: '/admin/blog', id: 'admin-blog', icon: FileText },
        { name: 'عملاء المدونة', href: '/admin/blog-customers', id: 'admin-blog-customers', icon: BookUser },
        { name: 'المنتدى', href: '/forum', id: 'forum', icon: MessageSquare },
        { name: 'الإعدادات', href: '/settings', id: 'settings', icon: Settings },
        { name: 'الأبناء', href: '/parent-students', id: 'parent_students', icon: Users },
        { name: 'لوحة الإعلانات', href: '/parent-announcements', id: 'parent_announcements', icon: Megaphone },
        { name: 'المهام والطلبات', href: '/tasks', id: 'tasks', icon: ListTodo },
        { name: 'رسائل الاتصال', href: '/admin-contacts', id: 'admin_contacts', icon: Mail },
        { name: 'طلبات التوظيف', href: '/admin-jobs', id: 'admin_jobs', icon: Briefcase },
    ];

    const filteredNavigation = navigation.filter(item => {
        if (!currentUser) return false;
        if (currentUser.permissions?.includes('*')) {
            if (['parent_dashboard', 'parent_students', 'parent_announcements', 'student_dashboard', 'tasks', 'parent_payment_history'].includes(item.id)) return false;
            return true;
        }
        if (currentUser.role === 'parent') {
            if (item.id === 'dashboard') return false;
            if (['parent_dashboard', 'chat', 'parent_students', 'parent_announcements', 'parent_payment_history', 'forum'].includes(item.id)) return true;
        }
        if (currentUser.role === 'student') {
            if (item.id === 'dashboard') return false;
            if (['student_dashboard', 'chat', 'forum', 'parent_announcements'].includes(item.id)) return true;
        }
        if (item.id === 'dashboard' && currentUser.role === 'teacher') return true;
        if (item.id === 'forum' && currentUser.role === 'teacher') return true;
        if (item.id === 'teacher_payment_history' && currentUser.role === 'teacher') return true;
        if (item.id === 'evaluations' && currentUser.role === 'teacher') return false;
        return currentUser.permissions?.includes(item.id);
    });

    const navigationSections = useMemo<NavSection[]>(() => {
        const byId = new Map(filteredNavigation.map(item => [item.id, item]));
        const pick = (...ids: string[]) => ids.map(id => byId.get(id)).filter(Boolean) as NavItem[];
        return [
            { label: 'الرئيسية', items: pick('dashboard', 'parent_dashboard', 'student_dashboard', 'chat') },
            { label: 'الأشخاص', items: pick('leads', 'trial_sessions', 'teachers', 'students', 'parents') },
            { label: 'التعلّم', items: pick('evaluations', 'attendance', 'schedule', 'appointments', 'tasks') },
            { label: 'المالية', items: pick('finance', 'monthly_closing', 'student_invoices', 'teacher_invoices', 'teacher_payment_history', 'parent_payment_history') },
            { label: 'المحتوى', items: pick('announcements', 'admin-blog', 'admin-blog-customers', 'forum', 'reports', 'admin_contacts', 'admin_jobs') },
            { label: 'النظام', items: pick('settings') },
        ].filter(section => section.items.length > 0);
    }, [filteredNavigation]);

    if (!currentUser) {
        return (
            <div className={cn("hidden lg:flex bg-card h-screen border-e border-border transition-all duration-300 flex-col sticky top-0 z-50 shrink-0", collapsed ? "w-16" : "w-56")}>
                <div className={cn("h-14 flex items-center border-b border-border transition-all duration-300", collapsed ? "justify-center px-0" : "justify-between px-5")}>
                    <div className={cn("flex items-center gap-2.5 overflow-hidden whitespace-nowrap", collapsed && "gap-0")}>
                        <div className={cn("shrink-0", collapsed ? "w-8 h-8" : "w-7 h-7")}>
                            <Image src="/dareen_logo_new.webp" alt="الشعار" className="w-full h-full" imgClassName="object-contain" />
                        </div>
                        <span className={cn("font-semibold text-sm text-main transition-all duration-300", collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100")}>دارين السابعة</span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-6 h-6 border-[3px] border-primary-light border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <>
            <SidebarDesktop
                sections={navigationSections}
                collapsed={collapsed}
                totalUnreadCount={totalUnreadCount}
                user={currentUser ? { name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role ?? '' } : null}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                onLogout={handleLogout}
            />
            <SidebarMobile
                navigation={filteredNavigation}
                mobileMenuOpen={mobileMenuOpen}
                totalUnreadCount={totalUnreadCount}
                academyName={academyName}
                onCloseMenu={() => setMobileMenuOpen(false)}
                onLogout={handleLogout}
            />
            <AppTabBar onMore={() => setMobileMenuOpen(true)} />
            <SessionCallAlert />
        </>
    );
});
