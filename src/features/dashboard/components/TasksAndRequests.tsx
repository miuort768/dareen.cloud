import { Link } from 'react-router-dom';
import { ListTodo, ChevronLeft, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none">
                        <ListTodo size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">المهام والطلبات</h3>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-widest">إدارة العمليات اليومية</p>
                    </div>
                </div>
                <Link to="/tasks" className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                    <ChevronLeft size={20} />
                </Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all group relative overflow-hidden">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-1 h-10 rounded-full shrink-0",
                                    task.priority === 'high' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" :
                                    task.priority === 'medium' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-xs text-slate-900 dark:text-white leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                            <Clock size={10} />
                                            <span className="text-[10px] font-bold tabular-nums">{task.dueDate}</span>
                                        </div>
                                        {task.priority === 'high' && (
                                            <span className="flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                                عاجل
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                            <ListTodo size={32} className="text-slate-300" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">لا توجد مهام حالياً</p>
                    </div>
                )}
            </div>
            
            <Link 
                to="/tasks" 
                className="mt-6 w-full h-12 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-indigo-500/5"
            >
                عرض كافة المهام
            </Link>
        </div>
    );
};
