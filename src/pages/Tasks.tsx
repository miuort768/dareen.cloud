import { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle2, 
    Plus, 
    Trash2, 
    Calendar,
    ListTodo, 
    Clock, 
    LayoutGrid,
    LayoutList,
    Trophy,
    Zap,
    Search,
    Filter,
    Flame,
    Star
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await api.get<Task[]>('/tasks');
            // Ensure status 'in-progress' is handled if it's new
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

    if (loading) return <div className="p-20 text-center font-black animate-pulse">جاري تحميل لوحة المهام...</div>;

    return (
        <div className="space-y-8 pb-32 animate-in fade-in duration-500" dir="rtl">
            {/* Cyber-Brutalist Header */}
            <div className="relative bg-white border-4 md:border-8 border-gray-950 p-6 md:p-10 shadow-[10px_10px_0px_0px_#ef4444] overflow-hidden group mx-2 md:mx-0">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,_#000_1px,_transparent_0)] [background-size:24px_24px] opacity-[0.03]"></div>
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-950 text-white border-4 border-rose-500 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-all shadow-[6px_6px_0px_0px_#ef4444]">
                            <ListTodo size={48} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-gray-950 text-white text-[10px] font-black px-3 py-1 uppercase tracking-tighter">OPERATIONS HUB</span>
                                <h1 className="text-3xl md:text-5xl font-black text-gray-950 tracking-tighter uppercase italic">غرفة العمليات</h1>
                            </div>
                            <p className="text-gray-500 font-black text-xs md:text-sm flex items-center gap-3">
                                <Zap size={18} className="text-yellow-500 fill-yellow-500" />
                                أدر مهامك بقوة، دقة، وسرعة فائقة
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-gray-950 text-white px-10 py-5 border-4 border-gray-950 shadow-[8px_8px_0px_0px_#ef4444] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-4 font-black text-sm md:text-base uppercase group/btn w-full md:w-auto justify-center"
                    >
                        <Plus size={24} className="group-hover/btn:rotate-90 transition-transform" />
                        إطلاق مهمة جديدة
                    </button>
                </div>
            </div>

            {/* Gamified Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
                {[
                    { label: 'مستوى الإنجاز', val: `${stats.score}%`, icon: Trophy, color: 'bg-yellow-400', shadow: 'shadow-yellow-600' },
                    { label: 'مهام معلقة', val: stats.pending, icon: Clock, color: 'bg-blue-400', shadow: 'shadow-blue-600' },
                    { label: 'قيد التنفيذ', val: stats.inProgress, icon: Flame, color: 'bg-orange-500 text-white', shadow: 'shadow-orange-700' },
                    { label: 'تم الانتهاء', val: stats.completed, icon: CheckCircle2, color: 'bg-emerald-400', shadow: 'shadow-emerald-600' }
                ].map((stat, i) => (
                    <div key={i} className={cn("bg-white border-4 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] hover:-translate-y-1 transition-all group", stat.color)}>
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon size={24} strokeWidth={3} className="text-gray-950" />
                            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center font-black text-[10px]">0{i+1}</div>
                        </div>
                        <p className="text-[10px] font-black text-black/50 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl md:text-3xl font-black text-gray-950">{stat.val}</h3>
                    </div>
                ))}
            </div>

            {/* Smart Toolbar */}
            <div className="mx-2 md:mx-0 bg-gray-50 border-4 border-gray-950 p-6 flex flex-wrap items-center justify-between gap-6 no-print shadow-[10px_10px_0px_0px_black]">
                <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-950" size={20} />
                        <input 
                            type="text" 
                            placeholder="ابحث عن مهمة، وصف، أو كود المتابعة..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-4 border-gray-950 p-4 pr-12 font-black text-gray-950 focus:bg-yellow-50 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex bg-gray-200 border-4 border-gray-950 p-1">
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 transition-all", viewMode === 'grid' ? "bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]" : "opacity-40")}><LayoutGrid size={20}/></button>
                        <button onClick={() => setViewMode('list')} className={cn("p-2 transition-all", viewMode === 'list' ? "bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]" : "opacity-40")}><LayoutList size={20}/></button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Filter size={20} className="text-gray-400" />
                    <div className="flex gap-2">
                        {['all', 'high', 'medium', 'low'].map(p => (
                            <button 
                                key={p}
                                onClick={() => setFilterPriority(p as any)}
                                className={cn(
                                    "px-4 py-2 border-2 border-gray-950 font-black text-[10px] uppercase transition-all",
                                    filterPriority === p ? "bg-gray-950 text-white shadow-[3px_3px_0px_0px_#ef4444]" : "bg-white text-gray-400 hover:bg-gray-100"
                                )}
                            >
                                {p === 'all' ? 'الكل' : p === 'high' ? 'عاجل' : p === 'medium' ? 'متوسط' : 'عادي'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tasks Canvas */}
            <div className={cn(
                "mx-2 md:mx-0 grid gap-8",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => {
                        const isHigh = task.priority === 'high';
                        const isCompleted = task.status === 'completed';
                        const isInProgress = task.status === 'in-progress';

                        return (
                            <div 
                                key={task.id}
                                className={cn(
                                    "bg-white border-4 border-gray-950 p-6 relative group transform transition-all hover:-translate-x-1 hover:-translate-y-1 overflow-hidden",
                                    isHigh && !isCompleted && "shadow-[10px_10px_0px_0px_#ef4444] animate-pulse-subtle",
                                    !isHigh && !isCompleted && "shadow-[8px_8px_0px_0px_black]",
                                    isCompleted && "shadow-[4px_4px_0px_0px_black] opacity-70 grayscale",
                                    isInProgress && "shadow-[8px_8px_0px_0px_#3b82f6]"
                                )}
                            >
                                {/* Priority Badge Overlay */}
                                <div className={cn(
                                    "absolute top-0 left-0 px-4 py-1 border-b-2 border-r-2 border-gray-950 font-black text-[9px] uppercase tracking-widest",
                                    isHigh ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500"
                                )}>
                                    {task.priority} PRIORITY
                                </div>

                                <div className="mt-6 flex flex-col h-full">
                                    <h3 className={cn("text-xl font-black mb-3 leading-tight", isCompleted && "line-through")}>
                                        {task.title}
                                    </h3>
                                    <p className="text-gray-500 font-bold text-sm mb-6 flex-1 line-clamp-3">
                                        {task.description || "لا يوجد وصف إضافي لهذه المهمة..."}
                                    </p>

                                    <div className="flex items-center gap-4 mb-6 border-t-2 border-gray-100 pt-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                                            <Calendar size={14} />
                                            {task.dueDate}
                                        </div>
                                        {task.category && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 border border-primary-200">
                                                <Star size={10} className="fill-current" />
                                                {task.category}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Row */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex gap-2">
                                            {task.status !== 'completed' && (
                                                <button 
                                                    onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
                                                    className={cn(
                                                        "px-4 py-2 border-2 border-gray-950 font-black text-[10px] uppercase transition-all flex items-center gap-2",
                                                        task.status === 'pending' ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-emerald-500 text-white hover:bg-emerald-600"
                                                    )}
                                                >
                                                    {task.status === 'pending' ? <Flame size={14}/> : <CheckCircle2 size={14}/>}
                                                    {task.status === 'pending' ? 'بدء العمل' : 'إكمال المهمة'}
                                                </button>
                                            )}
                                            {task.status === 'completed' && (
                                                <button 
                                                    onClick={() => updateTaskStatus(task.id, 'pending')}
                                                    className="px-4 py-2 border-2 border-gray-950 bg-gray-100 font-black text-[10px] uppercase hover:bg-white"
                                                >
                                                    إعادة فتح
                                                </button>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => deleteTask(task.id)}
                                            className="w-10 h-10 border-2 border-gray-950 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full py-20 bg-gray-50 border-8 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-200 border-4 border-white flex items-center justify-center animate-bounce mb-6">
                            <Zap size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-300 uppercase italic mb-2 tracking-tighter">لا توجد مهام حالياً</h2>
                        <p className="text-gray-400 font-bold max-w-sm">قم بإطلاق مهمة جديدة لتبدأ رحلة الإبداع في تنظيم العمل</p>
                    </div>
                )}
            </div>

            {/* Advanced Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white border-8 border-gray-950 w-full max-w-xl shadow-[20px_20px_0px_0px_#ef4444] overflow-hidden transform animate-in zoom-in-95">
                        <div className="p-8 border-b-8 border-gray-950 bg-gray-950 text-white flex justify-between items-center group">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                                <Plus className="text-rose-500" /> تسجيل مهمة استراتيجية
                            </h3>
                            <button onClick={() => setShowAddForm(false)} className="bg-rose-600 text-white w-12 h-12 flex items-center justify-center border-4 border-gray-950 shadow-[4px_4px_0px_0px_#444] hover:bg-rose-500 transition-colors font-black text-2xl">
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddTask} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest block">عنوان المهمة الرئيسي</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="ما الذي تريد إنجازه؟"
                                        className="w-full bg-white border-4 border-gray-950 p-4 font-black text-gray-950 focus:bg-rose-50 outline-none transition-all"
                                        value={newTask.title}
                                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest block">الأولوية</label>
                                    <select 
                                        className="w-full bg-white border-4 border-gray-950 p-4 font-black outline-none appearance-none cursor-pointer focus:bg-rose-50"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                                    >
                                        <option value="low">عادية (Low)</option>
                                        <option value="medium">متوسطة (Medium)</option>
                                        <option value="high">عاجلة جداً (High)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest block">تاريخ التنفيذ</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-white border-4 border-gray-950 p-4 font-black outline-none focus:bg-rose-50"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest block">التفاصيل والتوجيهات</label>
                                    <textarea 
                                        placeholder="اكتب هنا كافة المعلومات اللازمة..."
                                        className="w-full bg-white border-4 border-gray-950 p-4 font-black text-gray-950 h-32 resize-none focus:bg-rose-50 outline-none"
                                        value={newTask.description}
                                        onChange={e => setNewTask({...newTask, description: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-rose-500 text-white py-6 border-4 border-gray-950 shadow-[8px_8px_0px_0px_black] font-black uppercase tracking-widest text-base hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4">
                                <Zap size={24} className="fill-current" />
                                إدراج المهمة في النظام
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
