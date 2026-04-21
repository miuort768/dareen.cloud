import { CheckCircle2, ListTodo, History, Clock } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[1.5rem] shadow-sm flex flex-col h-full" dir="rtl">
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2] rounded-xl flex items-center justify-center">
                        <History size={20} />
                    </div>
                    <div className="text-right">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">سجل النشاطات</h3>
                        <p className="text-slate-400 text-[10px] font-bold mt-0.5">متابعة فورية للتحركات</p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Clock size={14} />
                </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-4 items-start group/act">
                            {/* Vertical Line Connector */}
                            {i !== activities.length - 1 && (
                                <div className="absolute top-10 right-[17px] w-[1px] h-full bg-slate-100 dark:bg-slate-800 group-hover/act:bg-indigo-100 dark:group-hover/act:bg-indigo-900/30 transition-colors"></div>
                            )}

                            {/* Activity Icon Node */}
                            <div className={cn(
                                "z-10 w-9 h-9 flex items-center justify-center rounded-xl border-2 border-white dark:border-slate-900 shadow-sm transition-transform group-hover/act:scale-110",
                                act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                act.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                act.color === 'blue' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-amber-50 text-amber-600'
                            )}>
                                {act.type === 'session' ? <CheckCircle2 size={14} /> : <ListTodo size={14} />}
                            </div>
                            
                            {/* Content Card */}
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h4 className="font-black text-[12px] text-slate-800 dark:text-white truncate group-hover/act:text-[#5c59f2] transition-colors">{act.title}</h4>
                                    <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                                        {new Date(act.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[8px] font-black px-1.5 py-0.5 rounded-md",
                                        act.color === 'emerald' ? 'bg-emerald-100/50 text-emerald-700' :
                                        act.color === 'rose' ? 'bg-rose-100/50 text-rose-700' :
                                        act.color === 'blue' ? 'bg-indigo-100/50 text-indigo-700' :
                                        'bg-amber-100/50 text-amber-700'
                                    )}>
                                        {act.status}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-300">
                                        {act.type === 'session' ? 'جلسة تعليمية' : 'مهمة إدارية'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-300 dark:text-slate-700">
                        <History size={32} className="opacity-10 mb-2" />
                        <p className="text-[11px] font-bold italic">السجل فارغ حالياً</p>
                    </div>
                )}
            </div>

            {/* Sticky Footnote */}
            <div className="mt-6 pt-3">
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-wider">
                        يتم تحديث السجلات تلقائياً كل 24 ساعة
                    </p>
                 </div>
            </div>
        </div>
    );
};
