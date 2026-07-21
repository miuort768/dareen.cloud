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
import { cn } from '@/lib/utils';
import type { DashboardTask as Task, LowBalanceStudent, DashboardStats as Stats } from '../types';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useAdminPhone } from '../../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-0 pt-5 px-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-success/10 text-success ring-1 ring-success/20">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-main">تجديد الاشتراكات</CardTitle>
                                <CardDescription className="text-[11px] text-muted">إدارة التحصيل المالي</CardDescription>
                            </div>
                        </div>
                        <Badge variant="success" className="text-[10px] h-5 px-2">{stats.lowBalanceCount} تنبيهات</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar ps-1">
                        {lowBalanceStudents.length > 0 ? (
                            lowBalanceStudents.map((item, idx) => (
                                <div key={idx} className="p-3 bg-card rounded-xl border border-border/40 transition-all flex items-center justify-between group hover:border-border/70 hover:shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-success/10 text-success shrink-0">
                                            {item.studentName.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-xs text-main truncate">{item.studentName}</h4>
                                            <p className="text-[10px] font-medium text-muted mt-0.5 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-success shrink-0" />
                                                {item.subject}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={cn(
                                            "text-[10px] font-semibold px-2 py-1 rounded-lg border",
                                            item.remainingSessions === 0
                                                ? "text-error border-error/30 bg-error/5"
                                                : "text-warning border-warning/30 bg-warning/5"
                                        )}>
                                            {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} جلسة`}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                            title="إرسال تذكير واتساب"
                                            className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                                        >
                                            <Phone size={13} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-success/5 flex items-center justify-center ring-1 ring-success/20">
                                    <UserX size={22} className="text-success/40" />
                                </div>
                                <p className="text-sm font-medium text-muted">لا توجد تجديدات معلقة</p>
                                <p className="text-[11px] text-muted/60 mt-0.5">جميع الاشتراكات محدثة</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                        <Link to="/students">
                            <Button variant="default" size="sm" className="w-full gap-1.5 h-9 text-xs">
                                إدارة كافة الطلاب
                                <ChevronLeft size={12} />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks & Requests */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-0 pt-5 px-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-info/10 text-info ring-1 ring-info/20">
                                <Briefcase size={18} />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-main">المهام والطلبات</CardTitle>
                                <CardDescription className="text-[11px] text-muted">سير العمليات التشغيلية</CardDescription>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] h-5 px-2">{tasks.length} مهام نشطة</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar ps-1">
                        {tasks.length > 0 ? (
                            tasks.slice(0, 10).map((task) => (
                                <div key={task.id} className="p-3 bg-card rounded-xl border border-border/40 transition-all flex items-center justify-between hover:border-border/70 hover:shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn("w-1 h-8 rounded-full shrink-0", task.priority === 'high' ? "bg-error" : task.priority === 'medium' ? "bg-info" : "bg-primary")} />
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-xs text-main truncate">{task.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={9} className="text-muted" />
                                                    <span className="text-[10px] font-medium text-muted">{task.dueDate}</span>
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                                    task.priority === 'high' ? "bg-error/5 text-error" :
                                                    task.priority === 'medium' ? "bg-info/5 text-info" :
                                                    "bg-primary/5 text-primary"
                                                )}>
                                                    {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'عادية'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link to="/tasks">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted">
                                            <ChevronLeft size={15} />
                                        </Button>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-success/5 flex items-center justify-center ring-1 ring-success/20">
                                    <ListTodo size={22} className="text-success/40" />
                                </div>
                                <p className="text-sm font-medium text-muted">تم إنجاز كافة المهام</p>
                                <p className="text-[11px] text-muted/60 mt-0.5">لا توجد مهام قيد الانتظار</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                        <Link to="/tasks">
                            <Button variant="default" size="sm" className="w-full gap-1.5 h-9 text-xs">
                                مركز المهام المتكامل
                                <ChevronLeft size={12} />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
