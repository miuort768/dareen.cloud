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
        <div className="relative" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-none flex items-center justify-center border-2 border-slate-950 shadow-md">
                        <Clock size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">الجدول الزمني</h3>
                        <p className="text-[9px] text-slate-400 font-black mt-0.5 uppercase tracking-tight">Daily Schedule Hub</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white border-2 border-slate-950 rounded-none">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase">LIVE NOW</span>
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
                            className={cn(
                                "flex-shrink-0 w-[150px] md:w-[calc(25%-12px)] min-w-[160px] p-4 rounded-none border-2 transition-all relative group/card",
                                isCompleted
                                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-600"
                                    : isCancelled
                                    ? "bg-rose-50 dark:bg-rose-900/10 border-rose-600"
                                    : "bg-white dark:bg-slate-900 border-slate-950 hover:shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] hover:-translate-y-1"
                            )}
                        >
                            {/* Time + status icon */}
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                    "px-2 py-0.5 rounded-none text-[10px] font-black tabular-nums border-2 border-slate-950 shadow-sm",
                                    isCompleted ? "bg-emerald-600 text-white" : isCancelled ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-900"
                                )}>
                                    {session.time}
                                </div>
                                {isCompleted && <CheckCircle2 size={16} className="text-emerald-600" />}
                                {isCancelled && <AlertCircle size={16} className="text-rose-600" />}
                                {isOngoing && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-none border border-slate-950 animate-pulse" />}
                            </div>

                            {/* Student name */}
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate mb-1 uppercase tracking-tight">
                                {session.studentName}
                            </h4>

                            {/* Subject */}
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-none border border-slate-950/20",
                                    isCompleted ? "bg-emerald-600" : isCancelled ? "bg-rose-600" : "bg-indigo-600"
                                )} />
                                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase">
                                    {session.subject}
                                </p>
                            </div>

                            {/* Status label */}
                            <div className="mt-4 pt-3 border-t-2 border-slate-950/5 flex justify-between items-center">
                                <span className={cn(
                                    "text-[9px] font-black uppercase",
                                    isCompleted ? "text-emerald-600" : isCancelled ? "text-rose-600" : "text-indigo-600"
                                )}>
                                    {isCompleted ? 'COMPLETED' : isCancelled ? 'CANCELLED' : 'UPCOMING'}
                                </span>
                                {isOngoing && <Play size={10} className="text-indigo-600 fill-current" />}
                            </div>

                            {/* Hover play overlay - Brutalist Style */}
                            {isOngoing && (
                                <button className="absolute inset-2 bg-indigo-600 text-white rounded-none border-2 border-slate-950 flex flex-col items-center justify-center opacity-0 scale-95 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="w-9 h-9 bg-white text-indigo-600 rounded-none border-2 border-slate-950 flex items-center justify-center mb-2 shadow-sm">
                                        <Play size={18} className="fill-current translate-x-0.5" />
                                    </div>
                                    <span className="font-black text-[9px] uppercase">بدء الحصة</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

};
