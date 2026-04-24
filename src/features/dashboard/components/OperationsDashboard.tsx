import { Link } from 'react-router-dom';
import { 
    ListTodo, 
    CreditCard, 
    ChevronLeft, 
    Clock, 
    Phone,
    UserX,
    Briefcase
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task, LowBalanceStudent, DashboardStats as Stats } from '../types';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useApp } from '../../../context/AppContext';

interface OperationsDashboardProps {
    tasks: Task[];
    lowBalanceStudents: LowBalanceStudent[];
    stats: Stats;
}

export const OperationsDashboard = ({ tasks, lowBalanceStudents, stats }: OperationsDashboardProps) => {
    const { adminPhone } = useApp();

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" dir="rtl">
            {/* Main Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-2 border-slate-950 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-[10px_10px_0_rgba(0,0,0,0.05)]">
                
                {/* 1. Subscriptions & Renewals Section */}
                <div className="bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-l-2 border-slate-950 dark:border-slate-800 flex flex-col">
                    {/* Header */}
                    <div className="p-5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <CreditCard size={20} className="text-indigo-400" />
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tighter text-white">تجديد الاشتراكات</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Subscription Management</p>
                            </div>
                        </div>
                        <div className="bg-rose-500 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                            {stats.lowBalanceCount} تنبيه
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[400px] custom-scrollbar">
                        {lowBalanceStudents.length > 0 ? (
                            lowBalanceStudents.map((item, idx) => (
                                <div key={idx} className="group p-3 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-950 dark:text-white border-2 border-slate-950 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                            {item.studentName.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-[13px] text-slate-950 dark:text-white truncate uppercase tracking-tight leading-none">{item.studentName}</h4>
                                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-widest">{item.subject}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-left">
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-1 uppercase tracking-widest border",
                                                item.remainingSessions === 0 
                                                    ? "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/30" 
                                                    : "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30"
                                            )}>
                                                {item.remainingSessions === 0 ? 'مـنـتـهي' : `باقي ${item.remainingSessions}`}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                            className="w-10 h-10 bg-slate-950 text-white hover:bg-emerald-600 flex items-center justify-center transition-all active:scale-95 shadow-md"
                                        >
                                            <Phone size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center opacity-30">
                                <UserX size={48} className="mb-4 text-slate-300" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">لا توجد اشتراكات منتهية</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    <div className="p-4 border-t-2 border-slate-950 dark:border-slate-800">
                        <Link to="/students" className="w-full h-12 bg-slate-950 text-white flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl">
                            إدارة كافة الطلاب
                            <ChevronLeft size={18} />
                        </Link>
                    </div>
                </div>

                {/* 2. Tasks & Requests Section */}
                <div className="bg-white dark:bg-slate-900 flex flex-col">
                    {/* Header */}
                    <div className="p-5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b-2 border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-500 text-slate-950 flex items-center justify-center">
                                <Briefcase size={22} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tighter text-white">المهام والطلبات</h3>
                                <p className="text-[10px] font-black text-amber-500/80 uppercase tracking-[0.2em] mt-0.5 text-right">Workflow</p>
                            </div>
                        </div>
                        <div className="bg-indigo-600 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-white/10">
                            {tasks.length} مهمة
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[400px] custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                        {tasks.length > 0 ? (
                            tasks.slice(0, 8).map((task) => (
                                <div key={task.id} className="group p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 hover:border-amber-500 transition-all flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={cn(
                                            "w-2 h-10 shrink-0",
                                            task.priority === 'high' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" :
                                            task.priority === 'medium' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : 
                                            "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                        )} />
                                        <div className="min-w-0">
                                            <h4 className="font-black text-[13px] text-slate-950 dark:text-white truncate uppercase tracking-tight group-hover:text-amber-600 transition-colors leading-none">{task.title}</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Clock size={12} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{task.dueDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        <Link 
                                            to="/tasks" 
                                            className="w-10 h-10 bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center transition-all shadow-md"
                                        >
                                            <ChevronLeft size={18} />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center opacity-30">
                                <ListTodo size={48} className="mb-4 text-slate-300" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">لا توجد مهام حالية</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    <div className="p-4 border-t-2 border-slate-950 dark:border-slate-800">
                        <Link to="/tasks" className="w-full h-12 bg-white dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-950 dark:border-slate-700 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all shadow-xl">
                            مركز المهام المتكامل
                            <ChevronLeft size={18} />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};
