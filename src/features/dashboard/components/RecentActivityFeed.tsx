import { ListTodo, History, Clock, Calendar, Activity as ActivityIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Activity {
    id: string;
    type: 'session' | 'task';
    title: string;
    time: string;
    status: string;
    color: string;
}

interface RecentActivityFeedProps {
    sessions: any[];
    tasks: any[];
}

export const RecentActivityFeed = ({ sessions, tasks }: RecentActivityFeedProps) => {
    const activities: Activity[] = [
        ...sessions.slice(0, 5).map(s => ({
            id: `s-${s.id}`,
            type: 'session' as const,
            title: `${s.studentName}`,
            time: s.date || '',
            status: s.status === 'completed' ? 'تمت الجلسة' : s.status === 'cancelled' ? 'ملغاة' : 'نشطة الآن',
            color: s.status === 'completed' ? 'emerald' : s.status === 'cancelled' ? 'rose' : 'blue'
        })),
        ...tasks.slice(0, 5).map(t => ({
            id: `t-${t.id}`,
            type: 'task' as const,
            title: `${t.title}`,
            time: t.dueDate || '',
            status: t.status === 'completed' ? 'مهمة منجزة' : 'قيد التنفيذ',
            color: t.status === 'completed' ? 'emerald' : 'amber'
        }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-5 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full relative overflow-hidden transition-all group/feed" dir="rtl">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-950 group-hover/feed:bg-indigo-600 transition-colors" />
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-950 text-white rounded-none flex items-center justify-center shadow-lg transition-transform group-hover/feed:rotate-3">
                        <History size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">سجل النشاطات</h3>
                        <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-tight">Real-time Logging</p>
                    </div>
                </div>
                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <ActivityIcon size={14} className="animate-pulse text-indigo-600" />
                </div>
            </div>

            {/* Compact Activities List */}
            <div className="space-y-5 flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-4 items-start group">
                            {/* Vertical Line Connector */}
                            {i !== activities.length - 1 && (
                                <div className="absolute top-10 right-[19px] w-[1px] h-8 bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-300 transition-colors" />
                            )}

                            {/* Node Icon */}
                            <div className={cn(
                                "z-10 w-10 h-10 flex items-center justify-center rounded-none shrink-0 transition-all border-2 border-slate-950/10 shadow-sm",
                                act.color === 'emerald' ? 'bg-emerald-600 text-white' :
                                act.color === 'rose' ? 'bg-rose-600 text-white' :
                                act.color === 'blue' ? 'bg-indigo-600 text-white' :
                                'bg-amber-500 text-white'
                            )}>
                                {act.type === 'session' ? <Calendar size={18} /> : <ListTodo size={18} />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex flex-col">
                                    <h4 className="font-black text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{act.title}</h4>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={cn(
                                            "text-[8px] font-black px-1.5 py-0.5 border uppercase",
                                            act.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            act.color === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            act.color === 'blue' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        )}>
                                            {act.status}
                                        </span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1">
                                            <Clock size={9} />
                                            {act.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <History size={24} className="text-slate-200 mb-2" />
                        <p className="text-[9px] font-black text-slate-400 uppercase">No Recent Activity</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <button className="w-full h-10 bg-slate-950 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-[0.98]">
                    View Full System Logs
                </button>
            </div>
        </div>
    );

};

