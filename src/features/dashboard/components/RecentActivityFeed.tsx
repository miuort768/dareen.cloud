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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300" dir="rtl">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                        <History size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">سجل النشاطات</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Live Updates</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <Clock size={18} />
                </div>
            </div>

            {/* Activities List */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-5 items-start group">
                            {/* Vertical Line Connector */}
                            {i !== activities.length - 1 && (
                                <div className="absolute top-12 right-[23px] w-[2px] h-8 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-200 transition-colors" />
                            )}

                            {/* Node Icon */}
                            <div className={cn(
                                "z-10 w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 transition-all border-4 border-white dark:border-slate-900 shadow-sm",
                                act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                act.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                act.color === 'blue' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-amber-50 text-amber-600'
                            )}>
                                {act.type === 'session' ? <Calendar size={18} /> : <ListTodo size={18} />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{act.title}</h4>
                                    <span className={cn(
                                        "text-[10px] font-bold px-3 py-0.5 rounded-full",
                                        act.color === 'emerald' ? 'bg-emerald-100/50 text-emerald-700' :
                                        act.color === 'rose' ? 'bg-rose-100/50 text-rose-700' :
                                        act.color === 'blue' ? 'bg-indigo-100/50 text-indigo-700' :
                                        'bg-amber-100/50 text-amber-700'
                                    )}>
                                        {act.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History size={32} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">لا توجد نشاطات مؤخراً</p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800">
                <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest opacity-60">
                    مزامنة مباشرة
                </p>
            </div>
        </div>
    );
};
