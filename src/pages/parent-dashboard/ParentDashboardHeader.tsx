import { LogOut, Sun, Moon, Bell, Home, Users, MessageCircle, Wallet, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../shared/hooks/useDarkMode';
import { useCurrentUser } from '../../context/AppContext';
import { confirm } from '../../lib/confirmDialog';
import { cn } from '../../lib/utils';
import { Image } from '../../shared/components/ui';

interface ParentDashboardHeaderProps {
    logout: () => void;
}

const navTabs = [
    { id: 'home', label: 'الرئيسية', icon: Home, path: '/parent-dashboard' },
    { id: 'children', label: 'أبنائي', icon: Users, path: '/parent-students' },
    { id: 'forum', label: 'المنتدى', icon: MessageCircle, path: '/forum' },
    { id: 'payments', label: 'سجل الدفع', icon: Wallet, path: '/parent-payment-history' },
    { id: 'profile', label: 'الحساب', icon: User, path: '/parent-profile' },
];

export const ParentDashboardHeader = ({ logout }: ParentDashboardHeaderProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = useCurrentUser();
    const [theme, setTheme] = useDarkMode();
    const firstName = (currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0];

    return (
        <header className="sticky top-0 z-[100] bg-surface/90 dark:bg-surface/90 backdrop-blur-xl border-b border-border dark:border-primary/20 transition-colors duration-500">
            <div className="max-w-page mx-auto">
                <div className="flex items-center justify-between px-4 md:px-5 h-16">
                    <div className="flex items-center gap-3">
                        <Image src="/dareen_logo_new.webp" alt="دارين" className="w-9 h-9 rounded-xl shrink-0" imgClassName="object-contain" />
                        <button
                            onClick={() => navigate('/parent-profile')}
                            className="flex items-center gap-3 text-start rounded-lg p-1 -m-1 hover:bg-hover transition-all duration-200 active:scale-[0.98]"
                            aria-label="الملف الشخصي"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-deep dark:from-primary dark:to-warning flex items-center justify-center shadow-elevation-1">
                                <span className="text-sm font-bold text-on-primary dark:text-on-primary">{firstName.charAt(0)}</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-sm font-bold text-main dark:text-main leading-tight">مرحباً {firstName}</h1>
                                <p className="text-[11px] font-medium text-muted dark:text-muted">لوحة تحكم ولي الأمر</p>
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                            className="w-10 h-10 rounded-lg bg-card dark:bg-card border border-border dark:border-primary/20 flex items-center justify-center text-muted dark:text-primary transition-all duration-200 hover:bg-hover hover:text-main dark:hover:bg-primary/10 active:scale-95"
                        >
                            {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                        </button>
                        <button
                            onClick={() => navigate('/parent-announcements')}
                            aria-label="الإعلانات"
                            className="relative w-10 h-10 rounded-lg bg-card dark:bg-card border border-border dark:border-primary/20 flex items-center justify-center text-muted dark:text-muted transition-all duration-200 hover:bg-hover hover:text-main dark:hover:bg-primary/10 active:scale-95"
                        >
                            <Bell size={16} strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                            aria-label="تسجيل الخروج"
                            className="w-10 h-10 rounded-lg bg-card dark:bg-card border border-border dark:border-primary/20 flex items-center justify-center text-muted dark:text-muted transition-all duration-200 hover:bg-error/10 hover:text-error active:scale-95"
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
                                    "flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all duration-200 relative",
                                    isActive
                                        ? "text-primary dark:text-primary bg-background dark:bg-card border-t border-x border-border dark:border-primary/20"
                                        : "text-muted dark:text-muted hover:text-main dark:hover:text-white hover:bg-accent/5 dark:hover:bg-primary/5 active:scale-[0.97]"
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