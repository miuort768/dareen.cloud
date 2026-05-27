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

    const subColor = '#22C55E';
    const taskColor = '#38BDF8';

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4" dir="rtl">
            {/* 1. Subscriptions & Renewals */}
            <div
                className="p-5 flex flex-col rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: `${subColor}0D`, border: `2px solid ${subColor}30` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = subColor; e.currentTarget.style.backgroundColor = `${subColor}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${subColor}30`; e.currentTarget.style.backgroundColor = `${subColor}0D`; }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm text-white" style={{ backgroundColor: subColor }}>
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">تجديد الاشتراكات</h3>
                            <p className="text-[9px] font-medium text-[#64748B]">إدارة التحصيل المالي</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 text-[9px] font-bold rounded-xl text-white shadow-sm" style={{ backgroundColor: subColor }}>
                        {stats.lowBalanceCount} تنبيهات
                    </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
                    {lowBalanceStudents.length > 0 ? (
                        lowBalanceStudents.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-2xl transition-all flex items-center justify-between group/item" style={{ backgroundColor: `${subColor}08`, border: `1px solid ${subColor}20` }}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[11px] transition-colors text-white" style={{ backgroundColor: subColor }}>
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-[#0F172A] dark:text-white truncate">{item.studentName}</h4>
                                        <p className="text-[9px] font-medium text-[#64748B] mt-0.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subColor }} />
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
                                        className="w-8 h-8 rounded-xl text-white transition-colors shadow-sm flex items-center justify-center" style={{ backgroundColor: subColor }}
                                        title="إرسال تذكير واتساب"
                                    >
                                        <Phone size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center rounded-2xl" style={{ border: `2px dashed ${subColor}30` }}>
                            <UserX size={24} className="mx-auto mb-2" style={{ color: `${subColor}50` }} />
                            <p className="text-[9px] font-medium text-[#64748B]">لا توجد تجديدات معلقة</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/students" className="w-full h-11 rounded-2xl text-white text-[10px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-[0.98]" style={{ backgroundColor: '#0F172A' }}>
                        إدارة كافة الطلاب
                        <ChevronLeft size={14} />
                    </Link>
                </div>
            </div>

            {/* 2. Tasks & Requests */}
            <div
                className="p-5 flex flex-col rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: `${taskColor}0D`, border: `2px solid ${taskColor}30` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = taskColor; e.currentTarget.style.backgroundColor = `${taskColor}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${taskColor}30`; e.currentTarget.style.backgroundColor = `${taskColor}0D`; }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm text-white" style={{ backgroundColor: taskColor }}>
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">المهام والطلبات</h3>
                            <p className="text-[9px] font-medium text-[#64748B]">سير العمليات التشغيلية</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 text-[9px] font-bold rounded-xl shadow-sm" style={{ backgroundColor: `${taskColor}20`, color: taskColor }}>
                        {tasks.length} مهام نشطة
                    </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
                    {tasks.length > 0 ? (
                        tasks.slice(0, 10).map((task) => (
                            <div key={task.id} className="p-3 rounded-2xl transition-all flex items-center justify-between" style={{ backgroundColor: `${taskColor}08`, border: `1px solid ${taskColor}20` }}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("w-1.5 h-8 rounded-full", task.priority === 'high' ? "bg-rose-500" : task.priority === 'medium' ? "bg-[#38BDF8]" : "bg-[#2563EB]")} />
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

                                <Link to="/tasks" className="w-8 h-8 rounded-xl transition-all flex items-center justify-center group/btn shadow-sm" style={{ backgroundColor: `${taskColor}15`, color: taskColor }}>
                                    <ChevronLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center rounded-2xl" style={{ border: `2px dashed ${taskColor}30` }}>
                            <ListTodo size={24} className="mx-auto mb-2" style={{ color: `${taskColor}50` }} />
                            <p className="text-[9px] font-medium text-[#64748B]">تم إنجاز كافة المهام</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/tasks" className="w-full h-11 rounded-2xl text-white text-[10px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-[0.98]" style={{ backgroundColor: taskColor }}>
                        مركز المهام المتكامل
                        <ChevronLeft size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );


};

