import { CheckCircle2, ListTodo, History, Clock, Calendar } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm flex flex-col h-full" dir="rtl">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2] rounded-2xl flex items-center justify-center">
                        <History size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">سجل النشاطات</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">تحديثات النظام الحية</p>
                    </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Clock size={16} />
                </div>
            </div>

            {/* Activities List */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-4 items-start group">
                            {/* Vertical Line Connector */}
                            {i !== activities.length - 1 && (
                                <div className="absolute top-10 right-[17px] w-0.5 h-6 bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-100 transition-colors" />
                            )}

                            {/* Node Icon */}
                            <div className={cn(
                                "z-10 w-9 h-9 flex items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-110 shadow-sm",
                                act.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                                act.color === 'rose' ? 'bg-rose-50 text-rose-500' :
                                act.color === 'blue' ? 'bg-indigo-50 text-indigo-500' :
                                'bg-amber-50 text-amber-500'
                            )}>
                                {act.type === 'session' ? <Calendar size={14} /> : <ListTodo size={14} />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-[13px] text-slate-800 dark:text-white truncate group-hover:text-indigo-500 transition-colors">{act.title}</h4>
                                    <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                                        {new Date(act.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[9px] font-bold px-2 py-0.5 rounded-lg",
                                        act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                        act.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                        act.color === 'blue' ? 'bg-indigo-50 text-indigo-600' :
                                        'bg-amber-50 text-amber-600'
                                    )}>
                                        {act.status}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">
                                        {act.type === 'session' ? 'جلسة' : 'مهمة'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 italic font-bold text-slate-400 text-xs">
                        لا توجد نشاطات مؤخراً
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-[2px]">
                    مزامنة فورية • {new Date().toLocaleDateString('ar-EG')}
                </p>
            </div>
        </div>
    );
};
