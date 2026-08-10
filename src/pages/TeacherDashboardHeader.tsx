import { LogOut, Sun, Moon, Bell, Home, Calendar, MessageSquare, User, MessageCircle, ListTodo, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../shared/hooks/useDarkMode';
import { useCurrentUser } from '../context/AppContext';
import { confirm } from '../lib/confirmDialog';
import { cn } from '../lib/utils';

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
    const [theme, setTheme] = useDarkMode();
    const firstName = (currentUser?.name || currentUser?.username || 'المعلمة').split(' ')[0];

    return (
        <header className="sticky top-0 z-[100] bg-surface/90 dark:bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-border dark:border-[#D4AF37]/20 transition-colors duration-500">
            <div className="max-w-page mx-auto">
                <div className="flex items-center justify-between px-4 md:px-5 h-16">
                    <button
                        onClick={() => navigate('/teacher-profile')}
                        className="flex items-center gap-3 text-start"
                        aria-label="الملف الشخصي"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-deep dark:from-[#D4AF37] dark:to-[#f59e0b] flex items-center justify-center shadow-elevation-1">
                            <span className="text-sm font-bold text-on-primary dark:text-black">{firstName.charAt(0)}</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold text-main dark:text-white leading-tight">مرحباً {firstName}</h1>
                            <p className="text-[11px] font-medium text-muted dark:text-zinc-400">لوحة تحكم المعلمة</p>
                        </div>
                    </button>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                            className="w-10 h-10 rounded-xl bg-surface dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 flex items-center justify-center text-muted dark:text-[#D4AF37] transition-colors hover:bg-hover dark:hover:bg-[#D4AF37]/10"
                        >
                            {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                        </button>
                        <button
                            onClick={() => navigate('/announcements')}
                            aria-label="الإعلانات"
                            className="relative w-10 h-10 rounded-xl bg-surface dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 flex items-center justify-center text-muted dark:text-zinc-400 transition-colors hover:bg-hover dark:hover:bg-[#D4AF37]/10"
                        >
                            <Bell size={16} strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                            aria-label="تسجيل الخروج"
                            className="w-10 h-10 rounded-xl bg-surface dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 flex items-center justify-center text-muted dark:text-zinc-400 transition-colors hover:bg-error/10 hover:text-error"
                        >
                            <LogOut size={16} strokeWidth={1.5} />
                        </button>
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
                                    "flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all duration-200 relative",
                                    isActive
                                        ? "text-primary dark:text-[#D4AF37] bg-background dark:bg-[#0d0d0f] border-t border-x border-border dark:border-[#D4AF37]/20"
                                        : "text-muted dark:text-zinc-400 hover:text-main dark:hover:text-white hover:bg-accent/5 dark:hover:bg-[#D4AF37]/5"
                                )}
                            >
                                <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                                {tab.label}
                                {isActive && (
                                    <span className="absolute bottom-0 inset-x-4 h-0.5 bg-primary dark:bg-[#D4AF37] rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </header>
    );
};