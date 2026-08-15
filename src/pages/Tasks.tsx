import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Plus, Search, RefreshCcw, TrendingUp, ListTodo, Clock, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { StatCard } from '../shared/components/ui';
import { api, safeArray } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { useCurrentUser, useLogout, useAcademyName } from '../context/AppContext';
import { PageLoader } from '../components/ui/PageLoader';
import { TaskCard, EmptyTaskState } from './TaskCard';
import { TaskFormModal } from './TaskFormModal';
import { TeacherDashboardHeader } from './TeacherDashboardHeader';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    category?: string;
}

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const Tasks = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `المهام | ${academyName}`; }, [academyName]);
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [fabOpen, setFabOpen] = useState(false);

    const queryClient = useQueryClient();
    const { data: tasks = [], isLoading: loading } = useQuery<Task[]>({
        queryKey: ['tasks'],
        queryFn: () => api.get<Task[]>('/tasks'),
        select: (data) => safeArray<Task>(data).map(t => ({ ...t, status: t.status || 'pending' })),
    });

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
            await api.post<Task>('/tasks', { ...newTask, status: 'pending' });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setShowAddForm(false);
            setNewTask({ title: '', description: '', priority: 'medium', dueDate: new Date().toISOString().split('T')[0], category: 'عام' });
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const updateTaskStatus = async (id: string, newStatus: Task['status']) => {
        try {
            await api.patch(`/tasks/${id}`, { status: newStatus });
            queryClient.setQueryData<Task[]>(['tasks'], (old) =>
                (old || []).map(t => t.id === id ? { ...t, status: newStatus } : t)
            );
        } catch (error) {
            console.error("Error updating status:", error);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    };

    const deleteTask = async (id: string) => {
        if (!await confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
        try {
            await api.delete(`/tasks/${id}`);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
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

    const kpiCards = useMemo(() => [
        { label: 'إجمالي المهام', value: stats.total, icon: ListTodo, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'معلقة', value: stats.pending, icon: Clock, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'قيد التنفيذ', value: stats.inProgress, icon: RefreshCcw, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
        { label: 'تم الإنجاز', value: stats.completed, icon: CheckCircle2, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
    ], [stats.total, stats.pending, stats.inProgress, stats.completed]);

    const fabActions = useMemo(() => [
        { icon: Plus, label: 'مهمة جديدة', onClick: () => setShowAddForm(true) },
        { icon: Filter, label: 'تصفية', onClick: () => setFilterPriority(filterPriority === 'all' ? 'high' : 'all') },
        { icon: TrendingUp, label: 'نسبة الإنجاز', onClick: () => document.querySelector('[data-stats]')?.scrollIntoView({ behavior: 'smooth' }) },
        { icon: Trash2, label: 'حذف الكل', onClick: async () => { if (await confirm('هل أنت متأكد من حذف جميع المهام؟')) { const taskIds = tasks.map(t => t.id); for (const id of taskIds) await deleteTask(id); } } },
    ], [filterPriority, tasks, deleteTask]);

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-full pb-24 relative bg-background" dir="rtl">
            {currentUser?.role === 'teacher' && (
                <div className="hidden md:block">
                    <TeacherDashboardHeader logout={logout} />
                </div>
            )}
            <div className="max-w-page mx-auto px-3 space-y-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><ListTodo className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">الإدارة</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-on-primary mb-1">المهام والطلبات</h1>
                            <p className="text-white/70 text-sm">إدارة وتكليف المهام للمعلمات</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">نسبة الإنجاز</p>
                                <p className="text-2xl font-bold text-white">{stats.score}%</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">المهام</p>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} data-stats>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard title="مهام معلقة" value={stats.pending} icon={AlertCircle} variant="warning" />
                        <StatCard title="قيد التنفيذ" value={stats.inProgress} icon={RefreshCcw} variant="primary" />
                        <StatCard title="نسبة الإنجاز" value={`${stats.score}%`} icon={TrendingUp} variant="success" />
                        <StatCard title="تم الإنجاز" value={stats.completed} icon={CheckCircle2} variant="info" />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
                            <input type="text" aria-label="بحث عن مهمة" placeholder="ابحث عن مهمة..." value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-card border border-border rounded-card py-3 px-4 ps-10 text-xs font-bold text-main focus:outline-none focus:border-primary transition-all placeholder:text-muted shadow-sm" />
                        </div>
                        <div className="flex overflow-x-auto no-scrollbar gap-2 w-full md:flex md:w-auto">
                            {/* Filter buttons removed per design system v1.2 */}
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task, idx) => (
                                <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * idx }}>
                                    <TaskCard task={task} onUpdateStatus={updateTaskStatus} onDelete={deleteTask} />
                                </motion.div>
                            ))
                        ) : (
                            <EmptyTaskState />
                        )}
                    </div>
                </motion.div>

                {showAddForm && (
                    <TaskFormModal data={newTask} onChange={setNewTask} onSubmit={handleAddTask} onClose={() => setShowAddForm(false)} />
                )}
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-lg bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
<motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className={cn("w-12 h-12 rounded-lg shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                        <Plus size={24} />
                </motion.button>
            </div>
        </div>
    );
};
