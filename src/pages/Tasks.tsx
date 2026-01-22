import { useState, useEffect } from 'react';
import {
    CheckCircle2, Circle, Plus, Trash2, Calendar,
    AlertCircle, ListTodo, Clock, X
} from 'lucide-react';
import { StatsCard } from '../shared/components/StatsCard';
import { api } from '../lib/api';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
}

export const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchTasks = async () => {
        try {
            const data = await api.get<Task[]>('/tasks');
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
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
    }>({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
    });

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const addedTask = await api.post<Task>('/tasks', newTask);
            setTasks([addedTask, ...tasks]);
            setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0]
            });
            setShowAddForm(false);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newStatus = task.status === 'pending' ? 'completed' : 'pending';
        try {
            await api.patch(`/tasks/${id}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    };

    const deleteTask = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div className="space-y-6 pb-32">
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500 rounded-none">
                {/* Background Geometric Enhancement - Richer & Larger Shapes */}
                {/* Major Glows & Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-20 -mt-40 blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full -ml-40 -mb-60 blur-[150px] pointer-events-none"></div>

                {/* Central Geometric elements */}
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"></div>

                {/* Large Structural Shapes */}
                <div className="absolute top-[-20%] left-[-5%] w-[35%] h-[140%] bg-gradient-to-br from-white/5 to-transparent rotate-12 pointer-events-none hidden lg:block"></div>
                <div className="absolute top-[-30%] right-[15%] w-[120px] h-[160%] bg-white/5 -rotate-12 pointer-events-none hidden lg:block"></div>

                {/* Large Geometric Outlines */}
                <div className="absolute top-1/2 right-10 w-80 h-80 border-[30px] border-white/5 rounded-full -translate-y-1/2 pointer-events-none"></div>

                {/* Pattern Layer */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}></div>

                <div className="relative z-10 flex items-center justify-between flex-wrap gap-6 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                            <ListTodo size={36} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">إدارة المهام والطلبات</h1>
                            <p className="text-white/80 text-[10px] md:text-sm font-bold flex items-center gap-2">
                                <Clock size={14} className="text-white" />
                                تنظيم العمليات الإدارية والمتابعة اليومية
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-white text-primary-700 px-8 py-3 rounded-none flex items-center gap-3 hover:bg-white/95 active:bg-primary-50 transition-all font-black shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 active:translate-y-0 h-14"
                    >
                        <Plus size={20} />
                        <span>إضافة مهمة جديدة</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="مهام معلقة" value={pendingTasks.length} icon={Clock} color="amber" />
                <StatsCard title="مهام مكتملة" value={completedTasks.length} icon={CheckCircle2} color="emerald" />
                <StatsCard title="إجمالي المهام" value={tasks.length} icon={ListTodo} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-8 h-[1px] bg-primary-200"></div>
                        قائمة المهام النشطة
                    </h3>

                    {pendingTasks.length > 0 ? (
                        pendingTasks.map(task => (
                            <div key={task.id} className="bg-white border-r-4 border-amber-500 p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow group rounded-none">
                                <button onClick={() => toggleTask(task.id)} className="text-gray-300 hover:text-emerald-500 transition-colors">
                                    <Circle size={24} />
                                </button>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-black text-gray-900">{task.title}</h4>
                                        <span className={`text-[9px] font-black px-2 py-0.5 uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                            task.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                                                'bg-blue-100 text-blue-600'
                                            } `}>
                                            {task.priority === 'high' ? 'هام جداً' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold">{task.description}</p>
                                    <div className="flex items-center gap-4 mt-3 text-[10px] font-black text-gray-400 uppercase">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {task.dueDate}</span>
                                        <span className="flex items-center gap-1"><AlertCircle size={12} /> {task.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}</span>
                                    </div>
                                </div>
                                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 text-center rounded-none">
                            <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-200" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">أنت مجتهد! لا توجد مهام معلقة حالياً</p>
                        </div>
                    )}

                    {completedTasks.length > 0 && (
                        <div className="pt-8 space-y-4">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-8 h-[1px] bg-gray-200"></div>
                                المهام المكتملة
                            </h3>
                            {completedTasks.map(task => (
                                <div key={task.id} className="bg-gray-50/50 border-r-4 border-emerald-500 p-4 flex items-center gap-5 opacity-60 rounded-none group transition-all hover:opacity-100">
                                    <button onClick={() => toggleTask(task.id)} className="text-emerald-500 hover:text-gray-400 transition-colors">
                                        <CheckCircle2 size={24} />
                                    </button>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 line-through text-sm">{task.title}</h4>
                                    </div>
                                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-rose-600 text-white p-6 shadow-xl relative overflow-hidden rounded-none">
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <h4 className="font-black text-sm uppercase mb-4 flex items-center gap-2">
                            <AlertCircle size={18} /> تنبيه هام
                        </h4>
                        <p className="text-xs font-bold leading-relaxed opacity-90">
                            {pendingTasks.filter(t => t.priority === 'high').length > 0
                                ? `لديك ${pendingTasks.filter(t => t.priority === 'high').length} مهام ذات أولوية عالية ("هام جداً") تتطلب اهتمامك الفوري.`
                                : 'ممتاز! لا توجد مهام عاجلة حالياً، يمكنك التركيز على المهام المجدولة.'}
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-none">
                        <h4 className="font-black text-gray-900 text-xs uppercase mb-4 tracking-widest">إحصائيات الإنجاز</h4>
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-4xl font-black text-primary-600">{tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase mb-2">نسبة الاكتمال</span>
                        </div>
                        <div className="h-2 bg-gray-100 mb-6 overflow-hidden">
                            <div
                                className="h-full bg-primary-600 transition-all duration-1000"
                                style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Task Modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg shadow-2xl border-t-8 border-primary-600 animate-in zoom-in-95 rounded-none">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase">إضافة مهمة جديدة</h3>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddTask} className="p-8 space-y-5 text-right">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">عنوان المهمة</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 text-sm font-bold focus:ring-2 ring-primary-600 outline-none rounded-none"
                                    placeholder="مثال: مراجعة حسابات المعلمة منى"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الوصف</label>
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 text-sm font-bold h-24 resize-none focus:ring-2 ring-primary-600 outline-none rounded-none"
                                    placeholder="تفاصيل إضافية للمهمة..."
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الأولوية</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 text-sm font-bold focus:ring-2 ring-primary-600 outline-none appearance-none rounded-none"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                    >
                                        <option value="low">عادية</option>
                                        <option value="medium">متوسطة</option>
                                        <option value="high">هام جداً</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ الاستحقاق</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 text-sm font-bold focus:ring-2 ring-primary-600 outline-none rounded-none"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary-600 text-white font-black py-4 uppercase tracking-widest hover:bg-primary-700 shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 rounded-none">
                                <CheckCircle2 size={20} />
                                حفظ المهمة الآن
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
