import { GraduationCap, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface HeroSectionProps {
    name: string;
    grade: string;
    curriculum: string;
    points: number;
    rank: { name: string; icon: string; color: string };
    attendanceRate: number;
}

const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 5) return 'تصبح على خير';
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء الخير';
};

const getDayName = (): string => {
    return format(new Date(), 'eeee', { locale: ar });
};

export const HeroSection = ({ name, grade, curriculum, points, rank, attendanceRate }: HeroSectionProps) => {
    const firstName = name.split(' ')[0] || name;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (attendanceRate / 100) * circumference;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-6 md:p-8 transition-colors duration-300">
            <div className="absolute -top-20 -end-20 w-60 h-60 rounded-full bg-primary/5 dark:bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -start-20 w-60 h-60 rounded-full bg-primary/5 dark:bg-primary/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted dark:text-muted mb-2">
                        {getGreeting()}، {firstName}
                    </p>
                    <h1 className="text-2xl md:text-[30px] font-bold text-main dark:text-main leading-tight mb-4">
                        {firstName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        {grade && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-soft dark:bg-primary/10 text-primary dark:text-primary text-xs font-semibold">
                                <GraduationCap size={12} /> {grade}
                            </span>
                        )}
                        {curriculum && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface dark:bg-surface text-muted dark:text-muted text-xs font-medium border border-border dark:border-border">
                                {curriculum}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface dark:bg-surface text-muted dark:text-muted text-xs font-medium border border-border dark:border-border">
                            <Calendar size={11} /> {getDayName()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <svg className="w-[120px] h-[120px] -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" className="text-border dark:text-border" strokeWidth="8" />
                            <circle
                                cx="60" cy="60" r={radius} fill="none"
                                stroke="currentColor" strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                className="text-primary dark:text-primary transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-main dark:text-main">{attendanceRate}%</span>
                            <span className="text-[11px] font-medium text-muted dark:text-muted">حضور</span>
                        </div>
                    </div>
                    <div className="hidden sm:flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface dark:bg-surface border border-border dark:border-border">
                            <Sparkles size={14} className="text-primary dark:text-primary" />
                            <span className="text-muted dark:text-muted text-xs font-medium">النقاط</span>
                            <span className="text-main dark:text-main font-bold text-sm">{points}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface dark:bg-surface border border-border dark:border-border">
                            <TrendingUp size={14} className="text-primary dark:text-primary" />
                            <span className="text-muted dark:text-muted text-xs font-medium">الرتبة</span>
                            <span className="text-main dark:text-main font-bold text-xs">{rank.name}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
