import { GraduationCap, Sparkles } from 'lucide-react';
import { RANK_ICON_MAP } from '../../shared/utils/ranks';
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
    const RankIconComponent = RANK_ICON_MAP[rank.icon] || Sparkles;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (attendanceRate / 100) * circumference;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-light dark:via-primary-deep dark:to-primary-soft p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12)_0%,transparent_70%)]" />
            <div className="absolute -top-10 -end-10 w-40 h-40 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-10 -start-10 w-40 h-40 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white/80 mb-1">
                        {getGreeting()}، {firstName} <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/15 align-middle"><RankIconComponent size={12} className="text-white" /></span>
                    </p>
                    <h1 className="text-2xl md:text-[30px] font-bold text-white leading-tight mb-2">
                        {firstName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        {grade && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-white text-xs font-semibold">
                                <GraduationCap size={12} /> {grade}
                            </span>
                        )}
                        {curriculum && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white/80 text-xs font-medium">
                                {curriculum}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white/80 text-xs font-medium">
                            {getDayName()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <svg className="w-[120px] h-[120px] -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                            <circle
                                cx="60" cy="60" r={radius} fill="none"
                                stroke="rgba(255,255,255,0.9)" strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white">{attendanceRate}%</span>
                            <span className="text-[11px] font-semibold text-white/70">حضور</span>
                        </div>
                    </div>
                    <div className="hidden sm:flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10">
                            <Sparkles size={14} className="text-white/80" />
                            <span className="text-white/80 text-xs font-medium">النقاط</span>
                            <span className="text-white font-bold text-sm">{points}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};