import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
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
            title: `حصة: ${s.studentName} - ${s.subject}`,
            time: s.date || '',
            status: s.status,
            color: s.status === 'completed' ? 'emerald' : s.status === 'cancelled' ? 'rose' : 'blue'
        })),
        ...tasks.slice(0, 5).map(t => ({
            id: `t-${t.id}`,
            type: 'task' as const,
            title: `مهمة: ${t.title}`,
            time: t.dueDate || '',
            status: t.status,
            color: 'amber'
        }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return (
        <div className="bg-white dark:bg-gray-950 border-4 border-gray-900 dark:border-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] rounded-none h-full relative group">
            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center gap-2 mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                <Clock size={20} className="text-primary-600" />
                آخر النشاطات
            </h3>

            <div className="space-y-4">
                {activities.length > 0 ? activities.map((act, i) => (
                    <div key={i} className="flex gap-4 items-start relative pb-4 last:pb-0">
                        {i !== activities.length - 1 && (
                            <div className="absolute top-8 bottom-0 right-4 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                        )}
                        <div className={cn(
                            "w-8 h-8 shrink-0 flex items-center justify-center rounded-none border-2 border-current z-10",
                            act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                            act.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' :
                            act.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                            'bg-amber-50 text-amber-600 dark:bg-amber-900/30'
                        )}>
                            {act.type === 'session' ? <CheckCircle size={14} /> : <ListTodo size={14} />}
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                            <h4 className="font-black text-xs text-gray-950 dark:text-white truncate uppercase tracking-tight">{act.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5 border border-current",
                                    act.color === 'emerald' ? 'text-emerald-600' :
                                    act.color === 'rose' ? 'text-rose-600' :
                                    act.color === 'blue' ? 'text-blue-600' :
                                    'text-amber-600'
                                )}>
                                    {act.status}
                                </span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{act.time}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">لا توجد نشاطات مؤخراً</p>
                    </div>
                )}
            </div>
        </div>
    );
};
