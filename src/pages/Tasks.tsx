import { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle2, 
    Plus, 
    Trash2, 
    Calendar,
    Clock, 
    Search,
    RefreshCcw,
    TrendingUp,
    Rocket,
    ClipboardList,
    Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    category?: string;
}

export const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await api.get<Task[]>('/tasks');
            setTasks(data.map(t => ({ ...t, status: t.status || 'pending' })));
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newTask, setNewTask] = useState<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        dueDate: string;
        category: string;
    }>({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        category: 'إداري'
    });

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const addedTask = await api.post<Task>('/tasks', { ...newTask, status: 'pending' });
            setTasks([addedTask, ...tasks]);
            setShowAddForm(false);
            setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0],
                category: 'إداري'
            });
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const updateTaskStatus = async (id: string, newStatus: Task['status']) => {
        try {
            await api.patch(`/tasks/${id}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const deleteTask = async (id: string) => {
        if (!window.confirm('هل تريد حذف هذه المهمة نهائياً؟')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesPriority && matchesSearch;
        });
    }, [tasks, filterPriority, searchTerm]);

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        score: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-slate-400 font-bold text-sm animate-pulse">جاري تحميل لوحة المهام...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500" dir="rtl">
            
            {/* Header Card (Purple) */}
            <div className="bg-[#5c4fb1] text-white p-6 rounded-3xl mx-2 md:mx-0 shadow-xl shadow-indigo-500/20 text-center relative overflow-hidden">
                <div className="absolute top-6 left-6 opacity-20">
                    <Activity size={40} />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <h1 className="text-xl md:text-2xl font-black mb-1 drop-shadow-sm tracking-tight text-white">غرفة العمليات</h1>
                    <p className="text-[10px] md:text-xs font-bold text-indigo-100/90 mb-6 drop-shadow-sm">إدارة وتحليل المهام المركزية</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full max-w-[280px] md:max-w-xs bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-2xl py-3.5 font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 shadow-inner"
                    >
                        إطلاق مهمة جديدة <Rocket size={16} className="fill-white/20" />
                    </button>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-2 md:px-0">
                {/* 1. Pending (Active) */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[11px] font-black text-blue-600">نشط</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-black text-slate-800 leading-none">{stats.pending}</h3>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">مهام معلقة</p>
                    </div>
                </div>

                {/* 2. In Progress */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[11px] font-black text-orange-600">جاري</span>
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                            <RefreshCcw size={16} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-black text-slate-800 leading-none">{stats.inProgress}</h3>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">قيد التنفيذ</p>
                    </div>
                </div>

                {/* 3. Indicator */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[11px] font-black text-yellow-600">المؤشر</span>
                        <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-500 flex items-center justify-center shrink-0">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-black text-slate-800 leading-none">{stats.score}%</h3>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">مستوى الإنجاز</p>
                    </div>
                </div>

                {/* 4. Completed */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[11px] font-black text-emerald-600">منتهي</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-black text-slate-800 leading-none">{stats.completed}</h3>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">تم الانتهاء</p>
                    </div>
                </div>
            </div>

            {/* Smart Search & Filter */}
            <div className="mx-2 md:mx-0 space-y-4 pt-2 max-w-[340px] md:max-w-md mx-auto">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="ابحث عن مهمة..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-200/50 dark:bg-slate-800/50 border-none rounded-xl py-3 px-4 pr-11 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center justify-center gap-2 flex-row-reverse">
                    {['low', 'medium', 'high', 'all'].map(p => (
                        <button 
                            key={p}
                            onClick={() => setFilterPriority(p as any)}
                            className={cn(
                                "px-4 py-1.5 rounded-full font-black text-[9px] transition-all",
                                filterPriority === p ? "bg-[#5c4fb1] text-white shadow-lg shadow-indigo-500/20" : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
                            )}
                        >
                            {p === 'all' ? 'الكل' : p === 'high' ? 'عاجل' : p === 'medium' ? 'متوسط' : 'هادئ'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks Canvas Area */}
            <div className="mx-2 md:mx-0 mt-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => {
                        const isHigh = task.priority === 'high';
                        const isCompleted = task.status === 'completed';

                        return (
                            <div 
                                key={task.id}
                                className={cn(
                                    "bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 w-full relative group transition-all hover:shadow-lg border border-slate-50 dark:border-slate-800 flex flex-col",
                                    isHigh && !isCompleted && "shadow-[0_8px_30px_rgba(244,63,94,0.1)] border-rose-100 dark:border-rose-900/30",
                                    !isHigh && !isCompleted && "shadow-[0_8px_30px_rgba(0,0,0,0.03)]",
                                    isCompleted && "opacity-60 shadow-none"
                                )}
                            >
                                <div className="flex items-start justify-between mb-3 border-b border-slate-50 dark:border-slate-800 pb-3">
                                    <div className="flex flex-col flex-1 pl-3">
                                       <h3 className={cn("text-[13px] font-black text-slate-800 dark:text-slate-100", isCompleted && "line-through grayscale")}>
                                           {task.title}
                                       </h3>
                                       <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 mt-1.5">
                                           <Calendar size={12} className="opacity-70" />
                                           <span>{task.dueDate}</span>
                                       </div>
                                    </div>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-lg font-black text-[9px] shrink-0",
                                        task.priority === 'high' ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" : 
                                        task.priority === 'medium' ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" : 
                                        "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                    )}>
                                        {task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'متوسط' : 'هادئ'}
                                    </span>
                                </div>
                                
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] mb-5 line-clamp-2 leading-relaxed flex-1">
                                    {task.description || "لا يوجد وصف إضافي لهذه المهمة..."}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800 mt-auto">
                                    <div className="flex gap-2">
                                        {task.status !== 'completed' && (
                                            <button 
                                                onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl font-black text-[9px] transition-all flex items-center gap-1.5",
                                                    task.status === 'pending' ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                                                )}
                                            >
                                                {task.status === 'pending' ? <RefreshCcw size={12}/> : <CheckCircle2 size={12}/>}
                                                {task.status === 'pending' ? 'بدء العمل' : 'إكمال المهمة'}
                                            </button>
                                        )}
                                        {task.status === 'completed' && (
                                            <button 
                                                onClick={() => updateTaskStatus(task.id, 'pending')}
                                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-slate-500 dark:text-slate-400 text-[9px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                إعادة فتح
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => deleteTask(task.id)}
                                        className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full mt-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                            <ClipboardList size={28} className="text-slate-300 dark:text-slate-500" />
                        </div>
                        <h2 className="text-base font-black text-slate-800 dark:text-slate-200 mb-2">لا يوجد مهام حالياً</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[11px] max-w-xs mx-auto leading-relaxed">ابدأ بإضافة مهامك الجديدة لتظهر في غرفة العمليات هنا.</p>
                    </div>
                )}
            </div>

            {/* Elegant Add Task Modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-300">
                        <div className="p-5 md:p-6 bg-[#5c4fb1] text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <h3 className="text-sm md:text-base font-black flex items-center gap-2 relative z-10">
                                <Plus size={18} /> تسجيل مهمة جديدة
                            </h3>
                            <button 
                                onClick={() => setShowAddForm(false)} 
                                className="w-8 h-8 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-colors relative z-10"
                            >
                                <span className="text-lg font-black leading-none pb-1">&times;</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddTask} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">عنوان المهمة</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="ما الذي تريد إنجازه؟"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-shadow transition-colors"
                                        value={newTask.title}
                                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">الأولوية</label>
                                        <select 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                                            value={newTask.priority}
                                            onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                                        >
                                            <option value="low">هادئ</option>
                                            <option value="medium">متوسط</option>
                                            <option value="high">عاجل</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">تاريخ التنفيذ</label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={newTask.dueDate}
                                            onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">التفاصيل والتوجيهات</label>
                                    <textarea 
                                        placeholder="اكتب هنا كافة المعلومات اللازمة..."
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={newTask.description}
                                        onChange={e => setNewTask({...newTask, description: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[#5c4fb1] hover:bg-indigo-600 text-white mt-2 py-3.5 rounded-xl font-black text-[11px] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                                <Rocket size={14} className="fill-white/20" />
                                تأكيد إضافة المهمة
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

