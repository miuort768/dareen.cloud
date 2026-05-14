import { Link } from 'react-router-dom';
import { 
    ListTodo, 
    CreditCard, 
    ChevronLeft, 
    Clock, 
    Phone,
    UserX,
    Briefcase,
    ShieldCheck,
    Zap
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
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10" dir="rtl">
            {/* 1. Subscriptions & Renewals Section - Premium Admin Slate */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-none p-8 shadow-xl flex flex-col hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 -translate-x-12 -translate-y-12 rotate-45 pointer-events-none" />
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 rounded-none flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight uppercase">تجديد الاشتراكات</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <ShieldCheck size={12} className="text-indigo-600" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Billing Management</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-rose-600 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20">
                        {stats.lowBalanceCount} تنبيهات نشطة
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[450px] custom-scrollbar pr-2">
                    {lowBalanceStudents.length > 0 ? (
                        lowBalanceStudents.map((item, idx) => (
                            <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 hover:border-indigo-600/30 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between group/item">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="w-14 h-14 bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center font-black text-indigo-600 text-lg group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-300">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">{item.studentName}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            {item.subject}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5">
                                    <span className={cn(
                                        "text-[9px] font-black px-4 py-1.5 uppercase tracking-widest border-2",
                                        item.remainingSessions === 0 
                                            ? "text-rose-600 border-rose-600 bg-rose-50 dark:bg-rose-900/10" 
                                            : "text-amber-600 border-amber-500 bg-amber-50 dark:bg-amber-900/10"
                                    )}>
                                        {item.remainingSessions === 0 ? 'STATUS: EXPIRED' : `${item.remainingSessions} SESSIONS`}
                                    </span>
                                    <button 
                                        onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                        className="w-12 h-12 bg-indigo-600 text-white hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center justify-center"
                                        title="إرسال تذكير واتساب"
                                    >
                                        <Phone size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <UserX size={36} className="text-slate-300" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No Pending Renewals</p>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <Link to="/students" className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all shadow-xl active:scale-[0.98]">
                        إدارة كافة الطلاب
                        <ChevronLeft size={18} />
                    </Link>
                </div>
            </div>

            {/* 2. Tasks & Requests Section - Premium Admin Amber */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-none p-8 shadow-xl flex flex-col hover:border-amber-500/30 transition-all duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 -translate-x-12 -translate-y-12 rotate-45 pointer-events-none" />

                {/* Header Section */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-amber-500 text-white shadow-lg shadow-amber-500/20 rounded-none flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <Briefcase size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight uppercase">المهام والطلبات</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Zap size={12} className="text-amber-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Workflow</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-indigo-600 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                        {tasks.length} مهام نشطة
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[450px] custom-scrollbar pr-2">
                    {tasks.length > 0 ? (
                        tasks.slice(0, 8).map((task) => (
                            <div key={task.id} className="group/task p-5 bg-white dark:bg-slate-800 border-b-2 border-slate-50 dark:border-white/5 hover:bg-amber-500/5 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className={cn(
                                        "w-2 h-12",
                                        task.priority === 'high' ? "bg-rose-600" :
                                        task.priority === 'medium' ? "bg-amber-500" : "bg-indigo-600"
                                    )} />
                                    <div className="min-w-0">
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white truncate group-hover/task:text-amber-600 transition-colors uppercase">{task.title}</h4>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} className="text-amber-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{task.dueDate}</span>
                                            </div>
                                            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase">{task.priority} Priority</span>
                                        </div>
                                    </div>
                                </div>

                                <Link 
                                    to="/tasks" 
                                    className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm flex items-center justify-center group/btn"
                                >
                                    <ChevronLeft size={20} className="group-hover/btn:-translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <ListTodo size={36} className="text-slate-300" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">All Tasks Completed</p>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <Link to="/tasks" className="w-full h-14 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
                        مركز المهام المتكامل
                        <ChevronLeft size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

