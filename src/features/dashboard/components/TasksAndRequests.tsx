import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-6 shadow-sm h-full flex flex-col transition-all">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-none flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                        <ListTodo size={20} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">المهام والطلبات</h3>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-tight">إدارة العمليات والتحكم</p>
                    </div>
                </div>
                <Link to="/tasks" className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-indigo-600 hover:text-white border border-slate-200 dark:border-slate-700 rounded-none transition-all">
                    <ChevronLeft size={16} />
                </Link>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all rounded-none group relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-none flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700",
                                    task.priority === 'high' ? "bg-rose-50 text-rose-600 border-rose-200" :
                                    task.priority === 'medium' ? "bg-amber-50 text-amber-500 border-amber-200" : "bg-indigo-50 text-indigo-600 border-indigo-200"
                                )}>
                                    <Clock size={12} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-[11px] text-slate-900 dark:text-white leading-tight truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 tabular-nums uppercase">{task.dueDate}</span>
                                        {task.priority === 'high' && (
                                            <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-1.5 border border-rose-250 uppercase dark:bg-rose-500/10 dark:border-rose-500/20">عاجل جداً</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-750/60 rounded-none flex items-center justify-center mb-4">
                            <ListTodo size={24} className="text-slate-300" />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">لا توجد مهام نشطة حالياً</p>
                    </div>
                )}
            </div>
            
            <Link 
                to="/tasks" 
                className="mt-6 w-full h-10 flex items-center justify-center bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-[10px] uppercase border border-slate-950 dark:border-slate-800 rounded-none shadow-sm hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all active:scale-[0.98]"
            >
                عرض كافة المهام
            </Link>
        </div>
    );
};
