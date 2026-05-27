import { Link } from 'react-router-dom';
import { CreditCard, ChevronLeft, Phone, AlertTriangle, ListTodo, Clock, UserX } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task, LowBalanceStudent, DashboardStats as Stats } from '../types';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useAdminPhone } from '../../../context/AppContext';

interface OperationsDashboardProps {
    tasks: Task[];
    lowBalanceStudents: LowBalanceStudent[];
    stats: Stats;
}

export const OperationsDashboard = ({ tasks, lowBalanceStudents, stats }: OperationsDashboardProps) => {
    const adminPhone = useAdminPhone();

    const urgentTasks = tasks.filter(t => ['high', 'عالية', 'urgent', 'عاجل'].includes(t.priority?.toLowerCase()));
    const todayTasks = tasks.filter(t => ['medium', 'متوسطة'].includes(t.priority?.toLowerCase()));
    const laterTasks = tasks.filter(t => ['low', 'منخفضة', 'عادية'].includes(t.priority?.toLowerCase()));

    return (
        <div className="space-y-4" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center">
                            <CreditCard size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">تجديد الاشتراكات</h3>
                            <p className="text-[9px] font-medium text-slate-400">الطلاب بحاجة متابعة</p>
                        </div>
                    </div>
                    <span className={cn(
                        "text-[9px] font-bold px-2.5 py-1 rounded-xl",
                        stats.lowBalanceCount > 0
                            ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                        {stats.lowBalanceCount} تنبيه
                    </span>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar">
                    {lowBalanceStudents.length > 0 ? (
                        lowBalanceStudents.slice(0, 6).map((item, idx) => (
                            <div key={idx} className={cn(
                                "py-3 px-4 border-r-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-xl",
                                item.remainingSessions === 0 ? 'border-r-rose-400' : 'border-r-amber-400'
                            )}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs text-slate-500 bg-slate-100 dark:bg-slate-800">
                                            {item.studentName.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.studentName}</h4>
                                            <p className="text-[9px] font-medium text-slate-400 mt-0.5">{item.subject}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={cn(
                                            "text-[8px] font-bold px-2 py-1 rounded-lg",
                                            item.remainingSessions === 0
                                                ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600"
                                                : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                                        )}>
                                            {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} جلسة`}
                                        </span>
                                        <button
                                            onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center"
                                            title="إرسال تذكير واتساب"
                                        >
                                            <Phone size={12} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                                {item.remainingSessions === 0 && (
                                    <div className="flex items-center gap-1 mt-2 mr-11">
                                        <AlertTriangle size={10} className="text-rose-500" strokeWidth={1.5} />
                                        <span className="text-[8px] font-medium text-rose-500">يحتاج تواصل اليوم</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center">
                            <div className="w-10 h-10 mx-auto bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-2">
                                <UserX size={18} className="text-slate-300" strokeWidth={1.5} />
                            </div>
                            <p className="text-[10px] font-medium text-slate-400">لا توجد تجديدات معلقة</p>
                        </div>
                    )}
                </div>

                <Link to="/students" className="mt-4 w-full h-10 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm">
                    <span>إدارة الطلاب</span>
                    <ChevronLeft size={13} strokeWidth={1.5} />
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0284C7] text-white flex items-center justify-center">
                            <ListTodo size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">المهام</h3>
                            <p className="text-[9px] font-medium text-slate-400">سير العمليات</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <KanbanColumn title="عاجل" tasks={urgentTasks.slice(0, 3)} color="rose" />
                    <KanbanColumn title="اليوم" tasks={todayTasks.slice(0, 3)} color="amber" />
                    <KanbanColumn title="لاحقاً" tasks={laterTasks.slice(0, 3)} color="blue" />
                    {tasks.length === 0 && (
                        <div className="py-8 text-center">
                            <div className="w-10 h-10 mx-auto bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-2">
                                <ListTodo size={18} className="text-slate-300" strokeWidth={1.5} />
                            </div>
                            <p className="text-[10px] font-medium text-slate-400">تم إنجاز كافة المهام</p>
                        </div>
                    )}
                </div>

                <Link to="/tasks" className="mt-4 w-full h-10 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm">
                    <span>مركز المهام</span>
                    <ChevronLeft size={13} strokeWidth={1.5} />
                </Link>
            </div>
        </div>
    );
};

const KanbanColumn = ({ title, tasks, color }: { title: string; tasks: Task[]; color: 'rose' | 'amber' | 'blue' }) => {
    if (tasks.length === 0) return null;

    const colorMap = {
        rose: { border: 'border-r-rose-400', dot: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/10' },
        amber: { border: 'border-r-amber-400', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
        blue: { border: 'border-r-blue-400', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
    };

    return (
        <div>
            <div className="flex items-center gap-1.5 mb-2 px-1">
                <div className={cn("w-1.5 h-1.5 rounded-full", colorMap[color].dot)} />
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{title}</span>
                <span className="text-[8px] font-medium text-slate-400">({tasks.length})</span>
            </div>
            <div className="space-y-1.5">
                {tasks.map(task => (
                    <div key={task.id} className={cn("py-2 px-3 border-r-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-lg", colorMap[color].border)}>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate">{task.title}</span>
                            <span className="text-[8px] text-slate-400 tabular-nums shrink-0">{task.dueDate}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
