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
import { useAdminPhone } from '../../../context/AppContext';

interface OperationsDashboardProps {
    tasks: Task[];
    lowBalanceStudents: LowBalanceStudent[];
    stats: Stats;
}

export const OperationsDashboard = ({ tasks, lowBalanceStudents, stats }: OperationsDashboardProps) => {
    const adminPhone = useAdminPhone();

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 pb-10" dir="rtl">
            {/* 1. Subscriptions & Renewals Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col hover:border-[#2563EB] transition-all group rounded-2xl shadow-sm">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center transition-transform group-hover:rotate-3 shadow-sm">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">تجديد الاشتراكات</h3>
                            <p className="text-[9px] font-medium text-[#64748B]">إدارة التحصيل المالي</p>
                        </div>
                    </div>
                    <div className="bg-[#22C55E] text-white px-3 py-1 text-[9px] font-bold rounded-xl shadow-sm">
                        {stats.lowBalanceCount} تنبيهات
                    </div>
                </div>

                {/* Compact List Content */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
                    {lowBalanceStudents.length > 0 ? (
                        lowBalanceStudents.map((item, idx) => (
                                <div key={idx} className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 hover:border-[#2563EB] hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between group/item">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-[#2563EB] text-[11px] group-hover/item:bg-[#2563EB] group-hover/item:text-white transition-colors">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-[#0F172A] dark:text-white truncate">{item.studentName}</h4>
                                        <p className="text-[9px] font-medium text-[#64748B] mt-0.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
                                            {item.subject}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={cn(
                                        "text-[8px] font-bold px-2 py-1 border rounded-xl shadow-sm",
                                        item.remainingSessions === 0 
                                            ? "text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-950/20" 
                                            : "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20"
                                    )}>
                                        {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} جلسة`}
                                    </span>
                                    <button 
                                        onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                        className="w-8 h-8 rounded-xl bg-[#2563EB] text-white hover:bg-[#22C55E] transition-colors shadow-sm flex items-center justify-center"
                                        title="إرسال تذكير واتساب"
                                    >
                                        <Phone size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <UserX size={24} className="text-slate-200 mx-auto mb-2" />
                            <p className="text-[9px] font-medium text-[#64748B]">لا توجد تجديدات معلقة</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/students" className="w-full h-11 rounded-2xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-[#2563EB] dark:hover:bg-[#F1F5F9] transition-all shadow-sm active:scale-[0.98]">
                        إدارة كافة الطلاب
                        <ChevronLeft size={14} />
                    </Link>
                </div>
            </div>

            {/* 2. Tasks & Requests Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col hover:border-[#38BDF8] transition-all group rounded-2xl shadow-sm">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#38BDF8] text-white flex items-center justify-center transition-transform group-hover:-rotate-3 shadow-sm">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">المهام والطلبات</h3>
                            <p className="text-[9px] font-medium text-[#64748B]">سير العمليات التشغيلية</p>
                        </div>
                    </div>
                    <div className="bg-[#F1F5F9] dark:bg-slate-800 text-[#0F172A] dark:text-white px-3 py-1 text-[9px] font-bold rounded-xl">
                        {tasks.length} مهام نشطة
                    </div>
                </div>

                {/* Compact Task List */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
                    {tasks.length > 0 ? (
                        tasks.slice(0, 10).map((task) => (
                            <div key={task.id} className="group/task p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 hover:border-[#38BDF8] transition-all flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn(
                                        "w-1.5 h-8 rounded-full",
                                        task.priority === 'high' ? "bg-rose-500" :
                                        task.priority === 'medium' ? "bg-[#38BDF8]" : "bg-[#2563EB]"
                                    )} />
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-[#0F172A] dark:text-white truncate">{task.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} className="text-[#64748B]" />
                                                <span className="text-[8px] font-medium text-[#64748B]">{task.dueDate}</span>
                                            </div>
                                            <span className="text-[8px] font-medium text-[#94A3B8]">[{task.priority}]</span>
                                        </div>
                                    </div>
                                </div>

                                <Link 
                                    to="/tasks" 
                                    className="w-8 h-8 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 text-[#64748B] hover:bg-[#38BDF8] hover:text-white transition-all flex items-center justify-center group/btn border border-slate-100 shadow-sm"
                                >
                                    <ChevronLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <ListTodo size={24} className="text-slate-200 mx-auto mb-2" />
                            <p className="text-[9px] font-medium text-[#64748B]">تم إنجاز كافة المهام</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/tasks" className="w-full h-11 rounded-2xl bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-[#1D4ED8] transition-all shadow-sm active:scale-[0.98]">
                        مركز المهام المتكامل
                        <ChevronLeft size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );


};

