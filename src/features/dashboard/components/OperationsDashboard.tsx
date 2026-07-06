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

    const subColor = 'var(--bg-success)';
    const taskColor = 'var(--bg-info)';

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4" dir="rtl">
            {/* 1. Subscriptions & Renewals */}
            <div className="p-5 flex flex-col bg-white dark:bg-primary-active rounded-2xl shadow-sm border border-border/50 dark:border-border/50 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${subColor}12`, color: subColor }}>
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-main dark:text-on-primary leading-tight">تجديد الاشتراكات</h3>
                            <p className="text-[9px] font-medium text-muted">إدارة التحصيل المالي</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 text-[9px] font-bold rounded-xl text-on-primary shadow-sm" style={{ backgroundColor: subColor }}>
                        {stats.lowBalanceCount} تنبيهات
                    </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
                    {lowBalanceStudents.length > 0 ? (
                        lowBalanceStudents.map((item, idx) => (
                            <div key={idx} className="p-3 bg-white dark:bg-primary-active rounded-2xl shadow-sm border border-border/50 dark:border-border/50 transition-all flex items-center justify-between group/item">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[11px] transition-colors" style={{ backgroundColor: `${subColor}12`, color: subColor }}>
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-main dark:text-on-primary truncate">{item.studentName}</h4>
                                        <p className="text-[9px] font-medium text-muted mt-0.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subColor }} />
                                            {item.subject}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={cn(
                                        "text-[8px] font-bold px-2 py-1 border rounded-xl shadow-sm",
                                        item.remainingSessions === 0 
                                            ? "text-error border-error bg-error-light dark:bg-error/20" 
                                            : "text-warning border-warning bg-warning-light dark:bg-warning/20"
                                    )}>
                                        {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} جلسة`}
                                    </span>
                                    <button 
                                        onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                        className="w-8 h-8 rounded-xl text-on-primary transition-colors shadow-sm flex items-center justify-center" style={{ backgroundColor: subColor }}
                                        title="إرسال تذكير واتساب"
                                    >
                                        <Phone size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center bg-white dark:bg-primary-active rounded-2xl border border-dashed border-border dark:border-border">
                            <UserX size={24} className="mx-auto mb-2" style={{ color: `${subColor}40` }} />
                            <p className="text-[9px] font-medium text-muted">لا توجد تجديدات معلقة</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/students" className="w-full h-11 rounded-2xl text-on-primary text-[10px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-[0.98]" style={{ backgroundColor: 'var(--text-main)' }}>
                        إدارة كافة الطلاب
                        <ChevronLeft size={14} />
                    </Link>
                </div>
            </div>

            {/* 2. Tasks & Requests */}
            <div className="p-5 flex flex-col bg-white dark:bg-primary-active rounded-2xl shadow-sm border border-border/50 dark:border-border/50 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${taskColor}12`, color: taskColor }}>
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-main dark:text-on-primary leading-tight">المهام والطلبات</h3>
                            <p className="text-[9px] font-medium text-muted">سير العمليات التشغيلية</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 text-[9px] font-bold rounded-xl shadow-sm" style={{ backgroundColor: `${taskColor}20`, color: taskColor }}>
                        {tasks.length} مهام نشطة
                    </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
                    {tasks.length > 0 ? (
                        tasks.slice(0, 10).map((task) => (
                            <div key={task.id} className="p-3 bg-white dark:bg-primary-active rounded-2xl shadow-sm border border-border/50 dark:border-border/50 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("w-1.5 h-8 rounded-full", task.priority === 'high' ? "bg-error" : task.priority === 'medium' ? "bg-info" : "bg-primary")} />
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-main dark:text-on-primary truncate">{task.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} className="text-muted" />
                                                <span className="text-[8px] font-medium text-muted">{task.dueDate}</span>
                                            </div>
                                            <span className="text-[8px] font-medium text-dim">[{task.priority}]</span>
                                        </div>
                                    </div>
                                </div>

                                <Link to="/tasks" className="w-8 h-8 rounded-xl transition-all flex items-center justify-center group/btn shadow-sm" style={{ backgroundColor: `${taskColor}15`, color: taskColor }}>
                                    <ChevronLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center bg-white dark:bg-primary-active rounded-2xl border border-dashed border-border dark:border-border">
                            <ListTodo size={24} className="mx-auto mb-2" style={{ color: `${taskColor}40` }} />
                            <p className="text-[9px] font-medium text-muted">تم إنجاز كافة المهام</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link to="/tasks" className="w-full h-11 rounded-2xl text-on-primary text-[10px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-[0.98]" style={{ backgroundColor: taskColor }}>
                        مركز المهام المتكامل
                        <ChevronLeft size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );


};

