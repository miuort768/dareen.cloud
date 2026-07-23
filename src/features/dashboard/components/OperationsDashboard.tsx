import { Link } from 'react-router-dom';
import { ListTodo, CreditCard, ChevronLeft, Clock, Phone, UserX, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardTask as Task, LowBalanceStudent, DashboardStats as Stats } from '../types';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useAdminPhone } from '../../../context/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OperationsDashboardProps {
    tasks: Task[];
    lowBalanceStudents: LowBalanceStudent[];
    stats: Stats;
}

export const OperationsDashboard = ({ tasks, lowBalanceStudents, stats }: OperationsDashboardProps) => {
    const adminPhone = useAdminPhone();

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4" dir="rtl">
            {/* Subscriptions & Renewals */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-success-soft flex items-center justify-center">
                            <CreditCard size={18} className="text-success" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-main">تجديد الاشتراكات</h3>
                            <p className="text-xs text-muted">إدارة التحصيل المالي</p>
                        </div>
                    </div>
                    <Badge variant="success" className="text-[10px] h-6 px-3 rounded-xl">{stats.lowBalanceCount} تنبيهات</Badge>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar ps-1">
                    {lowBalanceStudents.length > 0 ? (
                        lowBalanceStudents.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-surface border border-border transition-all flex items-center justify-between group hover:shadow-md">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center text-success font-bold text-sm shrink-0">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm text-main truncate">{item.studentName}</h4>
                                        <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                                            {item.subject}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={cn(
                                        "text-[10px] font-bold px-3 py-1.5 rounded-xl",
                                        item.remainingSessions === 0
                                            ? "bg-error-soft text-error border border-error/20"
                                            : "bg-warning-soft text-warning border border-warning/20"
                                    )}>
                                        {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} جلسة`}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                        title="إرسال تذكير واتساب"
                                        className="h-9 w-9 rounded-xl text-success hover:text-success hover:bg-success/10"
                                    >
                                        <Phone size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-success-soft flex items-center justify-center">
                                <UserX size={24} className="text-success/40" />
                            </div>
                            <p className="text-sm font-bold text-muted">لا توجد تجديدات معلقة</p>
                            <p className="text-xs text-muted/60 mt-0.5">جميع الاشتراكات محدثة</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-5 border-t border-border/50">
                    <Link to="/students">
                        <Button variant="default" size="lg" className="w-full gap-2 rounded-2xl h-11 text-sm font-bold bg-primary text-on-primary border-0">
                            إدارة كافة الطلاب
                            <ChevronLeft size={14} />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tasks & Requests */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-info-soft flex items-center justify-center">
                            <Briefcase size={18} className="text-info" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-main">المهام والطلبات</h3>
                            <p className="text-xs text-muted">سير العمليات التشغيلية</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-6 px-3 rounded-xl">{tasks.length} مهام نشطة</Badge>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar ps-1">
                    {tasks.length > 0 ? (
                        tasks.slice(0, 10).map((task) => (
                            <div key={task.id} className="p-4 rounded-2xl bg-surface border border-border transition-all flex items-center justify-between hover:shadow-md">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("w-1.5 h-10 rounded-full shrink-0", task.priority === 'high' ? "bg-error" : task.priority === 'medium' ? "bg-info" : "bg-primary")} />
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm text-main truncate">{task.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} className="text-muted" />
                                                <span className="text-xs text-muted">{task.dueDate}</span>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-lg",
                                                task.priority === 'high' ? "bg-error-soft text-error" :
                                                task.priority === 'medium' ? "bg-info-soft text-info" :
                                                "bg-primary-soft text-primary"
                                            )}>
                                                {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'عادية'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link to="/tasks">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted">
                                        <ChevronLeft size={16} />
                                    </Button>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-success-soft flex items-center justify-center">
                                <ListTodo size={24} className="text-success/40" />
                            </div>
                            <p className="text-sm font-bold text-muted">تم إنجاز كافة المهام</p>
                            <p className="text-xs text-muted/60 mt-0.5">لا توجد مهام قيد الانتظار</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-5 border-t border-border/50">
                    <Link to="/tasks">
                        <Button variant="default" size="lg" className="w-full gap-2 rounded-2xl h-11 text-sm font-bold bg-primary text-on-primary border-0">
                            مركز المهام المتكامل
                            <ChevronLeft size={14} />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
