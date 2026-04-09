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
        <div className="bg-white dark:bg-gray-950 border-4 border-gray-950 dark:border-gray-800 p-8 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] rounded-none h-full relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary-600/5 -ml-12 -mt-12 rounded-full blur-2xl pointer-events-none"></div>
            
            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-gray-950 dark:text-white flex items-center gap-3 mb-8 border-b-4 border-gray-950 dark:border-gray-800 pb-6">
                <div className="p-2 bg-primary-600 text-white border-2 border-gray-950">
                    <Clock size={20} />
                </div>
                آخر النشاطات
            </h3>

            <div className="space-y-6">
                {activities.length > 0 ? activities.map((act, i) => (
                    <div key={i} className="flex gap-5 items-start relative group/item">
                        {i !== activities.length - 1 && (
                            <div className="absolute top-10 bottom-0 right-5 w-1 bg-gray-100 dark:bg-gray-800 border-x border-gray-200"></div>
                        )}
                        <div className={cn(
                            "w-10 h-10 shrink-0 flex items-center justify-center rounded-none border-2 border-gray-950 z-10 shadow-[2px_2px_0px_0px_black]",
                            act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                            act.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                            act.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                            'bg-amber-50 text-amber-600'
                        )}>
                            {act.type === 'session' ? <CheckCircle size={18} /> : <ListTodo size={18} />}
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                            <h4 className="font-black text-xs md:text-sm text-gray-950 dark:text-white truncate uppercase tracking-tight mb-2">{act.title}</h4>
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5 border-2 border-gray-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]",
                                    act.color === 'emerald' ? 'bg-emerald-600 text-white' :
                                    act.color === 'rose' ? 'bg-rose-600 text-white' :
                                    act.color === 'blue' ? 'bg-blue-600 text-white' :
                                    'bg-amber-600 text-white'
                                )}>
                                    {act.status}
                                </span>
                                <span className="text-[10px] font-black text-gray-400 font-mono italic">{act.time}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-24 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 border-2 border-gray-100 mx-auto flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">السجل فارغ حالياً كهدوء الصباح</p>
                    </div>
                )}
            </div>
        </div>
    );
};
