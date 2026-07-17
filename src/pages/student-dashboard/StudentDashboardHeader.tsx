import { GraduationCap, Sun, Moon, Bell, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StudentDashboardHeaderProps {
    headerScrolled: boolean;
    theme: string;
    setTheme: (t: string) => void;
    currentTime: Date;
    onBellClick: () => void;
}

export const StudentDashboardHeader = ({ headerScrolled, theme, setTheme, currentTime, onBellClick }: StudentDashboardHeaderProps) => (
    <div className={cn("sticky top-0 z-[100] transition-all duration-500",
        headerScrolled ? "bg-card shadow-sm border-b border-border" : "bg-card border-b border-transparent"
    )}>
        <div className="px-4 pt-3 pb-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-card bg-primary flex items-center justify-center text-on-primary shadow-sm">
                        <GraduationCap size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-main leading-tight">الرئيسية</h1>
                        <p className="text-micro font-medium text-muted">طالب</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                        className="w-8 h-8 flex items-center justify-center text-muted hover:bg-hover rounded-card transition-colors">
                        {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                    </button>
                    <button onClick={onBellClick}
                        aria-label="الإعلانات"
                        className="relative w-8 h-8 flex items-center justify-center text-muted hover:bg-hover rounded-card transition-colors">
                        <Bell size={16} strokeWidth={1.5} />
                        <span className="absolute top-1 start-1 w-2 h-2 bg-error rounded-full border-2 border-card" />
                    </button>
                    <div className="px-2.5 py-1.5 rounded-card bg-hover text-primary font-medium text-micro tabular-nums">
                        <Clock size={12} strokeWidth={1.5} className="inline me-1" />
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
