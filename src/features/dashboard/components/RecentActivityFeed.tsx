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
    ].sort((a, b) => {
        const timeA = a.time ? new Date(a.time).getTime() : 0;
        const timeB = b.time ? new Date(b.time).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    }).slice(0, 8);



    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 p-8 rounded-none shadow-xl flex flex-col h-full relative overflow-hidden transition-all duration-500 group/feed" dir="rtl">
            <div className="absolute top-0 right-0 w-2 h-full bg-slate-900 group-hover/feed:bg-indigo-600 transition-colors" />
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-none flex items-center justify-center shadow-lg group-hover/feed:rotate-6 transition-transform">
                        <History size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight uppercase">سجل النشاطات الحية</h3>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em]">Real-time Event Logging</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <ActivityIcon size={18} className="animate-pulse text-indigo-600" />
                </div>
            </div>

            {/* Activities List */}
            <div className="space-y-8 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-6 items-start group">
                            {/* Vertical Line Connector */}
                            {i !== activities.length - 1 && (
                                <div className="absolute top-12 right-[23px] w-[2px] h-10 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-200 transition-colors" />
                            )}

                            {/* Node Icon - Sharp Square */}
                            <div className={cn(
                                "z-10 w-12 h-12 flex items-center justify-center rounded-none shrink-0 transition-all border-2 border-white dark:border-slate-900 shadow-xl",
                                act.color === 'emerald' ? 'bg-emerald-600 text-white' :
                                act.color === 'rose' ? 'bg-rose-600 text-white' :
                                act.color === 'blue' ? 'bg-indigo-600 text-white' :
                                'bg-amber-500 text-white'
                            )}>
                                {act.type === 'session' ? <Calendar size={20} /> : <ListTodo size={20} />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col mb-1">
                                    <h4 className="font-black text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{act.title}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-none border uppercase tracking-widest",
                                            act.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            act.color === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                            act.color === 'blue' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        )}>
                                            {act.status}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={10} />
                                            {act.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-none flex items-center justify-center mx-auto mb-6">
                            <History size={36} className="text-slate-300" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Recent Activity Data</p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                <button className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all">
                    View Full System Logs
                </button>
            </div>
        </div>
    );
};

