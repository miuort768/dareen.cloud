import { Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    onSessionStart?: (sessionId: string) => void;
}

export const TeacherSessionTimeline = ({ sessions, onStudentClick, onSessionStart }: TeacherSessionTimelineProps) => {
    if (!sessions || sessions.length === 0) return null;

    const sortedSessions = [...sessions].sort((a, b) => a.time.localeCompare(b.time));

    return (
        <Card className="relative" dir="rtl">
            <CardContent>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background dark:bg-[#0a0a0c] text-main dark:text-white rounded-none flex items-center justify-center border border-border dark:border-[#D4AF37]/20 shadow-soft">
                        <Clock size={20} className="dark:text-[#D4AF37]" />
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-main dark:text-white uppercase tracking-tight">الجدول الزمني</h3>
                        <p className="text-micro text-muted dark:text-zinc-400 font-medium mt-0.5 uppercase tracking-tight">جدول الحصص اليومية المباشرة</p>
                    </div>
                </div>
                <Badge variant="secondary" className="hidden md:inline-flex items-center gap-2 px-3 py-1 bg-success text-on-success border border-success rounded-none">
                    <div className="w-1.5 h-1.5 bg-on-success rounded-full animate-pulse" />
                    <span className="text-micro font-medium uppercase">LIVE NOW</span>
                </Badge>
            </div>

            {/* Session Cards */}
            <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth px-1">
                {sortedSessions.map((session) => {
                    const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(session.status?.toLowerCase());
                    const isCancelled = ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(session.status?.toLowerCase());
                    const isOngoing = !isCompleted && !isCancelled;

                    return (
                        <div
                            key={session.id}
                            onClick={() => onStudentClick?.({ id: session.studentId || session.id, name: session.studentName })}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStudentClick?.({ id: session.studentId || session.id, name: session.studentName }); } }}
                            className={cn(
                                "flex-shrink-0 w-[150px] md:w-[calc(25%-12px)] min-w-[150px] md:min-w-0 p-4 rounded-none border transition-all relative group/card shadow-soft cursor-pointer",
                                isCompleted
                                    ? "bg-success-soft dark:bg-success/10 border-success/30"
                                    : isCancelled
                                    ? "bg-error-soft dark:bg-error/10 border-error/30"
                                    : "bg-card dark:bg-[#0d0d0f] border-border dark:border-[#D4AF37]/20 hover:border-primary/50 dark:hover:border-[#D4AF37]/40 hover:-translate-y-1"
                            )}
                        >
                            {/* Time + status icon */}
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                    "px-2 py-0.5 rounded-none text-micro font-medium tabular-nums border",
                                    isCompleted 
                                        ? "bg-success text-on-success border-success" 
                                        : isCancelled 
                                        ? "bg-error text-on-error border-error" 
                                        : "bg-surface dark:bg-[#1a1a1f] text-main dark:text-white border-border dark:border-[#D4AF37]/20"
                                )}>
                                    {session.time}
                                </div>
                                {isCompleted && <CheckCircle2 size={16} className="text-success" />}
                                {isCancelled && <AlertCircle size={16} className="text-error" />}
                                {isOngoing && <div className="w-2.5 h-2.5 bg-primary rounded-none border border-white/20 animate-pulse" />}
                            </div>

                            {/* Student name */}
                            <h4 className="text-xs font-medium text-main dark:text-white truncate mb-1 uppercase tracking-tight">
                                {session.studentName}
                            </h4>

                            {/* Subject */}
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-none border border-border",
                                    isCompleted ? "bg-success" : isCancelled ? "bg-error" : "bg-primary"
                                )} />
                                <p className="text-micro font-normal text-muted dark:text-zinc-400 truncate uppercase">
                                    {session.subject}
                                </p>
                            </div>

                            {/* Status label */}
                            <div className="mt-4 pt-3 border-t border-border dark:border-[#D4AF37]/20 flex justify-between items-center">
                                <span className={cn(
                                    "text-micro font-medium uppercase",
                                    isCompleted ? "text-success" : isCancelled ? "text-error" : "text-primary"
                                )}>
                                    {isCompleted ? 'مكتملة' : isCancelled ? 'ملغاة' : 'قادمة'}
                                </span>
                                {isOngoing && <Play size={10} className="text-primary fill-current" />}
                            </div>

                            {/* Hover play overlay */}
                            {isOngoing && (
                                <Button onClick={() => onSessionStart?.(session.id)} className="absolute inset-2 bg-primary/95 dark:bg-[#D4AF37]/95 text-on-primary dark:text-black rounded-none border border-primary dark:border-[#D4AF37] flex-col opacity-0 scale-95 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all z-10">
                                    <div className="w-9 h-9 bg-card dark:bg-[#0d0d0f] text-main dark:text-white rounded-none border border-border/20 dark:border-[#D4AF37]/20 flex items-center justify-center mb-2 shadow-soft">
                                        <Play size={18} className="fill-current translate-x-0.5" />
                                    </div>
                                    <span className="font-medium text-micro uppercase">بدء الحصة</span>
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </CardContent></Card>
    );
};
