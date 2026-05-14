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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex flex-col h-full border border-slate-50 dark:border-slate-800" dir="rtl">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <History size={20} className="text-[#5c59f2]" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">أحدث الأنشطة</h3>
                </div>
                <button className="text-[10px] font-black text-indigo-600 hover:underline">عرض جميع الأنشطة</button>
            </div>

            {/* Activities List */}
            <div className="space-y-6 flex-1">
                {activities.length > 0 ? (
                    activities.map((act, i) => (
                        <div key={act.id} className="relative flex gap-4 items-center group">
                            {/* Node Icon - Circular as in screenshot */}
                            <div className={cn(
                                "z-10 w-10 h-10 flex items-center justify-center rounded-full shrink-0 font-black text-xs shadow-sm",
                                act.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                act.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                                act.color === 'blue' ? 'bg-indigo-100 text-indigo-600' :
                                'bg-amber-100 text-amber-600'
                            )}>
                                {act.title.charAt(0)}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-snug">
                                    {act.type === 'session' ? 'قام الطالب ' : 'تم نشر '}
                                    <span className="text-slate-900 dark:text-white font-black">{act.title}</span>
                                    {act.type === 'session' ? ' بإكمال اختبار الرياضيات' : ' محاضرة جديدة في دورة البرمجة'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 italic">
                                    {i === 0 ? 'منذ 10 دقائق' : i === 1 ? 'منذ ساعة' : 'منذ ساعتين'}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <History size={32} className="text-slate-300" />
                        <p className="text-sm font-bold text-slate-400 mt-2">لا توجد نشاطات مؤخراً</p>
                    </div>
                )}
            </div>
        </div>
    );
};
