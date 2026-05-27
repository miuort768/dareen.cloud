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

    const color = '#2563EB';

    return (
        <div className="p-6 md:p-8 shadow-sm flex flex-col h-full relative overflow-hidden transition-all duration-300 rounded-2xl hover:shadow-md"
            style={{ backgroundColor: `${color}0D`, border: `2px solid ${color}30` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.backgroundColor = `${color}18`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.backgroundColor = `${color}0D`; }}
            dir="rtl"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm text-white" style={{ backgroundColor: color }}>
                        <History size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">سجل النشاطات</h3>
                        <p className="text-[9px] font-medium text-[#64748B] mt-0.5">سجل المراقبة الفورية</p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}15`, color }}>
                    <ActivityIcon size={14} strokeWidth={1.5} className="animate-pulse" />
                </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-5 items-start group">
                            {i !== activities.length - 1 && (
                                <div className="absolute top-10 right-[19px] w-[2px] h-10" style={{ backgroundColor: `${color}20` }} />
                            )}

                            <div className={cn(
                                "z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm",
                                act.color === 'emerald' ? 'text-[#22C55E]' :
                                act.color === 'rose' ? 'text-rose-500' :
                                'text-white'
                            )} style={{ backgroundColor: act.color === 'blue' ? color : act.color === 'emerald' ? '#22C55E' : act.color === 'rose' ? '#F43F5E' : '#F59E0B' }}>
                                {act.type === 'session' ? <Calendar size={18} strokeWidth={1.5} /> : <ListTodo size={18} strokeWidth={1.5} />}
                            </div>
                            
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-xs text-[#0F172A] dark:text-white truncate" style={{ color: `${color}` }}>{act.title}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={cn(
                                            "text-[9px] font-bold px-2 py-0.5 rounded-xl border",
                                            act.color === 'emerald' ? 'text-[#22C55E] border-emerald-100 dark:border-emerald-500/20' :
                                            act.color === 'rose' ? 'text-rose-500 border-rose-100 dark:border-rose-500/20' :
                                            act.color === 'blue' ? 'text-[#2563EB] border-blue-100 dark:border-blue-500/20' :
                                            'text-amber-500 border-amber-100 dark:border-amber-500/20'
                                        )} style={{ backgroundColor: `${act.color === 'blue' ? color : act.color === 'emerald' ? '#22C55E' : act.color === 'rose' ? '#F43F5E' : '#F59E0B'}15` }}>
                                            {act.status}
                                        </span>
                                        <span className="text-[9px] font-medium text-[#64748B] flex items-center gap-1">
                                            <Clock size={10} strokeWidth={1.5} style={{ color: `${color}60` }} />
                                            {act.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl" style={{ border: `2px dashed ${color}30` }}>
                        <History size={24} strokeWidth={1.5} style={{ color: `${color}50` }} />
                        <p className="text-[10px] font-medium text-[#64748B] mt-2">لا توجد نشاطات مؤخراً</p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${color}20` }}>
                <button className="w-full h-11 rounded-2xl text-white text-[10px] font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98]" style={{ backgroundColor: color }}>
                    عرض سجل النظام الكامل
                </button>
            </div>
        </div>
    );
};
