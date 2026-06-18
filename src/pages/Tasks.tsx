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
    Sparkles,
    ShieldCheck,
    ChevronDown,
    X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { PageLoader } from '../components/ui/PageLoader';

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
        category: 'عام'
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
                category: 'عام'
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
        if (!await confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
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
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-6 relative bg-[#F8F8FC] dark:bg-slate-950" dir="rtl">
            <div className="relative z-10 max-w-[1600px] mx-auto px-3 space-y-4">

                {/* Hero */}
                <div className="relative bg-gradient-to-br from-violet-50 via-violet-100/50 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 rounded-2xl overflow-hidden mb-2 shadow-sm border border-violet-100/50 dark:border-slate-700/50">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
                        <div className="flex flex-col items-start">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200/50 dark:border-indigo-700/30 rounded-full mb-3">
                                <Sparkles size={10} className="text-indigo-600 dark:text-indigo-400" />
                                <span className="text-[9px] font-bold text-indigo-700 dark:text-white">مركز القيادة</span>
                            </div>
                            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-1">
                                مركز التحكم بالمهام
                            </h1>
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                تتبع وإدارة جميع المهام الخاصة بك <span className="text-indigo-600 dark:text-indigo-400">في مكان واحد</span>
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="group relative inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 font-bold text-[10px] uppercase tracking-widest transition-all hover:shadow-md active:scale-[0.97] rounded-2xl shadow-sm"
                        >
                            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                            إضافة مهمة جديدة
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'مهام معلقة', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200/50 dark:border-amber-500/20' },
                        { label: 'قيد التنفيذ', value: stats.inProgress, icon: RefreshCcw, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200/50 dark:border-indigo-500/20' },
                        { label: 'نسبة الإنجاز', value: `${stats.score}%`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200/50 dark:border-emerald-500/20' },
                        { label: 'تم الإنجاز', value: stats.completed, icon: CheckCircle2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200/50 dark:border-purple-500/20' }
                    ].map((stat, i) => (
                        <div key={i} className={cn(
                            "bg-white dark:bg-slate-800 border rounded-2xl p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                            stat.border
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0", stat.border, stat.bg)}>
                                    <stat.icon size={24} className={stat.color} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{stat.value}</h3>
                                    <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="ابحث عن مهمة..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 pr-10 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-2 w-full md:flex md:w-auto">
                        {['all', 'high', 'medium', 'low'].map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterPriority(p as 'high' | 'medium' | 'low' | 'all')}
                                className={cn(
                                    "px-4 py-2.5 font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap rounded-2xl border shadow-sm",
                                    filterPriority === p
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/30"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                                )}
                            >
                                {p === 'all' ? 'الكل' : p === 'high' ? 'عالية' : p === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task Cards */}
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => {
                            const isCompleted = task.status === 'completed';

                            const priorityBadge = task.priority === 'high'
                                ? { text: 'عالية', colors: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-500/20' }
                                : task.priority === 'medium'
                                ? { text: 'متوسطة', colors: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20' }
                                : { text: 'منخفضة', colors: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-500/20' };

                            return (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md",
                                        isCompleted && "opacity-60"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {isCompleted && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                                                <h3 className={cn(
                                                    "text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight",
                                                    isCompleted && "line-through opacity-50"
                                                )}>
                                                    {task.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={11} className="text-slate-400" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">الموعد: {task.dueDate}</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider rounded-full border shrink-0",
                                            priorityBadge.colors
                                        )}>
                                            {priorityBadge.text}
                                        </div>
                                    </div>

                                    <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-relaxed mb-4 line-clamp-2">
                                        {task.description || "لا يوجد وصف إضافي لهذه المهمة..."}
                                    </p>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            {task.status !== 'completed' ? (
                                                <button
                                                    onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-2xl border transition-all shadow-sm",
                                                        task.status === 'pending'
                                                            ? "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700/50 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                                                            : "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                                                    )}
                                                >
                                                    {task.status === 'pending' ? <Rocket size={12} /> : <CheckCircle2 size={12} />}
                                                    {task.status === 'pending' ? 'بدء التنفيذ' : 'اكتملت'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => updateTaskStatus(task.id, 'pending')}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                                >
                                                    <RefreshCcw size={12} />
                                                    إعادة
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-14 text-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-700/30">
                                <ClipboardList size={22} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-base font-black text-slate-800 dark:text-white mb-1">قائمة المهام</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">لم يتم العثور على مهام تطابق معايير البحث</p>
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                        <Plus size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">إنشاء مهمة جديدة</h3>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">إضافة مهمة إلى القائمة</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAddForm(false)} className="p-3 bg-red-500 rounded-xl text-black hover:bg-red-600 transition-colors">
                                    <X size={22} />
                                </button>
                            </div>

                            <form onSubmit={handleAddTask} className="p-5 space-y-4">
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles size={10} className="text-indigo-600 dark:text-indigo-400" /> عنوان المهمة
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                                            value={newTask.title}
                                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">درجة الأولوية</label>
                                            <div className="relative">
                                                <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                <select
                                                    className="appearance-none w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pr-4 pl-8 text-xs font-bold text-slate-800 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    value={newTask.priority}
                                                    onChange={e => setNewTask({...newTask, priority: e.target.value as 'high' | 'medium' | 'low'})}
                                                >
                                                    <option value="low">منخفضة</option>
                                                    <option value="medium">متوسطة</option>
                                                    <option value="high">عالية</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">تاريخ التسليم</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={newTask.dueDate}
                                                onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <ShieldCheck size={10} className="text-indigo-600 dark:text-indigo-400" /> وصف المهمة
                                        </label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-white h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newTask.description}
                                            onChange={e => setNewTask({...newTask, description: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-bold text-xs uppercase tracking-wider transition-all rounded-2xl shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30 active:scale-[0.98]">
                                    إنشاء مهمة جديدة
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
