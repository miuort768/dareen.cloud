import { Link } from 'react-router-dom';
import { ListTodo, CheckCircle2, ChevronLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5 transition-all duration-500 hover:shadow-indigo-500/10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-500/20">
                        <ListTodo size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">المهام والطلبات</h3>
                        <p className="text-sm font-medium text-gray-400">المتابعة الإدارية</p>
                    </div>
                </div>
                <Link to="/tasks" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-indigo-600">
                    <ChevronLeft size={20} />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-slate-800 group">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-lg",
                                    task.priority === 'high' ? "bg-red-500 shadow-red-500/20" :
                                    task.priority === 'medium' ? "bg-amber-500 shadow-amber-500/20" : "bg-blue-500 shadow-blue-500/20"
                                )}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-800 dark:text-white leading-tight mb-2">{task.title}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-semibold text-gray-400">{task.dueDate}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                            task.priority === 'high' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {task.priority === 'high' ? 'عاجل' : 'مهمة'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                            <CheckCircle2 size={32} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-400">لا توجد مهام معلقة</p>
                    </div>
                )}
            </div>
            
            <Link 
                to="/tasks" 
                className="mt-6 w-full py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest text-center hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
            >
                عرض جميع المهام
            </Link>
        </div>
    );
};
