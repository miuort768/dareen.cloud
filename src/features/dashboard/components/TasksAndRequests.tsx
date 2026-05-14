import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-none flex items-center justify-center border-2 border-slate-950 shadow-md">
                        <ListTodo size={20} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">المهام والطلبات</h3>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-tight">Operation Control</p>
                    </div>
                </div>
                <Link to="/tasks" className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-950 hover:text-white border-2 border-slate-950 rounded-none transition-all">
                    <ChevronLeft size={16} />
                </Link>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-950/10 hover:border-slate-950 transition-all rounded-none group relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-none border-2 border-slate-950 flex items-center justify-center shrink-0",
                                    task.priority === 'high' ? "bg-rose-600 text-white" :
                                    task.priority === 'medium' ? "bg-amber-500 text-white" : "bg-indigo-600 text-white"
                                )}>
                                    <Clock size={12} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-[11px] text-slate-900 dark:text-white leading-tight truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-bold text-slate-400 tabular-nums uppercase">{task.dueDate}</span>
                                        {task.priority === 'high' && (
                                            <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-1.5 border border-rose-200 uppercase">URGENT</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 border-2 border-slate-950/10 rounded-none flex items-center justify-center mb-4">
                            <ListTodo size={24} className="text-slate-300" />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">No active tasks</p>
                    </div>
                )}
            </div>
            
            <Link 
                to="/tasks" 
                className="mt-6 w-full h-10 flex items-center justify-center bg-slate-950 text-white font-black text-[10px] uppercase border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] transition-all active:translate-y-0 active:shadow-none"
            >
                عرض كافة المهام
            </Link>
        </div>
    );

};
