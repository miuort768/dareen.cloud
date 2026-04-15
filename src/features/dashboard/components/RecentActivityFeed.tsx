import { CheckCircle, ListTodo, History } from 'lucide-react';
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
            status: s.status === 'completed' ? 'تم' : s.status === 'cancelled' ? 'إلغاء' : 'نشط',
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
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 shadow-sm rounded-none border-t-2 border-t-slate-900 flex flex-col h-full" dir="rtl">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 items-center">
                <div className="w-8 h-8 bg-slate-100 text-slate-900 flex items-center justify-center">
                    <History size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">سجل النشاطات</h3>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={i} className="flex gap-4 items-start group/item">
                            <div className="flex flex-col items-center shrink-0">
                                <div className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-none border",
                                    act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    act.color === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    act.color === 'blue' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                )}>
                                    {act.type === 'session' ? <CheckCircle size={14} /> : <ListTodo size={14} />}
                                </div>
                                {i !== activities.length - 1 && (
                                    <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mt-1"></div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-[11px] text-slate-800 dark:text-white truncate">{act.title}</h4>
                                    <span className="text-[9px] font-bold text-slate-400 font-mono italic">{act.time}</span>
                                </div>
                                <div className="mt-1">
                                    <span className={cn(
                                        "text-[8px] font-black px-1.5 py-0.5 rounded-none border",
                                        act.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        act.color === 'rose' ? 'bg-rose-100 text-rose-700 border-rose-100' :
                                        act.color === 'blue' ? 'bg-indigo-100 text-indigo-700 border-indigo-100' :
                                        'bg-amber-100 text-amber-700 border-amber-100'
                                    )}>
                                        {act.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center text-slate-400 text-xs italic">لا نشاطات</div>
                )}
            </div>
        </div>
    );
};
