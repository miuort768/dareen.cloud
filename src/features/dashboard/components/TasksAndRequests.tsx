import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center">
                        <ListTodo size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">المهام والطلبات</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">قائمة المتابعة اليومية</p>
                    </div>
                </div>
                <Link to="/tasks" className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all">
                    <ChevronLeft size={20} />
                </Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-1.5 h-10 rounded-full shrink-0",
                                    task.priority === 'high' ? "bg-rose-500" :
                                    task.priority === 'medium' ? "bg-amber-500" : "bg-indigo-500"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight mb-2 truncate group-hover:text-indigo-500 transition-colors">{task.title}</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Clock size={10} />
                                            <span className="text-[10px] font-bold tabular-nums">{task.dueDate}</span>
                                        </div>
                                        {task.priority === 'high' && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg uppercase">
                                                <AlertCircle size={8} />
                                                عاجل
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 py-10">
                        <ListTodo size={48} className="text-slate-300 mb-4" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">لا توجد مهام معلقة</p>
                    </div>
                )}
            </div>
            
            <Link 
                to="/tasks" 
                className="mt-6 w-full h-11 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all active:scale-95"
            >
                عرض كافة المهام
            </Link>
        </div>
    );
};
