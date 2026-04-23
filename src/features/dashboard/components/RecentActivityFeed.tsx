import { ListTodo, History, Clock, Calendar } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-6 rounded-none shadow-sm flex flex-col h-full" dir="rtl">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-950 text-white rounded-none flex items-center justify-center shadow-lg">
                        <History size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter">سجل النشاطات</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Updates</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <Clock size={16} />
                </div>
            </div>

            {/* Activities List */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-5 items-start group">
                            {/* Vertical Line Connector */}
                            {i !== activities.length - 1 && (
                                <div className="absolute top-10 right-[19px] w-[2px] h-6 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-200 transition-colors" />
                            )}

                            {/* Node Icon */}
                            <div className={cn(
                                "z-10 w-10 h-10 flex items-center justify-center rounded-none shrink-0 transition-all border-2 border-slate-950 shadow-md",
                                act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                act.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                act.color === 'blue' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-amber-50 text-amber-600'
                            )}>
                                {act.type === 'session' ? <Calendar size={16} /> : <ListTodo size={16} />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1.5">
                                    <h4 className="font-black text-xs text-slate-950 dark:text-white truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{act.title}</h4>
                                    <span className="text-[9px] font-black text-slate-400 tabular-nums uppercase">
                                        {new Date(act.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest",
                                        act.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                        act.color === 'rose' ? 'bg-rose-100 text-rose-700' :
                                        act.color === 'blue' ? 'bg-indigo-100 text-indigo-700' :
                                        'bg-amber-100 text-amber-700'
                                    )}>
                                        {act.status}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic opacity-60">
                                        {act.type === 'session' ? 'Session' : 'Task'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 opacity-20 flex flex-col items-center">
                        <History size={48} className="text-slate-300 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">لا توجد نشاطات مؤخراً</p>
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-slate-950 text-white rounded-none">
                <p className="text-[9px] font-black text-center uppercase tracking-[3px] opacity-80">
                    SYNCING LIVE • {new Date().toLocaleDateString('ar-EG')}
                </p>
            </div>
        </div>
    );
};
