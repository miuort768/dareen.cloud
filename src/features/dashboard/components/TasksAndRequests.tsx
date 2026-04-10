import { Link } from 'react-router-dom';
import { ListTodo, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardTask as Task } from '../types';

interface TasksAndRequestsProps {
    tasks: Task[];
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
    return (
        <div className="bg-white border-4 border-gray-950 dark:bg-gray-900 dark:border-gray-800 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] relative flex flex-col group rounded-none h-full">
            <div className="absolute top-0 right-0 w-2 h-full bg-amber-500 border-l-2 border-gray-950"></div>
            <div className="p-6 border-b-4 border-gray-950 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500 text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_#444]">
                        <ListTodo size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-950 dark:text-white text-sm lg:text-base uppercase tracking-tight">المهام والطلبات</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المتابعة الإدارية</p>
                    </div>
                </div>
                <Link to="/tasks" className="bg-gray-950 text-white px-3 py-1.5 border-2 border-gray-950 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">إدارة الكل</Link>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[240px]">
                {tasks.length > 0 ? (
                    tasks.slice(0, 8).map((task) => (
                        <div key={task.id} className="p-5 flex items-center gap-4 border-b-2 border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all group/item cursor-pointer">
                            <div className={cn(
                                "w-2.5 h-10 flex-shrink-0 border border-gray-950",
                                task.priority === 'high' ? "bg-red-500" :
                                    task.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                            )}></div>
                            <div className="flex-1 min-w-0 text-right">
                                <p className="font-black text-xs md:text-sm text-gray-950 dark:text-white truncate group-hover/item:text-primary-600 transition-colors uppercase">{task.title}</p>
                                <div className="flex items-center justify-end gap-3 mt-1.5">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{task.dueDate}</span>
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-none border border-gray-400"></div>
                                    <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 border border-gray-950",
                                        task.priority === 'high' ? "text-white bg-red-600 shadow-[2px_2px_0px_0px_black]" : "text-gray-950 bg-gray-100"
                                    )}>
                                        {task.priority === 'high' ? 'عاجل جداً' : 'مهمة عمل'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-16 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 border-2 border-gray-200 mx-auto flex items-center justify-center transform rotate-3">
                            <CheckCircle2 size={32} className="text-gray-300" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">لا توجد مهام معلقة لله الحمد</p>
                    </div>
                )}
            </div>
        </div>
    );
};
