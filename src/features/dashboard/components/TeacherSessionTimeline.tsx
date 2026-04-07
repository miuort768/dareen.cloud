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
    if (!sessions || sessions.length === 0) return (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-center">
            <Clock size={32} className="text-gray-300 mb-2" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">لا توجد حصص مبرمجة لليوم</p>
        </div>
    );

    // Sort sessions by time (basic string sort if time is 24h)
    const sortedSessions = [...sessions].sort((a,b) => a.time.localeCompare(b.time));

    return (
        <div className="bg-white border-4 border-gray-950 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Clock size={20} className="text-primary-600 animate-pulse" />
                    <h3 className="font-black text-xs uppercase tracking-tighter">الجدول الزمني لليوم</h3>
                </div>
                <span className="text-[8px] font-black px-2 py-0.5 bg-gray-950 text-white dark:bg-white dark:text-gray-950 uppercase tracking-widest">تحديث مباشر</span>
            </div>

            <div className="flex items-start gap-4 overflow-x-auto pb-4 custom-scrollbar scroll-smooth no-scrollbar">
                {sortedSessions.map((session, idx) => {
                    const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(session.status?.toLowerCase());
                    const isCancelled = ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(session.status?.toLowerCase());
                    
                    return (
                        <div key={session.id} className="flex flex-col items-center gap-2 min-w-[140px]">
                            {/* The Card */}
                            <div className={cn(
                                "w-full p-4 border-2 border-gray-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all relative group/card",
                                isCompleted ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500" : 
                                isCancelled ? "bg-rose-50 dark:bg-rose-900/10 border-rose-500" :
                                "bg-white dark:bg-gray-800 hover:-translate-y-1"
                            )}>
                                <div className="text-[9px] font-black text-gray-400 mb-1 uppercase flex items-center justify-between">
                                    <span>{session.time}</span>
                                    {isCompleted && <CheckCircle2 size={10} className="text-emerald-500" />}
                                    {isCancelled && <AlertCircle size={10} className="text-rose-500" />}
                                </div>
                                <h4 className="text-[11px] font-black text-gray-900 dark:text-white truncate mb-1">{session.studentName}</h4>
                                <p className="text-[9px] font-bold text-primary-600 truncate uppercase">{session.subject}</p>
                                
                                {!isCompleted && !isCancelled && (
                                    <button className="absolute inset-0 bg-primary-600/90 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                                        <Play size={16} className="fill-current" />
                                    </button>
                                )}
                            </div>

                            {/* Connector */}
                            {idx < sortedSessions.length - 1 && (
                                <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-800 absolute top-1/2 -right-4 -translate-y-1/2 hidden lg:block"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
