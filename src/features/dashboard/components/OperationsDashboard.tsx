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
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700" dir="rtl">
            {/* 1. Subscriptions & Renewals Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col hover:shadow-md transition-all duration-300">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">تجديد الاشتراكات</h3>
                            <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Subscriptions</p>
                        </div>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-4 py-1.5 rounded-full text-xs font-bold">
                        {stats.lowBalanceCount} تنبيه
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-1">
                    {lowBalanceStudents.length > 0 ? (
                        lowBalanceStudents.map((item, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-600 group-hover:scale-110 transition-transform">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{item.studentName}</h4>
                                        <p className="text-xs font-medium text-slate-400 mt-1">{item.subject}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "text-[10px] font-bold px-3 py-1 rounded-full",
                                        item.remainingSessions === 0 
                                            ? "text-rose-600 bg-rose-50 dark:bg-rose-900/20" 
                                            : "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                                    )}>
                                        {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} جلسة`}
                                    </span>
                                    <button 
                                        onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                        className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-emerald-500 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90"
                                    >
                                        <Phone size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserX size={32} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">لا توجد اشتراكات منتهية</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/students" className="w-full h-12 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        إدارة كافة الطلاب
                        <ChevronLeft size={18} />
                    </Link>
                </div>
            </div>

            {/* 2. Tasks & Requests Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col hover:shadow-md transition-all duration-300">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">المهام والطلبات</h3>
                            <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Workflow</p>
                        </div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold">
                        {tasks.length} مهمة
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-1">
                    {tasks.length > 0 ? (
                        tasks.slice(0, 8).map((task) => (
                            <div key={task.id} className="group p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-amber-100 dark:hover:border-amber-900/30 hover:bg-amber-50/10 transition-all flex items-center justify-between rounded-[1.5rem] shadow-sm">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={cn(
                                        "w-1.5 h-10 rounded-full",
                                        task.priority === 'high' ? "bg-rose-500" :
                                        task.priority === 'medium' ? "bg-amber-500" : "bg-indigo-500"
                                    )} />
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate group-hover:text-amber-600 transition-colors">{task.title}</h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Clock size={12} className="text-slate-400" />
                                            <span className="text-xs font-medium text-slate-400">{task.dueDate}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link 
                                    to="/tasks" 
                                    className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                                >
                                    <ChevronLeft size={18} />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ListTodo size={32} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">لا توجد مهام حالية</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/tasks" className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all shadow-lg">
                        مركز المهام المتكامل
                        <ChevronLeft size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};
