import { Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TimelineSession {
    id: string;
    studentName: string;
    time: string;
    subject: string;
    status: string;
}

interface TeacherSessionTimelineProps {
    sessions: TimelineSession[];
    onStudentClick?: (student: { id: string; name: string }) => void;
}

export const TeacherSessionTimeline = ({ sessions, onStudentClick }: TeacherSessionTimelineProps) => {
    if (!sessions || sessions.length === 0) return null;

    const sortedSessions = [...sessions].sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div className="relative" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-none flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-slate-900 dark:text-white uppercase tracking-tight">الجدول الزمني</h3>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 uppercase tracking-tight">جدول الحصص اليومية المباشرة</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white border border-emerald-450 rounded-none shadow-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[9px] font-medium uppercase">LIVE NOW</span>
                </div>
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
                            onClick={() => onStudentClick?.({ id: session.studentName, name: session.studentName })}
                            className={cn(
                                "flex-shrink-0 w-[150px] md:w-[calc(25%-12px)] min-w-[160px] p-4 rounded-none border transition-all relative group/card shadow-sm cursor-pointer",
                                isCompleted
                                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30"
                                    : isCancelled
                                    ? "bg-rose-50 dark:bg-rose-950/20 border-rose-500/30"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:-translate-y-1"
                            )}
                        >
                            {/* Time + status icon */}
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                    "px-2 py-0.5 rounded-none text-[10px] font-medium tabular-nums border",
                                    isCompleted 
                                        ? "bg-emerald-500 text-white border-emerald-400" 
                                        : isCancelled 
                                        ? "bg-rose-500 text-white border-rose-400" 
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                                )}>
                                    {session.time}
                                </div>
                                {isCompleted && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />}
                                {isCancelled && <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />}
                                {isOngoing && <div className="w-2.5 h-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-none border border-white/20 animate-pulse" />}
                            </div>

                            {/* Student name */}
                            <h4 className="text-xs font-medium text-slate-900 dark:text-white truncate mb-1 uppercase tracking-tight">
                                {session.studentName}
                            </h4>

                            {/* Subject */}
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-none border border-slate-300 dark:border-slate-700",
                                    isCompleted ? "bg-emerald-600" : isCancelled ? "bg-rose-600" : "bg-indigo-600"
                                )} />
                                <p className="text-[9px] font-normal text-slate-500 dark:text-slate-400 truncate uppercase">
                                    {session.subject}
                                </p>
                            </div>

                            {/* Status label */}
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className={cn(
                                    "text-[9px] font-medium uppercase",
                                    isCompleted ? "text-emerald-600" : isCancelled ? "text-rose-600" : "text-indigo-600"
                                )}>
                                    {isCompleted ? 'مكتملة' : isCancelled ? 'ملغاة' : 'قادمة'}
                                </span>
                                {isOngoing && <Play size={10} className="text-indigo-600 dark:text-indigo-400 fill-current" />}
                            </div>

                            {/* Hover play overlay */}
                            {isOngoing && (
                                <button className="absolute inset-2 bg-indigo-600/95 dark:bg-indigo-750/95 text-white rounded-none border border-indigo-500 dark:border-indigo-400 flex flex-col items-center justify-center opacity-0 scale-95 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all z-10">
                                    <div className="w-9 h-9 bg-white text-indigo-600 rounded-none border border-white/20 flex items-center justify-center mb-2 shadow-sm">
                                        <Play size={18} className="fill-current translate-x-0.5" />
                                    </div>
                                    <span className="font-medium text-[9px] uppercase">بدء الحصة</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
