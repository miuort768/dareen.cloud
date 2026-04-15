import { CheckCircle, Clock, AlertCircle, ListTodo, History } from 'lucide-react';
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
    // Combine and sort latest activities
    const activities: Activity[] = [
        ...sessions.slice(0, 5).map(s => ({
            id: `s-${s.id}`,
            type: 'session' as const,
            title: `${s.studentName}`,
            time: s.date || '',
            status: s.status === 'completed' ? 'تم الحضور' : s.status === 'cancelled' ? 'تم الغاء' : 'نشطة',
            color: s.status === 'completed' ? 'emerald' : s.status === 'cancelled' ? 'rose' : 'blue'
        })),
        ...tasks.slice(0, 5).map(t => ({
            id: `t-${t.id}`,
            type: 'task' as const,
            title: `${t.title}`,
            time: t.dueDate || '',
            status: t.status,
            color: 'amber'
        }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return (
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col h-full" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center border border-slate-900/20 dark:border-white/20">
                        <History size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">سجل النشاطات</h3>
                        <p className="text-sm font-medium text-gray-400">آخر المستجدات والفعاليات</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={i} className="flex gap-5 items-start relative group/item">
                            <div className="flex flex-col items-center shrink-0">
                                <div className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-500 group-hover/item:scale-110",
                                    act.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                                    act.color === 'rose' ? 'bg-rose-500/10 text-rose-600' :
                                    act.color === 'blue' ? 'bg-indigo-500/10 text-indigo-600' :
                                    'bg-amber-500/10 text-amber-600'
                                )}>
                                    {act.type === 'session' ? <CheckCircle size={18} /> : <ListTodo size={18} />}
                                </div>
                                {i !== activities.length - 1 && (
                                    <div className="w-0.5 h-12 bg-slate-100 dark:bg-slate-800 my-1"></div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{act.title}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{act.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight",
                                        act.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                        act.color === 'rose' ? 'bg-rose-100 text-rose-700' :
                                        act.color === 'blue' ? 'bg-indigo-100 text-indigo-700' :
                                        'bg-amber-100 text-amber-700'
                                    )}>
                                        {act.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-24 text-center">
                        <AlertCircle size={32} className="text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-400">السجل لا يزال بانتظار النشاطات</p>
                    </div>
                )}
            </div>
        </div>
    );
};
