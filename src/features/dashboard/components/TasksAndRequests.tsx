import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-none p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-950 text-white rounded-none flex items-center justify-center shadow-lg">
                        <ListTodo size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter">المهام والطلبات</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Daily Operations</p>
                    </div>
                </div>
                <Link to="/tasks" className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 rounded-none transition-all">
                    <ChevronLeft size={20} />
                </Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-none border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-1 h-10 rounded-none shrink-0",
                                    task.priority === 'high' ? "bg-rose-500" :
                                    task.priority === 'medium' ? "bg-amber-500" : "bg-indigo-500"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-xs text-slate-950 dark:text-white leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Clock size={10} />
                                            <span className="text-[10px] font-black font-mono tabular-nums uppercase tracking-widest">{task.dueDate}</span>
                                        </div>
                                        {task.priority === 'high' && (
                                            <span className="flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-none uppercase tracking-widest">
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
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                        <ListTodo size={48} className="text-slate-300 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">لا توجد مهام معلقة</p>
                    </div>
                )}
            </div>
            
            <Link 
                to="/tasks" 
                className="mt-6 w-full h-11 flex items-center justify-center bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-none hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
            >
                عرض كافة المهام
            </Link>
        </div>
    );
};
