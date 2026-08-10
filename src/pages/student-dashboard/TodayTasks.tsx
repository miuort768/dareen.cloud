import { useState } from 'react';
import { CheckCircle, Circle, BookOpen, FileText, ClipboardList } from 'lucide-react';
import type { TodayTask } from './types';

interface TodayTasksProps {
    tasks: TodayTask[];
}

const typeConfig: Record<string, { icon: typeof BookOpen; label: string; color: string }> = {
    homework: { icon: FileText, label: 'واجب', color: 'text-warning bg-warning-soft' },
    review: { icon: ClipboardList, label: 'مراجعة', color: 'text-info bg-info-soft' },
    quiz: { icon: ClipboardList, label: 'اختبار', color: 'text-error bg-error-soft' },
    session: { icon: BookOpen, label: 'حصة', color: 'text-primary bg-primary-soft' },
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
        <div className="bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-micro font-bold text-primary dark:text-[#D4AF37] bg-primary-soft dark:bg-[#D4AF37]/10 px-2 py-0.5 rounded-lg">
                    {completedCount}/{tasks.length}
                </span>
                <h3 className="text-sm font-bold text-main dark:text-white">مهام اليوم</h3>
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
                            className={`w-full flex items-center gap-3 p-3 min-h-11 rounded-xl border transition-all text-start ${
                                isDone
                                    ? 'bg-surface dark:bg-[#0a0a0c] border-border dark:border-[#D4AF37]/10 opacity-60'
                                    : 'bg-card dark:bg-[#0d0d0f] border-border dark:border-[#D4AF37]/20 hover:border-primary/30 dark:hover:border-[#D4AF37]/40'
                            }`}
                            aria-label={`${isDone ? 'إلغاء' : 'تحديد'} ${task.subject}`}
                            role="checkbox"
                            aria-checked={isDone}
                        >
                            {isDone ? (
                                <CheckCircle size={18} className="text-success shrink-0" />
                            ) : (
                                <Circle size={18} className="text-border shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold ${isDone ? 'text-muted dark:text-zinc-500 line-through' : 'text-main dark:text-white'}`}>
                                    {task.subject}
                                </p>
                                {task.time && (
                                    <p className="text-micro text-muted dark:text-zinc-400">{task.time}</p>
                                )}
                            </div>
                            <span className={`text-micro font-bold px-2 py-0.5 rounded-lg shrink-0 ${config.color}`}>
                                {config.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
