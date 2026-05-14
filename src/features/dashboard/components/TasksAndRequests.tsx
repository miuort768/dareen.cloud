import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-none p-8 shadow-2xl h-full flex flex-col relative group overflow-hidden transition-all duration-500 hover:border-indigo-600">
            <div className="absolute top-0 right-0 w-2 h-full bg-slate-900 group-hover:bg-indigo-600 transition-colors" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-none flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                        <ListTodo size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">المهام والطلبات</h3>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em]">Operational Control</p>
                    </div>
                </div>
                <Link to="/tasks" className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-none transition-all shadow-xl">
                    <ChevronLeft size={24} />
                </Link>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-3 -mr-3">
                {tasks.length > 0 ? (
                    tasks.slice(0, 8).map((task) => (
                        <div key={task.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent hover:border-indigo-600/30 hover:bg-white dark:hover:bg-slate-800 transition-all group/item relative overflow-hidden">
                            <div className="flex items-start gap-5">
                                <div className={cn(
                                    "w-1.5 h-12 rounded-none shrink-0 transition-transform group-hover/item:scale-y-110",
                                    task.priority === 'high' ? "bg-rose-600 shadow-[4px_0_10px_rgba(225,29,72,0.3)]" :
                                    task.priority === 'medium' ? "bg-amber-500 shadow-[4px_0_10px_rgba(245,158,11,0.3)]" : "bg-indigo-600 shadow-[4px_0_10px_rgba(79,70,229,0.3)]"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-xs text-slate-900 dark:text-white leading-tight mb-3 truncate group-hover/item:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                            <Clock size={12} className="text-indigo-500" />
                                            <span className="text-[10px] font-black tabular-nums tracking-widest">{task.dueDate}</span>
                                        </div>
                                        {task.priority === 'high' && (
                                            <span className="text-[8px] font-black text-white bg-rose-600 px-3 py-1 rounded-none uppercase tracking-[0.2em] shadow-lg shadow-rose-600/20">
                                                URGENT
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-none flex items-center justify-center mb-6">
                            <ListTodo size={36} className="text-slate-300" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Active Operations</p>
                    </div>
                )}
            </div>
            
            <Link 
                to="/tasks" 
                className="mt-8 w-full h-14 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] rounded-none hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-2xl"
            >
                مركز العمليات الشامل
            </Link>
        </div>
    );
};

