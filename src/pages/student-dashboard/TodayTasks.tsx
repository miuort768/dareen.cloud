import { useState } from 'react';
import { CheckCircle, Circle, BookOpen, FileText, ClipboardList } from 'lucide-react';
import type { TodayTask } from './types';

interface TodayTasksProps {
    tasks: TodayTask[];
}

const typeConfig: Record<string, { icon: typeof BookOpen; label: string; color: string; bg: string }> = {
    homework: { icon: FileText, label: 'واجب', color: 'text-warning', bg: 'bg-warning-soft dark:bg-warning/10' },
    review: { icon: ClipboardList, label: 'مراجعة', color: 'text-info', bg: 'bg-info-soft dark:bg-info/10' },
    quiz: { icon: ClipboardList, label: 'اختبار', color: 'text-error', bg: 'bg-error-soft dark:bg-error/10' },
    session: { icon: BookOpen, label: 'حصة', color: 'text-primary', bg: 'bg-primary-soft dark:bg-primary/10' },
};

export const TodayTasks = ({ tasks }: TodayTasksProps) => {
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

    const toggle = (id: string) => {
        setCompletedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const completedCount = tasks.filter(t => completedIds.has(t.id)).length;

    return (
        <div className="bg-surface dark:bg-card border border-border dark:border-border rounded-2xl p-5 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-primary dark:text-primary bg-primary-soft dark:bg-primary/10 px-2.5 py-1 rounded-lg">
                    {completedCount}/{tasks.length}
                </span>
                <h3 className="text-sm font-bold text-main dark:text-main">مهام اليوم</h3>
            </div>

            <div className="space-y-2">
                {tasks.map((task) => {
                    const isDone = completedIds.has(task.id);
                    const config = typeConfig[task.type] || typeConfig.session;
                    const Icon = config.icon;

                    return (
                        <button
                            key={task.id}
                            onClick={() => toggle(task.id)}
                            className={`w-full flex items-center gap-3 p-3 min-h-12 rounded-xl border transition-all duration-200 text-start active:scale-[0.98] ${
                                isDone
                                    ? 'bg-surface dark:bg-surface border-border dark:border-border opacity-60'
                                    : 'bg-surface dark:bg-surface border-border dark:border-border hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-sm'
                            }`}
                            aria-label={`${isDone ? 'إلغاء' : 'تحديد'} ${task.subject}`}
                            role="checkbox"
                            aria-checked={isDone}
                        >
                            {isDone ? (
                                <CheckCircle size={18} className="text-success shrink-0" />
                            ) : (
                                <Circle size={18} className="text-border dark:text-border shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold ${isDone ? 'text-muted dark:text-muted line-through' : 'text-main dark:text-main'}`}>
                                    {task.subject}
                                </p>
                                {task.time && (
                                    <p className="text-[11px] text-muted dark:text-muted mt-0.5">{task.time}</p>
                                )}
                            </div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${config.bg} ${config.color}`}>
                                {config.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
