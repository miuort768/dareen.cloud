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
        <div className="relative animate-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none">
                        <Clock size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm text-slate-900 dark:text-white leading-none">الجدول الزمني اليومي</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">قائمة الحصص المجدولة</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">مباشر</span>
                </div>
            </div>

            {/* Session Cards — horizontal scroll on mobile, optimized for 4 on desktop */}
            <div className="flex items-stretch gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth px-1">
                {sortedSessions.map((session) => {
                    const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(session.status?.toLowerCase());
                    const isCancelled = ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(session.status?.toLowerCase());
                    const isOngoing = !isCompleted && !isCancelled;

                    return (
                        <div
                            key={session.id}
                            className={cn(
                                "flex-shrink-0 w-[140px] md:w-[calc(25%-9px)] min-w-[150px] p-4 rounded-[28px] border transition-all relative group/card",
                                isCompleted
                                    ? "bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100/50 dark:border-emerald-800/50"
                                    : isCancelled
                                    ? "bg-rose-50/30 dark:bg-rose-900/10 border-rose-100/50 dark:border-rose-800/50"
                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                            )}
                        >
                            {/* Time + status icon */}
                            <div className="flex items-center justify-between mb-3">
                                <div className={cn(
                                    "px-2 py-0.5 rounded-lg text-[9px] font-black tabular-nums border",
                                    isCompleted ? "bg-emerald-100 text-emerald-700 border-emerald-200" : isCancelled ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                )}>
                                    {session.time}
                                </div>
                                {isCompleted && <CheckCircle2 size={14} className="text-emerald-500" />}
                                {isCancelled && <AlertCircle size={14} className="text-rose-500" />}
                                {isOngoing && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />}
                            </div>

                            {/* Student name */}
                            <h4 className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate mb-1 leading-tight">
                                {session.studentName}
                            </h4>

                            {/* Subject */}
                            <div className="flex items-center gap-1.5">
                                <div className={cn(
                                    "w-1 h-1 rounded-full shrink-0",
                                    isCompleted ? "bg-emerald-400" : isCancelled ? "bg-rose-400" : "bg-indigo-400"
                                )} />
                                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase tracking-tight">
                                    {session.subject}
                                </p>
                            </div>

                            {/* Status label for clarity */}
                            <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest",
                                    isCompleted ? "text-emerald-500" : isCancelled ? "text-rose-500" : "text-indigo-500"
                                )}>
                                    {isCompleted ? 'مكتملة' : isCancelled ? 'ملغاة' : 'قادمة'}
                                </span>
                                {isOngoing && <Play size={10} className="text-indigo-500 fill-current" />}
                            </div>

                            {/* Hover play overlay */}
                            {isOngoing && (
                                <button className="absolute inset-2 bg-indigo-600/95 backdrop-blur-sm text-white rounded-[24px] flex flex-col items-center justify-center opacity-0 scale-95 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all shadow-xl shadow-indigo-600/20 z-10">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                                        <Play size={16} className="fill-current translate-x-0.5" />
                                    </div>
                                    <span className="font-black text-[10px] uppercase tracking-widest">بدء الحصة</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
