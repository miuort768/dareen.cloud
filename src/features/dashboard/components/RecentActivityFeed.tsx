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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm flex flex-col h-full relative overflow-hidden transition-all group/feed" dir="rtl">
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm transition-transform group-hover/feed:rotate-3">
                        <History size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">سجل النشاطات</h3>
                        <p className="text-[9px] font-medium text-[#64748B] mt-0.5">سجل المراقبة الفورية</p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <ActivityIcon size={14} strokeWidth={1.5} className="animate-pulse text-[#2563EB]" />
                </div>
            </div>

            {/* Compact Activities List */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-5 items-start group">
                            {/* Vertical Line Connector */}
                            {i !== activities.length - 1 && (
                                <div className="absolute top-10 right-[19px] w-[2px] h-10 bg-slate-100 dark:bg-slate-800 group-hover:bg-[#2563EB]/20 transition-colors" />
                            )}

                            {/* Node Icon */}
                            <div className={cn(
                                "z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all border border-slate-200 dark:border-slate-700 shadow-sm",
                                act.color === 'emerald' ? 'bg-emerald-50 text-[#22C55E]' :
                                act.color === 'rose' ? 'bg-rose-50 text-rose-500' :
                                act.color === 'blue' ? 'bg-blue-50 text-[#2563EB]' :
                                'bg-amber-50 text-amber-500'
                            )}>
                                {act.type === 'session' ? <Calendar size={18} strokeWidth={1.5} /> : <ListTodo size={18} strokeWidth={1.5} />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-xs text-[#0F172A] dark:text-white truncate group-hover:text-[#2563EB] transition-colors">{act.title}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={cn(
                                            "text-[9px] font-bold px-2 py-0.5 rounded-xl border",
                                            act.color === 'emerald' ? 'bg-emerald-50/50 text-[#22C55E] border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                                            act.color === 'rose' ? 'bg-rose-50/50 text-rose-500 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20' :
                                            act.color === 'blue' ? 'bg-blue-50/50 text-[#2563EB] border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20' :
                                            'bg-amber-50/50 text-amber-500 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20'
                                        )}>
                                            {act.status}
                                        </span>
                                        <span className="text-[9px] font-medium text-[#64748B] flex items-center gap-1">
                                            <Clock size={10} strokeWidth={1.5} className="text-[#94A3B8]" />
                                            {act.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                        <History size={24} strokeWidth={1.5} className="text-slate-200 mb-2" />
                        <p className="text-[10px] font-medium text-[#64748B]">لا توجد نشاطات مؤخراً</p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                <button className="w-full h-11 rounded-2xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-[10px] font-bold hover:bg-[#2563EB] dark:hover:bg-[#F1F5F9] transition-all shadow-sm active:scale-[0.98]">
                    عرض سجل النظام الكامل
                </button>
            </div>
        </div>
    );
};
