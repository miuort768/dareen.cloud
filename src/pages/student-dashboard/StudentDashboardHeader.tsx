import { GraduationCap, Sun, Moon, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../shared/hooks/useDarkMode';

export const StudentDashboardHeader = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useDarkMode();

    return (
        <header className="sticky top-0 z-[100] bg-surface border-b border-border">
            <div className="max-w-page mx-auto px-5 pt-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                        <GraduationCap size={18} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-main leading-tight">الرئيسية</h1>
                        <p className="text-micro font-medium text-muted">طالب</p>
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
                        onClick={() => navigate('/announcements')}
                        aria-label="الإعلانات"
                        className="relative w-11 h-11 rounded-xl bg-surface border border-border flex items-center justify-center text-muted transition-colors hover:bg-hover"
                    >
                        <Bell size={15} strokeWidth={1.5} />
                        <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-error rounded-full border-2 border-surface" />
                    </button>
                </div>
            </div>
        </header>
    );
};
