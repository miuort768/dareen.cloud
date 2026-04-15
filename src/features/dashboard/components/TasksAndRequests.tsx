import { Link } from 'react-router-dom';
import { ListTodo, CheckCircle2, ChevronLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm rounded-none border-t-2 border-t-amber-500 flex flex-col">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 text-white flex items-center justify-center">
                        <ListTodo size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">المهام والطلبات</h3>
                    </div>
                </div>
                <Link to="/tasks" className="p-1 hover:bg-slate-50 rounded-none transition-colors text-slate-400">
                    <ChevronLeft size={16} />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[300px]">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-none border border-slate-100 dark:border-slate-800 transition-all hover:bg-white group">
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "w-2 h-5 shrink-0",
                                    task.priority === 'high' ? "bg-red-500" :
                                    task.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                                )}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[11px] text-slate-800 dark:text-white leading-tight mb-1 truncate">{task.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-slate-400 font-mono italic">{task.dueDate}</span>
                                        <span className={cn(
                                            "text-[8px] font-black px-1.5 py-0.5 rounded-none border",
                                            task.priority === 'high' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-600 border-slate-100"
                                        )}>
                                            {task.priority === 'high' ? 'عاجل' : 'مهمة'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">لا توجد مهام</p>
                    </div>
                )}
            </div>
            
            <Link 
                to="/tasks" 
                className="mt-5 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] uppercase tracking-widest text-center hover:bg-slate-800 transition-all border border-slate-950 shadow-none"
            >
                السجل الكامل
            </Link>
        </div>
    );
};
