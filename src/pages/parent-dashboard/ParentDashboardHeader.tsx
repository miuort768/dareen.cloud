import { LogOut, Sun, Moon, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../shared/hooks/useDarkMode';
import { useCurrentUser } from '../../context/AppContext';
import { confirm } from '../../lib/confirmDialog';

interface ParentDashboardHeaderProps {
    logout: () => void;
}

export const ParentDashboardHeader = ({ logout }: ParentDashboardHeaderProps) => {
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const [theme, setTheme] = useDarkMode();
    const firstName = (currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0];

    return (
        <header className="sticky top-0 z-[100] bg-surface border-b border-border">
            <div className="max-w-page mx-auto px-5 pt-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-info-soft flex items-center justify-center">
                        <span className="text-sm font-bold text-info">ولي</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-main leading-tight">مرحباً {firstName}</h1>
                        <p className="text-micro font-medium text-muted">لوحة تحكم ولي الأمر</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                        className="w-11 h-11 rounded-xl bg-surface border border-border flex items-center justify-center text-muted transition-colors hover:bg-hover"
                    >
                        {theme === 'dark' ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
                    </button>
                    <button
                        onClick={() => navigate('/parent-announcements')}
                        aria-label="الإعلانات"
                        className="relative w-11 h-11 rounded-xl bg-surface border border-border flex items-center justify-center text-muted transition-colors hover:bg-hover"
                    >
                        <Bell size={15} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                        aria-label="تسجيل الخروج"
                        className="w-11 h-11 rounded-xl bg-surface border border-border flex items-center justify-center text-muted transition-colors hover:bg-hover"
                    >
                        <LogOut size={15} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </header>
    );
};
