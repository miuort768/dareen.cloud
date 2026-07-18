import { CheckCircle2, Calendar, Rocket, RefreshCcw, Trash2, ClipboardList } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Task } from './Tasks';

interface TaskCardProps {
    task: Task;
    onUpdateStatus: (id: string, status: Task['status']) => void;
    onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onUpdateStatus, onDelete }: TaskCardProps) => {
    const isCompleted = task.status === 'completed';

    const priorityBadge = task.priority === 'high'
        ? { text: 'عالية', colors: 'text-error-dark dark:text-error bg-error-soft border-error' }
        : task.priority === 'medium'
        ? { text: 'متوسطة', colors: 'text-warning-dark dark:text-warning bg-warning-soft border-warning' }
        : { text: 'منخفضة', colors: 'text-primary bg-primary-soft border-primary' };

    return (
        <div className={cn(
            "bg-card rounded-card p-5 shadow-sm transition-all hover:shadow-md relative",
            isCompleted && "opacity-60",
            task.priority === 'high' ? "border-s-4 border-s-error" : task.priority === 'medium' ? "border-s-4 border-s-warning" : "border-s-4 border-s-primary"
        )}>
            {!isCompleted && (
                <div className={cn(
                    "absolute top-0 end-0 w-24 h-24 -translate-x-12 -translate-y-12 opacity-5",
                    task.priority === 'high' ? "bg-error" : task.priority === 'medium' ? "bg-warning" : "bg-primary"
                )} />
            )}
            <div className="flex justify-between items-start mb-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {isCompleted && <CheckCircle2 size={14} className="text-success shrink-0" />}
                        <h3 className={cn(
                            "text-sm font-bold text-main dark:text-inverse leading-tight",
                            isCompleted && "line-through opacity-50"
                        )}>
                            {task.title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-muted" />
                        <span className="text-micro font-bold text-muted uppercase tracking-wider">الموعد: {task.dueDate}</span>
                    </div>
                </div>
                <div className={cn(
                    "px-2.5 py-1 text-micro font-bold uppercase tracking-wider rounded-card border shrink-0",
                    priorityBadge.colors
                )}>
                    {priorityBadge.text}
                </div>
            </div>

            <p className="text-dim dark:text-muted text-xs font-medium leading-relaxed mb-4 line-clamp-2">
                {task.description || "لا يوجد وصف إضافي لهذه المهمة..."}
            </p>

            <div className="pt-3 border-t border-border dark:border-border flex items-center justify-between">
                <div className="flex gap-2">
                    {task.status !== 'completed' ? (
                        <button
                            onClick={() => onUpdateStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
                            className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 text-micro font-bold uppercase tracking-wider rounded-card border transition-all shadow-sm",
                                task.status === 'pending'
                                    ? "text-primary border-primary bg-primary-soft hover:bg-primary-soft"
                                    : "text-success-dark dark:text-success border-success bg-success-soft hover:bg-success-soft"
                            )}
                        >
                            {task.status === 'pending' ? <Rocket size={12} /> : <CheckCircle2 size={12} />}
                            {task.status === 'pending' ? 'بدء التنفيذ' : 'اكتملت'}
                        </button>
                    ) : (
                        <button
                            onClick={() => onUpdateStatus(task.id, 'pending')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-micro font-bold text-muted uppercase tracking-wider hover:text-dim dark:hover:text-dim transition-colors"
                        >
                            <RefreshCcw size={12} />
                            إعادة
                        </button>
                    )}
                </div>
                <button
                    onClick={() => onDelete(task.id)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-error bg-error-soft hover:bg-error-soft transition-all"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export const EmptyTaskState = () => (
    <div className="col-span-full py-14 text-center bg-card border border-border rounded-card shadow-sm">
        <div className="w-16 h-16 bg-primary rounded-card flex items-center justify-center mx-auto mb-4 shadow-soft">
            <ClipboardList size={24} className="text-on-primary" />
        </div>
        <h2 className="text-base font-black text-main mb-1">قائمة المهام</h2>
        <p className="text-micro font-bold text-primary uppercase tracking-wider">لم يتم العثور على مهام تطابق معايير البحث</p>
    </div>
);
