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
    ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
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
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20 font-sans" dir="rtl">
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-2 space-y-4">
            
            {/* ── Header Canvas (Premium Royal Purple) ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-none shadow-sm shadow-indigo-500/15 border border-white/5 px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                        <Sparkles size={12} className="text-indigo-400" />
                        <span className="text-[9px] font-medium text-indigo-400 uppercase tracking-widest">Premium Command Center</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-medium text-white uppercase tracking-tighter mb-4 drop-shadow-sm">
                        غرفة العمليات المركزية
                    </h1>
                    <p className="text-[11px] md:text-sm font-normal text-slate-400 uppercase tracking-widest mb-10 max-w-lg leading-relaxed">
                        تحليل متقدم وإدارة ذكية لكافة مهام <span className="text-indigo-500">دارين السابعة</span>
                    </p>

                    <button
                        onClick={() => setShowAddForm(true)}
                        className="group relative inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 font-medium text-[11px] md:text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                        تسجيل مهمة جديدة
                        <div className="absolute inset-0 border border-white/20 translate-x-1 translate-y-1 -z-10 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                    </button>
                </div>
            </div>

            {/* ── Analytics Grid (Glassmorphism Style) ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {[
                    { label: 'مهام معلقة', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
                    { label: 'قيد التنفيذ', value: stats.inProgress, icon: RefreshCcw, color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-500/20' },
                    { label: 'معدل الإنجاز', value: `${stats.score}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
                    { label: 'مهام مكتملة', value: stats.completed, icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/20' }
                ].map((stat, i) => (
                    <div key={i} className={cn(
                        "relative bg-white dark:bg-slate-900 border p-6 overflow-hidden transition-all hover:-translate-y-1",
                        stat.border
                    )}>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-500">
                            <stat.icon size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className={cn("w-10 h-10 rounded-none flex items-center justify-center mb-4 border", stat.border, stat.bg)}>
                                <stat.icon size={18} className={stat.color} />
                            </div>
                            <h3 className="text-3xl font-medium text-slate-800 dark:text-white tracking-tighter mb-1">{stat.value}</h3>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search & Filters (Sharp & Minimal) ── */}
            <div className="px-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="ابحث في أرشيف العمليات..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 py-4 px-6 pr-14 text-xs font-normal text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:tracking-widest"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {['high', 'medium', 'low', 'all'].map(p => (
                        <button 
                            key={p}
                            onClick={() => setFilterPriority(p as 'high' | 'medium' | 'low' | 'all')}
                            className={cn(
                                "px-6 py-4 border-2 font-medium text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap min-w-[100px]",
                                filterPriority === p 
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/20" 
                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-900"
                            )}
                        >
                            {p === 'all' ? 'الكل' : p === 'high' ? 'عاجل جداً' : p === 'medium' ? 'متوسط' : 'هادئ'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tasks Canvas (High Contrast Cards) ── */}
            <div className="px-4 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => {
                        const isHigh = task.priority === 'high';
                        const isCompleted = task.status === 'completed';

                        return (
                            <div 
                                key={task.id}
                                className={cn(
                                    "relative group bg-white dark:bg-slate-900 border-2 transition-all duration-500 flex flex-col p-8",
                                    isHigh && !isCompleted ? "border-rose-500/20 bg-rose-50/5" : "border-slate-100 dark:border-slate-800",
                                    isCompleted && "opacity-60 grayscale border-slate-50 dark:border-slate-900 shadow-none"
                                )}
                            >
                                {/* Priority Indicator Bar */}
                                <div className={cn(
                                    "absolute top-0 right-0 w-1 h-full",
                                    task.priority === 'high' ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" : 
                                    task.priority === 'medium' ? "bg-amber-500" : "bg-indigo-400"
                                )}></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {isCompleted && <CheckCircle2 size={16} className="text-emerald-500" />}
                                            <h3 className={cn(
                                                "text-lg font-medium tracking-tight text-slate-800 dark:text-slate-100",
                                                isCompleted && "line-through opacity-50"
                                            )}>
                                                {task.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                            <Calendar size={14} className="text-indigo-500" />
                                            <span>Deadline: {task.dueDate}</span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1.5 text-[9px] font-medium uppercase tracking-widest border",
                                        task.priority === 'high' ? "text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-900/30" : 
                                        task.priority === 'medium' ? "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30" : 
                                        "text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-900/30"
                                    )}>
                                        {task.priority === 'high' ? 'High Priority' : task.priority === 'medium' ? 'Medium' : 'Normal'}
                                    </div>
                                </div>

                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-loose mb-10 line-clamp-3">
                                    {task.description || "لا توجد تفاصيل إضافية لهذا السجل العملياتي..."}
                                </p>

                                {/* Action Console */}
                                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        {task.status !== 'completed' ? (
                                            <button 
                                                onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
                                                className={cn(
                                                    "group flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] transition-all",
                                                    task.status === 'pending' ? "text-indigo-500 hover:text-indigo-600" : "text-emerald-500 hover:text-emerald-600"
                                                )}
                                            >
                                                {task.status === 'pending' ? <Rocket size={16} /> : <CheckCircle2 size={16} />}
                                                {task.status === 'pending' ? 'إطلاق العمل' : 'إغلاق الملف'}
                                                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => updateTaskStatus(task.id, 'pending')}
                                                className="text-[10px] font-medium text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                            >
                                                إعادة فتح السجل
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => deleteTask(task.id)}
                                        className="text-slate-300 hover:text-rose-500 transition-all hover:scale-110"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-none flex items-center justify-center mx-auto mb-6 border border-indigo-100 dark:border-indigo-800">
                            <ClipboardList size={32} className="text-indigo-500" />
                        </div>
                        <h2 className="text-xl font-medium text-slate-800 dark:text-white uppercase tracking-tighter mb-2">السجلات فارغة</h2>
                        <p className="text-[10px] text-slate-400 font-normal uppercase tracking-widest">غرفة العمليات جاهزة لاستقبال مهام جديدة</p>
                    </div>
                )}
            </div>

            {/* ── Premium Add Modal ── */}
            {showAddForm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/60 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-none border-t-8 border-indigo-600 w-full max-w-xl shadow-[20px_20px_0px_rgba(79,70,229,0.1)] overflow-hidden">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center">
                                    <Plus size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-slate-800 dark:text-white uppercase tracking-tighter">إنشاء عملية جديدة</h3>
                                    <p className="text-[9px] text-slate-400 font-normal uppercase tracking-[0.2em]">New Operation Protocol</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                                <span className="text-2xl font-light">×</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddTask} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={12} className="text-indigo-500" /> مسمى العملية
                                    </label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none py-4 px-6 text-sm font-normal text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-600 transition-all"
                                        value={newTask.title}
                                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">مستوى الخطورة</label>
                                        <select 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none py-4 px-6 text-xs font-normal text-slate-800 dark:text-white cursor-pointer"
                                            value={newTask.priority}
                                            onChange={e => setNewTask({...newTask, priority: e.target.value as 'high' | 'medium' | 'low'})}
                                        >
                                            <option value="low">هادئ (Low)</option>
                                            <option value="medium">متوسط (Medium)</option>
                                            <option value="high">عاجل (Critical)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">تاريخ الاستحقاق</label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none py-4 px-6 text-xs font-normal text-slate-800 dark:text-white"
                                            value={newTask.dueDate}
                                            onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={12} className="text-indigo-500" /> تفاصيل البروتوكول
                                    </label>
                                    <textarea 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none py-4 px-6 text-xs font-normal text-slate-800 dark:text-white h-32 resize-none"
                                        value={newTask.description}
                                        onChange={e => setNewTask({...newTask, description: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 font-medium text-xs uppercase tracking-[0.3em] transition-all shadow-sm shadow-indigo-500/20 active:scale-95">
                                تأكيد إطلاق العملية
                            </button>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

