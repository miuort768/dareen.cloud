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
    sessions: { id: string; studentName: string; date?: string; status?: string }[];
    tasks: { id: string; title: string; dueDate?: string; status?: string }[];
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col h-full relative overflow-hidden transition-all group/feed" dir="rtl">
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl flex items-center justify-center border border-white/10 shadow-sm transition-transform group-hover/feed:rotate-3">
                        <History size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">سجل النشاطات</h3>
                        <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-tight">سجل المراقبة الفورية</p>
                    </div>
                </div>
                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                    <ActivityIcon size={14} className="animate-pulse text-indigo-600" />
                </div>
            </div>

            {/* Compact Activities List */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-5 items-start group">
                            {/* Vertical Line Connector */}
                            {i !== activities.length - 1 && (
                                <div className="absolute top-10 right-[19px] w-[2px] h-10 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 transition-colors" />
                            )}

                            {/* Node Icon */}
                            <div className={cn(
                                "z-10 w-10 h-10 flex items-center justify-center rounded-xl shrink-0 transition-all border border-slate-200 dark:border-slate-700 shadow-sm",
                                act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                act.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                act.color === 'blue' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-amber-50 text-amber-500'
                            )}>
                                {act.type === 'session' ? <Calendar size={18} /> : <ListTodo size={18} />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col">
                                    <h4 className="font-black text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{act.title}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-md uppercase border",
                                            act.color === 'emerald' ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                                            act.color === 'rose' ? 'bg-rose-50/50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20' :
                                            act.color === 'blue' ? 'bg-indigo-50/50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20' :
                                            'bg-amber-50/50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20'
                                        )}>
                                            {act.status}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                                            <Clock size={10} className="text-slate-300" />
                                            {act.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                        <History size={24} className="text-slate-200 mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">لا توجد نشاطات مؤخراً</p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                <button className="w-full h-11 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all rounded-xl shadow-sm active:scale-[0.98]">
                    عرض سجل النظام الكامل
                </button>
            </div>
        </div>
    );
};
