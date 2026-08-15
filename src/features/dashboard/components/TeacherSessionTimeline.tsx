import { Clock, Play, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';

interface TimelineSession {
    id: string;
    studentId?: string;
    studentName: string;
    time: string;
    subject: string;
    status: string;
}

interface TeacherSessionTimelineProps {
    sessions: TimelineSession[];
    onStudentClick?: (student: { id: string; name: string }) => void;
    onSessionStart?: (session: TimelineSession) => void;
}

export const TeacherSessionTimeline = ({ sessions, onStudentClick, onSessionStart }: TeacherSessionTimelineProps) => {
    const sortedSessions = useMemo(() => sessions ? [...sessions].sort((a, b) => a.time.localeCompare(b.time)) : [], [sessions]);
    const [currentPage, setCurrentPage] = useState(0);

    if (!sessions || sessions.length === 0) return null;
    const PAGE_SIZE = 3;
    const totalPages = Math.ceil(sortedSessions.length / PAGE_SIZE);
    const visibleSessions = sortedSessions.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    const handleStudentClick = (session: TimelineSession) => {
        onStudentClick?.({ id: session.studentId || session.id, name: session.studentName });
    };

    return (
        <div dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-soft dark:bg-primary/10 text-primary dark:text-primary rounded-xl flex items-center justify-center">
                        <Clock size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-main dark:text-main">الجدول الزمني</h3>
                        <p className="text-[11px] text-muted dark:text-muted font-medium mt-0.5">جدول الحصص اليومية</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success/10 text-success text-[10px] font-bold">
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    مباشر
                </div>
            </div>

            <div className="relative">
                <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory">
                    {visibleSessions.map((session) => {
                        const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(session.status?.toLowerCase());
                        const isCancelled = ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(session.status?.toLowerCase());
                        const isOngoing = !isCompleted && !isCancelled;

                        return (
                            <div
                                key={session.id}
                                onClick={() => handleStudentClick(session)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStudentClick(session); } }}
                                className={cn(
                                    "shrink-0 w-[280px] md:w-[calc(33.333%-14px)] min-w-[280px] p-4 rounded-xl border transition-all relative group/card cursor-pointer snap-center",
                                    isCompleted
                                        ? "bg-success/5 dark:bg-success/5 border-success/20"
                                        : isCancelled
                                        ? "bg-error/5 dark:bg-error/5 border-error/20"
                                        : "bg-surface dark:bg-card border-border dark:border-border hover:border-primary/30 dark:hover:border-border hover:-translate-y-0.5 hover:shadow-sm"
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-lg text-[11px] font-bold tabular-nums",
                                        isCompleted
                                            ? "bg-success/10 text-success"
                                            : isCancelled
                                            ? "bg-error/10 text-error"
                                            : "bg-primary/10 text-primary"
                                    )}>
                                        {session.time}
                                    </div>
                                    {isCompleted && <CheckCircle2 size={14} className="text-success" />}
                                    {isCancelled && <AlertCircle size={14} className="text-error" />}
                                    {isOngoing && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                                </div>

                                <h4 className="text-xs font-bold text-main dark:text-main truncate mb-1">
                                    {session.studentName}
                                </h4>

                                <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        isCompleted ? "bg-success" : isCancelled ? "bg-error" : "bg-primary"
                                    )} />
                                    <p className="text-[11px] text-muted dark:text-muted truncate">
                                        {session.subject}
                                    </p>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-border dark:border-border flex justify-between items-center">
                                    <span className={cn(
                                        "text-[11px] font-bold",
                                        isCompleted ? "text-success" : isCancelled ? "text-error" : "text-primary"
                                    )}>
                                        {isCompleted ? 'مكتملة' : isCancelled ? 'ملغاة' : 'قادمة'}
                                    </span>
                                    {isOngoing && <Play size={10} className="text-primary fill-current" />}
                                </div>

                                {isOngoing && (
                                    <Button onClick={(e) => { e.stopPropagation(); onSessionStart?.(session); }} className="absolute inset-2 bg-primary dark:bg-primary text-on-primary dark:text-on-primary rounded-xl flex-col opacity-0 scale-95 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all z-10">
                                        <div className="w-9 h-9 bg-on-primary/15 dark:bg-on-primary/15 text-on-primary dark:text-on-primary rounded-xl flex items-center justify-center mb-2">
                                            <Play size={18} className="fill-current translate-x-0.5" />
                                        </div>
                                        <span className="font-bold text-[11px]">بدء الحصة</span>
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className="pointer-events-auto w-8 h-8 md:w-9 md:h-9 rounded-xl bg-surface dark:bg-card border border-border dark:border-border flex items-center justify-center shadow-lg transition-all hover:shadow-xl hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed z-10"
                            aria-label="السابق"
                        >
                            <ChevronRight size={16} className="text-main dark:text-main" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="pointer-events-auto w-8 h-8 md:w-9 md:h-9 rounded-xl bg-surface dark:bg-card border border-border dark:border-border flex items-center justify-center shadow-lg transition-all hover:shadow-xl hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed z-10"
                            aria-label="التالي"
                        >
                            <ChevronLeft size={16} className="text-main dark:text-main" />
                        </button>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center gap-1.5 mt-2">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    i === currentPage ? "bg-primary w-6" : "bg-muted/30 hover:bg-muted/50"
                                )}
                                aria-label={`صفحة ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
