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
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-[13px] text-slate-800 dark:text-white leading-none">الجدول الزمني لليوم</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">قائمة الحصص المجدولة</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">تحديث مباشر</span>
                </div>
            </div>

            {/* Session Cards — horizontal scroll on mobile */}
            <div className="flex items-stretch gap-3 md:gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth px-1">
                {sortedSessions.map((session) => {
                    const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(session.status?.toLowerCase());
                    const isCancelled = ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(session.status?.toLowerCase());
                    const isOngoing = !isCompleted && !isCancelled;

                    return (
                        <div
                            key={session.id}
                            className={cn(
                                "flex-shrink-0 w-[140px] md:w-[180px] p-4 rounded-2xl border transition-all relative group/card",
                                isCompleted
                                    ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/50"
                                    : isCancelled
                                    ? "bg-rose-50/50 dark:bg-rose-900/10 border-rose-200/50 dark:border-rose-800/50"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
                            )}
                        >
                            {/* Time + status icon */}
                            <div className="flex items-center justify-between mb-3">
                                <div className={cn(
                                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tabular-nums",
                                    isCompleted ? "bg-emerald-100 text-emerald-700" : isCancelled ? "bg-rose-100 text-rose-700" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                )}>
                                    {session.time}
                                </div>
                                {isCompleted && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                                {isCancelled && <AlertCircle size={14} className="text-rose-500 shrink-0" />}
                                {isOngoing && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />}
                            </div>

                            {/* Student name */}
                            <h4 className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate mb-1 leading-tight group-hover/card:text-indigo-600 transition-colors">
                                {session.studentName}
                            </h4>

                            {/* Subject */}
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <div className={cn(
                                    "w-1 h-1 rounded-full shrink-0",
                                    isCompleted ? "bg-emerald-400" : isCancelled ? "bg-rose-400" : "bg-indigo-400"
                                )} />
                                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase tracking-tight">
                                    {session.subject}
                                </p>
                            </div>

                            {/* Status label for clarity */}
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-tighter px-1",
                                    isCompleted ? "text-emerald-500" : isCancelled ? "text-rose-500" : "text-indigo-500"
                                )}>
                                    {isCompleted ? 'مكتملة بنجاح' : isCancelled ? 'حصة ملغاة' : 'بإنتظار البدء'}
                                </span>
                            </div>

                            {/* Hover play overlay */}
                            {isOngoing && (
                                <button className="absolute inset-x-2 bottom-2 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center opacity-0 scale-95 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all font-black text-xs gap-2 shadow-lg shadow-indigo-600/30">
                                    <Play size={14} className="fill-current" />
                                    <span>بدء الحصة</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
