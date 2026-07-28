import { GraduationCap, Flame, TrendingUp } from 'lucide-react';

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
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء الخير';
};

export const HeroSection = ({ name, grade, curriculum, points, rank, attendanceRate }: HeroSectionProps) => {
    const firstName = name.split(' ')[0] || name;

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted font-bold mb-1">{getGreeting()}</p>
                    <h2 className="text-xl font-bold text-main leading-tight mb-2">
                        يا {firstName} <span className="inline-block">{rank.icon}</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-micro text-muted">
                        {grade && (
                            <span className="inline-flex items-center gap-1 bg-primary-soft text-primary px-2 py-0.5 rounded-lg font-bold">
                                <GraduationCap size={10} /> {grade}
                            </span>
                        )}
                        {curriculum && (
                            <span className="inline-flex items-center gap-1 bg-surface border border-border px-2 py-0.5 rounded-lg font-bold">
                                {curriculum}
                            </span>
                        )}
                    </div>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4" />
                            <circle
                                cx="32" cy="32" r="28" fill="none"
                                stroke="var(--bg-primary)" strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${(attendanceRate / 100) * 175.9} 175.9`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-bold text-main">{attendanceRate}%</span>
                            <span className="text-micro text-muted">حضور</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-warning-soft flex items-center justify-center">
                        <Flame size={12} className="text-warning" />
                    </div>
                    <div>
                        <p className="text-micro text-muted">النقاط</p>
                        <p className="text-xs font-bold text-main">{points}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-primary-soft flex items-center justify-center">
                        <TrendingUp size={12} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-micro text-muted">اللقب</p>
                        <p className="text-xs font-bold text-main">{rank.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
