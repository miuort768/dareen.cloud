import { GraduationCap, Sun, Moon, Bell, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StudentDashboardHeaderProps {
    headerScrolled: boolean;
    theme: string;
    setTheme: (t: string) => void;
    currentTime: Date;
    onBellClick: () => void;
}

const glass = "bg-surface/80 backdrop-blur-xl border-b border-border";

export const StudentDashboardHeader = ({ headerScrolled, theme, setTheme, currentTime, onBellClick }: StudentDashboardHeaderProps) => (
    <div className={cn("sticky top-0 z-[100] transition-all duration-500",
        headerScrolled ? glass : glass
    )}>
        <div className="px-5 pt-4 pb-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary-soft flex items-center justify-center shadow-lg shadow-primary/20">
                        <GraduationCap size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-main leading-tight">الرئيسية</h1>
                        <p className="text-[11px] font-medium text-muted">طالب</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                        className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-muted transition-colors">
                        {theme === 'dark' ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
                    </button>
                    <button onClick={onBellClick}
                        aria-label="الإعلانات"
                        className="relative w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-muted transition-colors">
                        <Bell size={15} strokeWidth={1.5} />
                        <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
                    </button>
                    <div className="px-3 py-1.5 rounded-xl bg-surface border border-border text-primary font-bold text-[11px] tabular-nums">
                        <Clock size={11} className="inline ms-1" />
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
