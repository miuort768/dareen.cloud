import { CheckCircle2, ListTodo, History, Clock, ArrowUpRight } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full" dir="rtl">
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2] rounded-2xl flex items-center justify-center">
                        <History size={24} />
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">سجل النشاطات</h3>
                        <p className="text-slate-400 text-xs font-bold mt-0.5">متابعة فورية للتحركات الأكاديمية</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Clock size={18} />
                </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-5 items-start group/act pb-2">
                            {/* Vertical Line Connector */}
                            {i !== activities.length - 1 && (
                                <div className="absolute top-10 right-[23px] w-0.5 h-full bg-slate-50 dark:bg-slate-800 group-hover/act:bg-indigo-100 dark:group-hover/act:bg-indigo-900/30 transition-colors"></div>
                            )}

                            {/* Activity Icon Node */}
                            <div className={cn(
                                "z-10 w-12 h-12 flex items-center justify-center rounded-2xl border-4 border-white dark:border-slate-900 shadow-sm transition-transform group-hover/act:scale-110",
                                act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                act.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                act.color === 'blue' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-amber-50 text-amber-600'
                            )}>
                                {act.type === 'session' ? <CheckCircle2 size={18} /> : <ListTodo size={18} />}
                            </div>
                            
                            {/* Content Card */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-black text-sm text-slate-800 dark:text-white truncate group-hover/act:text-[#5c59f2] transition-colors">{act.title}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                        {new Date(act.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded-full",
                                        act.color === 'emerald' ? 'bg-emerald-100/50 text-emerald-700' :
                                        act.color === 'rose' ? 'bg-rose-100/50 text-rose-700' :
                                        act.color === 'blue' ? 'bg-indigo-100/50 text-indigo-700' :
                                        'bg-amber-100/50 text-amber-700'
                                    )}>
                                        {act.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-300">
                                        {act.type === 'session' ? 'جلسة تعليمية' : 'مهمة إدارية'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="opacity-0 group-hover/act:opacity-100 transition-opacity self-center">
                                <ArrowUpRight size={16} className="text-slate-300" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-700">
                        <History size={48} className="opacity-10 mb-4" />
                        <p className="text-sm font-bold italic">السجل فارغ حالياً</p>
                    </div>
                )}
            </div>

            {/* Sticky Footnote */}
            <div className="mt-8 pt-4">
                 <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100/30 dark:border-indigo-800/30">
                    <p className="text-[10px] font-bold text-indigo-400 text-center uppercase tracking-widest leading-loose">
                        يتم أرشفة السجلات تلقائياً كل 24 ساعة لضمان سرعة أداء الواجهة
                    </p>
                 </div>
            </div>
        </div>
    );
};
