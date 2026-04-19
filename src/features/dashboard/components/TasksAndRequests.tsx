import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white/90 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 md:p-6 shadow-sm rounded-none border-t-2 border-t-amber-500 h-full flex flex-col animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-amber-50 text-amber-600 flex items-center justify-center">
                        <ListTodo size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">المهام والطلبات</h3>
                    </div>
                </div>
                <Link to="/tasks" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
                    <ChevronLeft size={18} />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-3 md:p-4 bg-slate-50/80 dark:bg-slate-800/20 transition-all hover:bg-white dark:hover:bg-slate-800 group relative">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-1 h-8 shrink-0",
                                    task.priority === 'high' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                                    task.priority === 'medium' ? "bg-amber-500" : "bg-indigo-500"
                                )}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-[12px] text-slate-800 dark:text-white leading-tight mb-2 truncate uppercase tracking-tight">{task.title}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                            <span className="text-[10px] font-black text-slate-500 font-mono tracking-tighter">{task.dueDate}</span>
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-0.5 border tracking-widest uppercase",
                                            task.priority === 'high' ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20" : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50"
                                        )}>
                                            {task.priority === 'high' ? 'عاجل' : 'مجدول'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800/50 p-10 grayscale opacity-30">
                        <ListTodo size={40} className="mb-4 text-slate-300" />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">لا توجد مهام حالياً</p>
                    </div>
                )}
            </div>
            
            <Link 
                to="/tasks" 
                className="mt-6 w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] text-center hover:bg-slate-800 dark:hover:bg-slate-100 transition-all border border-transparent shadow-xl shadow-slate-900/10"
            >
                عرض كافة الطلبات
            </Link>
        </div>
    );
};
