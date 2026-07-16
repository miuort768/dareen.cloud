import { useState, useEffect, useMemo } from 'react';
import {
    AlertCircle,
    CheckCircle2, 
    Plus, 
    Trash2, 
    Calendar,
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
import { StatCard } from '../shared/components/ui';
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
        <div className="min-h-full pb-6 relative bg-surface" dir="rtl">
            <div className="max-w-page mx-auto px-3 space-y-4">

                {/* Hero */}
                <div className="bg-card rounded-card shadow-sm border border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
                        <div className="flex flex-col items-start">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-soft dark:bg-primary-soft border border-primary-light dark:border-primary-light rounded-card mb-3">
                                <Sparkles size={10} className="text-primary dark:text-primary" />
                                <span className="text-micro font-bold text-primary dark:text-inverse">مركز القيادة</span>
                            </div>
                            <h1 className="text-xl font-black text-main dark:text-inverse leading-tight mb-1">
                                مركز التحكم بالمهام
                            </h1>
                            <p className="text-xs font-bold text-dim dark:text-muted">
                                تتبع وإدارة جميع المهام الخاصة بك <span className="text-primary dark:text-primary">في مكان واحد</span>
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="group relative inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-on-primary px-5 py-2.5 font-bold text-micro uppercase tracking-widest transition-all hover:shadow-md active:scale-[0.97] rounded-card shadow-sm"
                        >
                            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                            إضافة مهمة جديدة
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard title="مهام معلقة" value={stats.pending} icon={AlertCircle} variant="warning" />
                    <StatCard title="قيد التنفيذ" value={stats.inProgress} icon={RefreshCcw} variant="primary" />
                    <StatCard title="نسبة الإنجاز" value={`${stats.score}%`} icon={TrendingUp} variant="success" />
                    <StatCard title="تم الإنجاز" value={stats.completed} icon={CheckCircle2} variant="info" />
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
                        <input
                            type="text"
                            placeholder="ابحث عن مهمة..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-card border border-border rounded-card py-3 px-4 ps-10 text-xs font-bold text-main focus:outline-none focus:border-primary transition-all placeholder:text-muted shadow-sm"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-2 w-full md:flex md:w-auto">
                        {['all', 'high', 'medium', 'low'].map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterPriority(p as 'high' | 'medium' | 'low' | 'all')}
                                className={cn(
                                    "px-4 py-2.5 font-bold text-micro uppercase tracking-wider transition-all whitespace-nowrap rounded-card border shadow-sm",
                                    filterPriority === p
                                        ? "bg-primary border-primary text-on-primary shadow-sm"
                                        : "bg-card border-border text-dim hover:border-primary hover:text-primary"
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
                                ? { text: 'عالية', colors: 'text-error-dark dark:text-error bg-error-soft border-error' }
                                : task.priority === 'medium'
                                ? { text: 'متوسطة', colors: 'text-warning-dark dark:text-warning bg-warning-soft border-warning' }
                                : { text: 'منخفضة', colors: 'text-primary bg-primary-soft border-primary' };

                            return (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "bg-card rounded-card p-5 shadow-sm transition-all hover:shadow-md relative",
                                        isCompleted && "opacity-60",
                                        task.priority === 'high' ? "border-s-4 border-s-error" : task.priority === 'medium' ? "border-s-4 border-s-warning" : "border-s-4 border-s-primary"
                                    )}
                                >
                                    {!isCompleted && (
                                        <div className={cn(
                                            "absolute top-0 end-0 w-24 h-24 -translate-x-12 -translate-y-12 opacity-5",
                                            task.priority === 'high' ? "bg-error" : task.priority === 'medium' ? "bg-warning" : "bg-primary"
                                        )} />
                                    )}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {isCompleted && <CheckCircle2 size={14} className="text-success shrink-0" />}
                                                <h3 className={cn(
                                                    "text-sm font-bold text-main dark:text-inverse leading-tight",
                                                    isCompleted && "line-through opacity-50"
                                                )}>
                                                    {task.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={11} className="text-muted" />
                                                <span className="text-micro font-bold text-muted uppercase tracking-wider">الموعد: {task.dueDate}</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2.5 py-1 text-micro font-bold uppercase tracking-wider rounded-card border shrink-0",
                                            priorityBadge.colors
                                        )}>
                                            {priorityBadge.text}
                                        </div>
                                    </div>

                                    <p className="text-dim dark:text-muted text-xs font-medium leading-relaxed mb-4 line-clamp-2">
                                        {task.description || "لا يوجد وصف إضافي لهذه المهمة..."}
                                    </p>

                                    <div className="pt-3 border-t border-border dark:border-border flex items-center justify-between">
                                        <div className="flex gap-2">
                                            {task.status !== 'completed' ? (
                                                <button
                                                    onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1.5 text-micro font-bold uppercase tracking-wider rounded-card border transition-all shadow-sm",
                                                        task.status === 'pending'
                                                            ? "text-primary border-primary bg-primary-soft hover:bg-primary-soft"
                                                            : "text-success-dark dark:text-success border-success bg-success-soft hover:bg-success-soft"
                                                    )}
                                                >
                                                    {task.status === 'pending' ? <Rocket size={12} /> : <CheckCircle2 size={12} />}
                                                    {task.status === 'pending' ? 'بدء التنفيذ' : 'اكتملت'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => updateTaskStatus(task.id, 'pending')}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-micro font-bold text-muted uppercase tracking-wider hover:text-dim dark:hover:text-dim transition-colors"
                                                >
                                                    <RefreshCcw size={12} />
                                                    إعادة
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-error bg-error-soft hover:bg-error-soft transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-14 text-center bg-card border border-border rounded-card shadow-sm">
                            <div className="w-16 h-16 bg-primary rounded-card flex items-center justify-center mx-auto mb-4 shadow-soft">
                                <ClipboardList size={24} className="text-on-primary" />
                            </div>
                            <h2 className="text-base font-black text-main mb-1">قائمة المهام</h2>
                            <p className="text-micro font-bold text-primary uppercase tracking-wider">لم يتم العثور على مهام تطابق معايير البحث</p>
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-300">
                        <div className="bg-card rounded-card w-full max-w-lg shadow-soft overflow-hidden border border-border">
                            <div className="p-5 border-b border-border flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-primary rounded-card flex items-center justify-center shadow-sm">
                                        <Plus size={16} className="text-on-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-main dark:text-inverse">إنشاء مهمة جديدة</h3>
                                        <p className="text-micro font-bold text-muted uppercase tracking-wider">إضافة مهمة إلى القائمة</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAddForm(false)}                                     className="p-3 bg-error rounded-card text-on-error hover:bg-error-hover transition-colors">
                                    <X size={22} />
                                </button>
                            </div>

                            <form onSubmit={handleAddTask} className="p-5 space-y-4">
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-micro font-bold text-dim dark:text-muted uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles size={10} className="text-primary" /> عنوان المهمة
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-background dark:bg-background border border-border rounded-2xl py-2.5 px-4 text-xs font-bold text-main dark:text-inverse focus:outline-none focus:ring-2 focus:ring-focus transition-all"
                                            value={newTask.title}
                                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-micro font-bold text-dim dark:text-muted uppercase tracking-wider">درجة الأولوية</label>
                                            <div className="relative">
                                                <ChevronDown size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                                <select
                                                    className="appearance-none w-full bg-background border border-border rounded-card py-2.5 ps-8 pe-4 text-xs font-bold text-main cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus"
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
                                            <label className="text-micro font-bold text-dim dark:text-muted uppercase tracking-wider">تاريخ التسليم</label>
                                            <input
                                                type="date"
                                                className="w-full bg-background border border-border rounded-card py-2.5 px-4 text-xs font-bold text-main focus:outline-none focus:ring-2 focus:ring-focus"
                                                value={newTask.dueDate}
                                                onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-micro font-bold text-dim dark:text-muted uppercase tracking-wider flex items-center gap-1.5">
                                            <ShieldCheck size={10} className="text-primary" /> وصف المهمة
                                        </label>
                                        <textarea
                                            className="w-full bg-background border border-border rounded-card py-2.5 px-4 text-xs font-bold text-main h-24 resize-none focus:outline-none focus:ring-2 focus:ring-focus"
                                            value={newTask.description}
                                            onChange={e => setNewTask({...newTask, description: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-on-primary py-3 font-bold text-xs uppercase tracking-wider transition-all rounded-card shadow-sm active:scale-[0.98]">
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
