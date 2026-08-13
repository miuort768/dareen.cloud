import { LogOut, Sun, Moon, Bell, Home, Calendar, MessageSquare, User, MessageCircle, ListTodo, Wallet, CalendarDays } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../shared/hooks/useDarkMode';
import { useCurrentUser, useAcademicYear } from '../context/AppContext';
import { confirm } from '../lib/confirmDialog';
import { cn } from '../lib/utils';
import { IconButton } from '../shared/components/ui/IconButton';

interface TeacherDashboardHeaderProps {
    logout: () => void;
}

const navTabs = [
    { id: 'home', label: 'الرئيسية', icon: Home, path: '/teacher-dashboard' },
    { id: 'schedule', label: 'الجدول', icon: Calendar, path: '/schedule' },
    { id: 'tasks', label: 'المهام', icon: ListTodo, path: '/tasks' },
    { id: 'forum', label: 'المنتدى', icon: MessageCircle, path: '/forum' },
    { id: 'chat', label: 'الرسائل', icon: MessageSquare, path: '/chat' },
    { id: 'payments', label: 'سجل الدفع', icon: Wallet, path: '/teacher-payment-history' },
    { id: 'profile', label: 'الحساب', icon: User, path: '/teacher-profile' },
];

export const TeacherDashboardHeader = ({ logout }: TeacherDashboardHeaderProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = useCurrentUser();
    const academicYear = useAcademicYear();
    const [theme, setTheme] = useDarkMode();
    const firstName = (currentUser?.name || currentUser?.username || 'المعلمة').split(' ')[0];

    return (
        <header className="sticky top-0 z-[100] bg-surface/90 dark:bg-surface/90 backdrop-blur-xl border-b border-border dark:border-primary/20 transition-colors duration-500">
            <div className="max-w-page mx-auto">
                <div className="flex items-center justify-between px-4 md:px-5 h-16">
                    <button
                        onClick={() => navigate('/teacher-profile')}
                        className="flex items-center gap-3 text-start rounded-lg p-1 -m-1 hover:bg-hover transition-all duration-200 active:scale-[0.98]"
                        aria-label="الملف الشخصي"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary dark:bg-primary flex items-center justify-center shadow-elevation-1">
                            <span className="text-sm font-bold text-on-primary dark:text-on-primary">{firstName.charAt(0)}</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold text-main dark:text-main leading-tight">ꩥ��� {firstName}</h1>
                            <p className="text-[11px] font-medium text-muted dark:text-muted">���� ���� ������</p>
                        </div>
                    </button>

                    {academicYear && (
                        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-soft text-primary text-[11px] font-bold rounded-lg">
                            <CalendarDays size={13} />
                            {academicYear}
                        </span>
                    )}

                    <div className="flex items-center gap-1.5">
                        <IconButton
                            icon={theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                            label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        />
                        <IconButton
                            icon={<Bell size={16} strokeWidth={1.5} />}
                            label="الإعلانات"
                            onClick={() => navigate('/announcements')}
                        />
                        <IconButton
                            icon={<LogOut size={16} strokeWidth={1.5} />}
                            label="تسجيل الخروج"
                            variant="error"
                            onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                        />
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-1 px-4 pb-0">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = location.pathname === tab.path;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all duration-200 relative",
                                    isActive
                                        ? "text-primary dark:text-primary bg-background dark:bg-card border-t border-x border-border dark:border-border"
                                        : "text-muted dark:text-muted hover:text-main dark:hover:text-main hover:bg-accent/5 dark:hover:bg-primary/5 active:scale-[0.97]"
                                )}
                            >
                                <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                                {tab.label}
                                {isActive && (
                                    <span className="absolute bottom-0 inset-x-4 h-0.5 bg-primary dark:bg-primary rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </header>
    );
};