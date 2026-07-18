import { Plus, X, Sparkles, ShieldCheck, ChevronDown } from 'lucide-react';

interface TaskFormData {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    category: string;
}

interface TaskFormModalProps {
    data: TaskFormData;
    onChange: (data: TaskFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

export const TaskFormModal = ({ data, onChange, onSubmit, onClose }: TaskFormModalProps) => (
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
                <button onClick={onClose} className="p-3 bg-error rounded-card text-on-error hover:bg-error-hover transition-colors">
                    <X size={22} />
                </button>
            </div>

            <form onSubmit={onSubmit} className="p-5 space-y-4">
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-micro font-bold text-dim dark:text-muted uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={10} className="text-primary" /> عنوان المهمة
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full bg-background dark:bg-background border border-border rounded-2xl py-2.5 px-4 text-xs font-bold text-main dark:text-inverse focus:outline-none focus:ring-2 focus:ring-focus transition-all"
                            value={data.title}
                            onChange={e => onChange({...data, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-micro font-bold text-dim dark:text-muted uppercase tracking-wider">درجة الأولوية</label>
                            <div className="relative">
                                <ChevronDown size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                <select
                                    className="appearance-none w-full bg-background border border-border rounded-card py-2.5 ps-8 pe-4 text-xs font-bold text-main cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus"
                                    aria-label="درجة الأولوية"
                                    value={data.priority}
                                    onChange={e => onChange({...data, priority: e.target.value as 'high' | 'medium' | 'low'})}
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
                                value={data.dueDate}
                                onChange={e => onChange({...data, dueDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-micro font-bold text-dim dark:text-muted uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck size={10} className="text-primary" /> وصف المهمة
                        </label>
                        <textarea
                            className="w-full bg-background border border-border rounded-card py-2.5 px-4 text-xs font-bold text-main h-24 resize-none focus:outline-none focus:ring-2 focus:ring-focus"
                            value={data.description}
                            onChange={e => onChange({...data, description: e.target.value})}
                        ></textarea>
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-on-primary py-3 font-bold text-xs uppercase tracking-wider transition-all rounded-card shadow-sm active:scale-[0.98]">
                    إنشاء مهمة جديدة
                </button>
            </form>
        </div>
    </div>
);
