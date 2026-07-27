import { CalendarCheck, ListTodo, AlertTriangle, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TodaysFocusProps {
    todaySessions: { id: string; studentName: string; time: string; subject?: string; status?: string }[];
    tasks: { id: string; title: string; dueDate?: string; status?: string; priority?: string }[];
    lowBalanceCount: number;
}

export const TodaysFocus = ({ todaySessions, tasks, lowBalanceCount }: TodaysFocusProps) => {
    const hasAnyData = todaySessions.length > 0 || tasks.length > 0 || lowBalanceCount > 0;

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-info-soft flex items-center justify-center">
                        <CalendarCheck size={16} className="text-info" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main">تركيز اليوم</h3>
                        <p className="text-[10px] text-muted">ما تحتاج متابعته اليوم</p>
                    </div>
                </div>
                {hasAnyData && (
                    <Badge variant="default" className="text-[10px] h-5 px-2.5 rounded-lg bg-primary-soft text-primary border-primary/20">
                        {todaySessions.length + tasks.length + lowBalanceCount} عنصر
                    </Badge>
                )}
            </div>

            <div className="space-y-2">
                {/* Today's Sessions */}
                {todaySessions.length > 0 && (
                    <div className="p-3 rounded-xl bg-info-soft border border-info/20">
                        <div className="flex items-center gap-2 mb-2">
                            <CalendarCheck size={12} className="text-info" />
                            <span className="text-[11px] font-bold text-info">{todaySessions.length} حصص اليوم</span>
                        </div>
                        <div className="space-y-1.5">
                            {todaySessions.slice(0, 4).map((s) => (
                                <div key={s.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-bold text-main truncate">{s.studentName}</span>
                                        {s.subject && <span className="text-[10px] text-muted">— {s.subject}</span>}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Clock size={10} className="text-muted" />
                                        <span className="text-[10px] font-bold text-muted tabular-nums">{s.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Tasks */}
                {tasks.length > 0 && (
                    <div className="p-3 rounded-xl bg-warning-soft border border-warning/20">
                        <div className="flex items-center gap-2 mb-2">
                            <ListTodo size={12} className="text-warning" />
                            <span className="text-[11px] font-bold text-warning">{tasks.length} مهام نشطة</span>
                        </div>
                        <div className="space-y-1.5">
                            {tasks.slice(0, 3).map((t) => (
                                <div key={t.id} className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-main truncate">{t.title}</span>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0",
                                        t.priority === 'high' ? "bg-error-soft text-error" :
                                        t.priority === 'medium' ? "bg-warning-soft text-warning" :
                                        "bg-primary-soft text-primary"
                                    )}>
                                        {t.priority === 'high' ? 'عالية' : t.priority === 'medium' ? 'متوسطة' : 'عادية'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Low Balance Alerts */}
                {lowBalanceCount > 0 && (
                    <div className="p-3 rounded-xl bg-error-soft border border-error/20">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={12} className="text-error" />
                            <span className="text-[11px] font-bold text-error">{lowBalanceCount} تنبيه رصيد منخفض</span>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!hasAnyData && (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-success-soft flex items-center justify-center">
                            <CalendarCheck size={20} className="text-success/50" />
                        </div>
                        <p className="text-xs font-bold text-muted">لا توجد مهام اليوم</p>
                        <p className="text-[10px] text-muted/60 mt-0.5">استمتع بيوم هادئ</p>
                    </div>
                )}

                {/* Quick Links */}
                {hasAnyData && (
                    <div className="flex gap-2 pt-1">
                        <Link to="/schedule" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-xl h-8 text-[10px] font-bold">
                                <CalendarCheck size={11} />
                                الجدول
                                <ArrowLeft size={10} />
                            </Button>
                        </Link>
                        <Link to="/tasks" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-xl h-8 text-[10px] font-bold">
                                <ListTodo size={11} />
                                المهام
                                <ArrowLeft size={10} />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
