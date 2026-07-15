import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-card rounded-card p-5 shadow-soft border border-border h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-muted flex items-center gap-2">
                    <ListTodo size={12} className="text-primary" />
                    المهام والطلبات
                </h3>
                <Link to="/tasks" className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-muted hover:bg-primary-soft0 hover:text-on-primary transition-all">
                    <ChevronLeft size={14} />
                </Link>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all",
                            task.priority === 'high' ? "bg-error-soft border-error" :
                            task.priority === 'medium' ? "bg-warning-soft border-warning" :
                            "bg-background border-border"
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
                                <p className="text-xs font-bold text-main truncate">{task.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-micro font-medium text-muted">{task.dueDate}</span>
                                    {task.priority === 'high' && (
                                        <span className="text-micro font-bold text-error bg-error-soft px-1.5 py-0.5 rounded">عاجل</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center mb-2">
                            <ListTodo size={18} className="text-dim" />
                        </div>
                        <p className="text-micro font-bold text-muted">لا توجد مهام نشطة حالياً</p>
                    </div>
                )}
            </div>

            <Link
                to="/tasks"
                className="mt-3 w-full h-9 flex items-center justify-center bg-primary hover:bg-primary text-on-primary text-micro font-bold rounded-xl transition-all active:scale-[0.98]"
            >
                عرض كافة المهام
            </Link>
        </div>
    );
};
