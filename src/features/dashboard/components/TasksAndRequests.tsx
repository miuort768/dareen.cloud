import { Link } from 'react-router-dom';
import { ListTodo, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xl relative flex flex-col group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500"></div>
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                        <ListTodo size={18} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-tight">المهام والطلبات</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">المتابعة الإدارية</p>
                    </div>
                </div>
                <Link to="/tasks" className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-widest">إدارة الكل</Link>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[240px] lg:h-[240px]">
                {tasks.length > 0 ? (
                    tasks.slice(0, 6).map((task) => (
                        <div key={task.id} className="p-4 flex items-center gap-4 border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-amber-50/30 dark:hover:bg-amber-900/5 transition-all group/item cursor-pointer">
                            <div className={cn(
                                "w-2 h-10 flex-shrink-0 animate-pulse",
                                task.priority === 'high' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" :
                                    task.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                            )}></div>
                            <div className="flex-1 min-w-0 font-right text-right">
                                <p className="font-black text-xs text-gray-900 dark:text-white truncate group-hover/item:text-primary-600 transition-colors uppercase">{task.title}</p>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{task.dueDate}</span>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                    <span className={cn(
                                        "text-[8px] font-black px-1.5 py-0.5",
                                        task.priority === 'high' ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-100"
                                    )}>
                                        {task.priority === 'high' ? 'عاجل' : 'مهمة'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-6 h-6 border-2 border-gray-100 dark:border-gray-800 rounded-none flex items-center justify-center group-hover/item:border-amber-400 transition-colors">
                                <div className="w-2 h-2 bg-clear group-hover/item:bg-amber-400 transition-colors"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-16 text-center space-y-3">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 mx-auto flex items-center justify-center">
                            <CheckCircle2 size={24} className="text-gray-200" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">لا توجد مهام معلقة</p>
                    </div>
                )}
            </div>
        </div>
    );
};
