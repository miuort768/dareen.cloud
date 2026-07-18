import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Plus, Trash2, Search, RefreshCcw, TrendingUp } from 'lucide-react';
import { StatCard } from '../shared/components/ui';
import { api } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { PageLoader } from '../components/ui/PageLoader';
import { TaskCard, EmptyTaskState } from './TaskCard';
import { TaskFormModal } from './TaskFormModal';

export interface Task {
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
                            aria-label="بحث عن مهمة"
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
                        filteredTasks.map(task => (
                            <TaskCard key={task.id} task={task} onUpdateStatus={updateTaskStatus} onDelete={deleteTask} />
                        ))
                    ) : (
                        <EmptyTaskState />
                    )}
                </div>

                {showAddForm && (
                    <TaskFormModal data={newTask} onChange={setNewTask} onSubmit={handleAddTask} onClose={() => setShowAddForm(false)} />
                )}
            </div>
        </div>
    );
};
