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
}

export const TeacherSessionTimeline = ({ sessions }: TeacherSessionTimelineProps) => {
    if (!sessions || sessions.length === 0) return null;

    const sortedSessions = [...sessions].sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-indigo-500 animate-pulse" />
                    <h3 className="font-black text-xs text-slate-700 dark:text-white uppercase tracking-widest">الجدول الزمني لليوم</h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">تحديث مباشر</span>
                </div>
            </div>

            {/* Session Cards — horizontal scroll on mobile */}
            <div className="flex items-stretch gap-2 md:gap-3 overflow-x-auto pb-2 no-scrollbar">
                {sortedSessions.map((session) => {
                    const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(session.status?.toLowerCase());
                    const isCancelled = ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(session.status?.toLowerCase());

                    return (
                        <div
                            key={session.id}
                            className={cn(
                                "flex-shrink-0 w-[120px] md:w-[150px] p-2.5 md:p-3 border transition-all relative group/card",
                                isCompleted
                                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                                    : isCancelled
                                    ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:-translate-y-0.5"
                            )}
                        >
                            {/* Time + status icon */}
                            <div className="flex items-center justify-between mb-1.5">
                                <span className={cn(
                                    "text-[8px] font-black uppercase tabular-nums",
                                    isCompleted ? "text-emerald-600" : isCancelled ? "text-rose-500" : "text-slate-400"
                                )}>{session.time}</span>
                                {isCompleted && <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />}
                                {isCancelled && <AlertCircle size={11} className="text-rose-500 shrink-0" />}
                                {!isCompleted && !isCancelled && <div className="w-1.5 h-1.5 bg-indigo-400 animate-pulse" />}
                            </div>

                            {/* Student name */}
                            <h4 className="text-[10px] md:text-[11px] font-black text-slate-900 dark:text-white truncate mb-0.5 leading-tight">
                                {session.studentName}
                            </h4>

                            {/* Subject */}
                            <p className="text-[8px] font-bold text-indigo-500 truncate uppercase">{session.subject}</p>

                            {/* Hover play overlay */}
                            {!isCompleted && !isCancelled && (
                                <button className="absolute inset-0 bg-indigo-600/90 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <Play size={14} className="fill-current" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
