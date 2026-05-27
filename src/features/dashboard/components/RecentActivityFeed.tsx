import { ListTodo, History, Clock, Calendar, Activity as ActivityIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

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

const timeSince = (dateStr: string): string => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return dateStr;
};

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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 md:p-6 flex flex-col h-full relative overflow-hidden" dir="rtl">

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center">
                        <History size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">سجل النشاطات</h3>
                        <p className="text-[9px] font-medium text-slate-400 mt-0.5">آخر التحديثات</p>
                    </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ActivityIcon size={13} className="text-[#1D4ED8] animate-pulse" strokeWidth={1.5} />
                </div>
            </div>

            <div className="space-y-5 flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <motion.div
                            key={act.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.25 }}
                            className="relative flex gap-4 items-start group"
                        >
                            {i !== activities.length - 1 && (
                                <div className="absolute top-9 right-[17px] w-[2px] h-8 bg-slate-100 dark:bg-slate-800 group-hover:bg-[#1D4ED8]/20 transition-colors" />
                            )}

                            <div className={cn(
                                "z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all border border-slate-200 dark:border-slate-700 shadow-sm",
                                act.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                act.color === 'rose' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400' :
                                act.color === 'blue' ? 'bg-blue-50 text-[#1D4ED8] dark:bg-blue-900/20 dark:text-blue-400' :
                                'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400'
                            )}>
                                {act.type === 'session' ? <Calendar size={15} strokeWidth={1.5} /> : <ListTodo size={15} strokeWidth={1.5} />}
                            </div>

                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col">
                                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate group-hover:text-[#1D4ED8] transition-colors">{act.title}</h4>
                                    <div className="flex items-center gap-2.5 mt-1.5">
                                        <span className={cn(
                                            "text-[8px] font-semibold px-2 py-0.5 rounded-lg border",
                                            act.color === 'emerald' ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                                            act.color === 'rose' ? 'bg-rose-50/50 text-rose-500 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20' :
                                            act.color === 'blue' ? 'bg-blue-50/50 text-[#1D4ED8] border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20' :
                                            'bg-amber-50/50 text-amber-500 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20'
                                        )}>
                                            {act.status}
                                        </span>
                                        <span className="text-[8px] font-medium text-slate-400 flex items-center gap-1">
                                            <Clock size={9} className="text-slate-300" strokeWidth={1.5} />
                                            {timeSince(act.time) || act.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                        <History size={22} className="text-slate-200 mb-2" strokeWidth={1.5} />
                        <p className="text-[10px] font-medium text-slate-400">لا توجد نشاطات مؤخراً</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <button className="w-full h-10 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold hover:bg-[#1D4ED8] dark:hover:bg-slate-100 transition-all shadow-sm active:scale-[0.98]">
                    عرض سجل النظام الكامل
                </button>
            </div>
        </div>
    );
};
