import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardTask as Task } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-main dark:text-white flex items-center gap-2">
                    <ListTodo size={13} className="text-primary dark:text-[#D4AF37]" />
                    المهام والطلبات
                </h3>
                <Link to="/tasks">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" aria-label="عرض المهام">
                        <ChevronLeft size={14} />
                    </Button>
                </Link>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all",
                            task.priority === 'high' ? "bg-error-soft border-error" :
                            task.priority === 'medium' ? "bg-warning-soft border-warning" :
                            "bg-background dark:bg-[#0a0a0c] border-border dark:border-[#D4AF37]/20"
                        )}>
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                task.priority === 'high' ? "bg-error-soft text-error" :
                                task.priority === 'medium' ? "bg-warning-soft text-warning" :
                                "bg-primary-soft text-primary"
                            )}>
                                {task.priority === 'high' ? <AlertTriangle size={13} /> : <Clock size={13} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-main dark:text-white truncate">{task.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] font-medium text-muted dark:text-zinc-400">{task.dueDate}</span>
                                    {task.priority === 'high' && (
                                        <Badge variant="destructive" className="text-[10px]">عاجل</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <div className="w-10 h-10 rounded-xl bg-surface dark:bg-[#1a1a1f] flex items-center justify-center mb-2">
                            <ListTodo size={18} className="text-dim dark:text-zinc-500" />
                        </div>
                        <p className="text-[11px] font-bold text-muted dark:text-zinc-400">لا توجد مهام نشطة حالياً</p>
                    </div>
                )}
            </div>

            <div className="mt-3">
                <Link to="/tasks" className="w-full">
                    <Button className="w-full" size="sm">
                        عرض كافة المهام
                    </Button>
                </Link>
            </div>
        </div>
    );
};
