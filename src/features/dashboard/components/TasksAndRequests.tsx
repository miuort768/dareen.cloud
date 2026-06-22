import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <ListTodo size={12} className="text-indigo-500" />
                    المهام والطلبات
                </h3>
                <Link to="/tasks" className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white transition-all">
                    <ChevronLeft size={14} />
                </Link>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all",
                            task.priority === 'high' ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20" :
                            task.priority === 'medium' ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20" :
                            "bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600"
                        )}>
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                task.priority === 'high' ? "bg-rose-100 dark:bg-rose-500/20 text-rose-500" :
                                task.priority === 'medium' ? "bg-amber-100 dark:bg-amber-500/20 text-amber-500" :
                                "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500"
                            )}>
                                {task.priority === 'high' ? <AlertTriangle size={13} /> : <Clock size={13} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">{task.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">{task.dueDate}</span>
                                    {task.priority === 'high' && (
                                        <span className="text-[7px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded">عاجل</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                            <ListTodo size={18} className="text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">لا توجد مهام نشطة حالياً</p>
                    </div>
                )}
            </div>

            <Link
                to="/tasks"
                className="mt-3 w-full h-9 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-xl transition-all active:scale-[0.98]"
            >
                عرض كافة المهام
            </Link>
        </div>
    );
};
