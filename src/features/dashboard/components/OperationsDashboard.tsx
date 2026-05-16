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
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10" dir="rtl">
            {/* 1. Subscriptions & Renewals Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col hover:border-indigo-600 transition-all group">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white border border-white/10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-3 shadow-sm">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">تجديد الاشتراكات</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">إدارة التحصيل المالي</p>
                        </div>
                    </div>
                    <div className="bg-rose-500 text-white px-3 py-1 text-[9px] font-black uppercase rounded-full shadow-sm">
                        {stats.lowBalanceCount} تنبيهات
                    </div>
                </div>

                {/* Compact List Content */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
                    {lowBalanceStudents.length > 0 ? (
                        lowBalanceStudents.map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 hover:border-indigo-600 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between group/item rounded-xl">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-black text-indigo-600 text-sm group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors rounded-lg">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">{item.studentName}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                            {item.subject}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={cn(
                                        "text-[8px] font-black px-2 py-1 uppercase border rounded-md shadow-sm",
                                        item.remainingSessions === 0 
                                            ? "text-rose-600 border-rose-200 bg-rose-50" 
                                            : "text-amber-600 border-amber-200 bg-amber-50"
                                    )}>
                                        {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} جلسة`}
                                    </span>
                                    <button 
                                        onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                        className="w-8 h-8 bg-indigo-600 text-white hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center border border-white/10 rounded-lg"
                                        title="إرسال تذكير واتساب"
                                    >
                                        <Phone size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            <UserX size={24} className="text-slate-200 mx-auto mb-2" />
                            <p className="text-[9px] font-black text-slate-400 uppercase">لا توجد تجديدات معلقة</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/students" className="w-full h-11 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all shadow-sm active:scale-[0.98] rounded-xl">
                        إدارة كافة الطلاب
                        <ChevronLeft size={14} />
                    </Link>
                </div>
            </div>

            {/* 2. Tasks & Requests Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col hover:border-amber-600 transition-all group">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 text-white border border-white/10 rounded-xl flex items-center justify-center transition-transform group-hover:-rotate-3 shadow-sm">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">المهام والطلبات</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">سير العمليات التشغيلية</p>
                        </div>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-3 py-1 text-[9px] font-black uppercase rounded-full">
                        {tasks.length} مهام نشطة
                    </div>
                </div>

                {/* Compact Task List */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
                    {tasks.length > 0 ? (
                        tasks.slice(0, 10).map((task) => (
                            <div key={task.id} className="group/task p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 hover:border-amber-500 transition-all flex items-center justify-between rounded-xl">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn(
                                        "w-1 h-8 rounded-full",
                                        task.priority === 'high' ? "bg-rose-600" :
                                        task.priority === 'medium' ? "bg-amber-500" : "bg-indigo-600"
                                    )} />
                                    <div className="min-w-0">
                                        <h4 className="font-black text-xs text-slate-900 dark:text-white truncate transition-colors uppercase">{task.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} className="text-amber-500" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase">{task.dueDate}</span>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">[{task.priority}]</span>
                                        </div>
                                    </div>
                                </div>

                                <Link 
                                    to="/tasks" 
                                    className="w-8 h-8 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center group/btn border border-slate-100 rounded-lg shadow-sm"
                                >
                                    <ChevronLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            <ListTodo size={24} className="text-slate-200 mx-auto mb-2" />
                            <p className="text-[9px] font-black text-slate-400 uppercase">تم إنجاز كافة المهام</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/tasks" className="w-full h-11 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98] rounded-xl">
                        مركز المهام المتكامل
                        <ChevronLeft size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );


};

