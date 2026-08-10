import { Clock, BookOpen, ArrowLeft, GraduationCap, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NextSession as NextSessionType } from './types';

interface NextSessionCardProps {
    nextSession: NextSessionType | null;
}

export const NextSessionCard = ({ nextSession }: NextSessionCardProps) => {
    const navigate = useNavigate();

    if (!nextSession) {
        return (
            <div className="rounded-2xl bg-gradient-to-br from-success/5 via-success/[0.02] to-background dark:from-[#0d0d0f] dark:to-[#0a0a0c] border border-border dark:border-[#D4AF37]/20 p-6 md:p-7">
                <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-success/10 dark:bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                        <Clock size={28} className="text-success dark:text-[#D4AF37]" />
                    </div>
                    <div className="text-center md:text-start">
                        <p className="text-lg font-bold text-main dark:text-white mb-1">لا توجد حصص اليوم</p>
                        <p className="text-sm font-medium text-muted dark:text-zinc-400">استرح وتابع أنشطتك الأخرى.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-gradient-to-l from-primary/10 via-primary/[0.03] to-background dark:from-[#D4AF37]/10 dark:via-[#0d0d0f] dark:to-[#0a0a0c] border border-border dark:border-[#D4AF37]/20 overflow-hidden transition-all duration-300 hover:shadow-elevation-2">
            <div className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 dark:bg-[#D4AF37]/15 flex items-center justify-center">
                        <Clock size={16} className="text-primary dark:text-[#D4AF37]" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-main dark:text-white">الحصة القادمة</h3>
                    <span className="text-xs font-medium text-muted dark:text-zinc-400 me-auto">{nextSession.time}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                        <GraduationCap size={24} className="text-primary dark:text-[#D4AF37]" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-base md:text-lg font-bold text-main dark:text-white">{nextSession.subject}</p>
                        {nextSession.teacher && (
                            <p className="text-xs font-medium text-muted dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                                <BookOpen size={12} /> {nextSession.teacher}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/chat')}
                        className="flex items-center gap-1.5 bg-primary dark:bg-[#D4AF37] text-on-primary dark:text-black text-xs font-semibold px-5 py-2.5 rounded-lg active:scale-95 transition-all duration-200 shrink-0 hover:bg-primary-hover dark:hover:bg-[#D4AF37]/90 hover:shadow-md"
                        aria-label={`دخول حصة ${nextSession.subject}`}
                    >
                        دخول <ArrowLeft size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};