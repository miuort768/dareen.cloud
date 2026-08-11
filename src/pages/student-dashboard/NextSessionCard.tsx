import { Clock, BookOpen, ArrowLeft, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NextSession as NextSessionType } from './types';

interface NextSessionCardProps {
    nextSession: NextSessionType | null;
}

export const NextSessionCard = ({ nextSession }: NextSessionCardProps) => {
    const navigate = useNavigate();

    if (!nextSession) {
        return (
            <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-6 md:p-7 transition-colors duration-300">
                <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-primary-soft dark:bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock size={24} className="text-primary dark:text-primary" />
                    </div>
                    <div className="text-center md:text-start">
                        <p className="text-lg font-bold text-main dark:text-main mb-1">لا توجد حصص اليوم</p>
                        <p className="text-sm font-medium text-muted dark:text-muted">استرح وتابع أنشطتك الأخرى.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border overflow-hidden transition-all duration-300 hover:shadow-elevation-1">
            <div className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary-soft dark:bg-primary/10 flex items-center justify-center">
                        <Clock size={16} className="text-primary dark:text-primary" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-main dark:text-main">الحصة القادمة</h3>
                    <span className="text-xs font-medium text-muted dark:text-muted me-auto">{nextSession.time}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="w-14 h-14 rounded-xl bg-primary-soft dark:bg-primary/10 flex items-center justify-center shrink-0">
                        <GraduationCap size={24} className="text-primary dark:text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-base md:text-lg font-bold text-main dark:text-main">{nextSession.subject}</p>
                        {nextSession.teacher && (
                            <p className="text-xs font-medium text-muted dark:text-muted mt-1 flex items-center gap-1.5">
                                <BookOpen size={12} /> {nextSession.teacher}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/chat')}
                        className="flex items-center gap-1.5 bg-primary dark:bg-primary text-on-primary dark:text-on-primary text-xs font-semibold px-5 py-2.5 rounded-lg active:scale-95 transition-all duration-200 shrink-0 hover:bg-primary-hover dark:hover:bg-primary-hover"
                        aria-label={`دخول حصة ${nextSession.subject}`}
                    >
                        دخول <ArrowLeft size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};
