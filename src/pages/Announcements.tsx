import { useState, useEffect } from 'react';
import {
    Megaphone,
    Plus,
    Trash2,
    Edit3,
    AlertTriangle,
    Info,
    Calendar,
    X,
    CheckCircle2,
    ArrowLeftRight
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type AnnouncementType = 'general' | 'urgent' | 'holiday' | 'event';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    date: string;
    isActive: boolean;
}

export const Announcements = () => {
    const { showNotification } = useApp();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        title: string;
        content: string;
        type: AnnouncementType;
        isActive: boolean;
    }>({
        title: '',
        content: '',
        type: 'general',
        isActive: true
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setIsLoading(true);
            const data = await api.get<Announcement[]>('/announcements');
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setAnnouncements([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                date: new Date().toISOString()
            };

            if (editingAnnouncement) {
                await api.put(`/announcements/${editingAnnouncement.id}`, payload);
                showNotification('تم تحديث الإعلان بنجاح', 'success');
            } else {
                await api.post('/announcements', payload);
                showNotification('تم نشر الإعلان بنجاح', 'success');
            }

            setIsModalOpen(false);
            setEditingAnnouncement(null);
            setFormData({ title: '', content: '', type: 'general', isActive: true });
            fetchAnnouncements();
        } catch (error) {
            showNotification('فشل حفظ الإعلان', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        try {
            await api.delete(`/announcements/${id}`);
            showNotification('تم حذف الإعلان', 'success');
            fetchAnnouncements();
        } catch (error) {
            showNotification('فشل حذف الإعلان', 'error');
        }
    };

    const openEdit = (ann: Announcement) => {
        setEditingAnnouncement(ann);
        setFormData({
            title: ann.title,
            content: ann.content,
            type: ann.type,
            isActive: ann.isActive
        });
        setIsModalOpen(true);
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'urgent': return { 
                icon: AlertTriangle, 
                color: 'text-rose-600', 
                bg: 'bg-rose-50 dark:bg-rose-950/20', 
                border: 'border-rose-600',
                shadow: 'shadow-[8px_8px_0px_0px_rgba(225,29,72,1)]',
                label: 'تنبيـه عاجـل' 
            };
            case 'holiday': return { 
                icon: Calendar, 
                color: 'text-amber-600', 
                bg: 'bg-amber-50 dark:bg-amber-950/20', 
                border: 'border-amber-500',
                shadow: 'shadow-[8px_8px_0px_0px_rgba(245,158,11,1)]',
                label: 'إجـازة رسميـة' 
            };
            case 'event': return { 
                icon: Megaphone, 
                color: 'text-indigo-600', 
                bg: 'bg-indigo-50 dark:bg-indigo-950/20', 
                border: 'border-indigo-600',
                shadow: 'shadow-[8px_8px_0px_0px_rgba(79,70,229,1)]',
                label: 'فعاليـة جديـدة' 
            };
            default: return { 
                icon: Info, 
                color: 'text-primary-600', 
                bg: 'bg-blue-50 dark:bg-blue-950/20', 
                border: 'border-primary-600',
                shadow: 'shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]',
                label: 'إعـلان عـام' 
            };
        }
    };

    return (
        <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-2 duration-700" dir="rtl">
            
            {/* ═══════════════ PREMIUM ANNOUNCEMENTS HEADER ═══════════════ */}
            <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 lg:p-10 shadow-2xl shadow-indigo-500/10 border-l border-t border-white/10">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 p-0.5 shadow-lg">
                            <div className="w-full h-full bg-slate-900/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <Megaphone size={32} className="text-white" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest border border-white/10 italic">وحدة التحكم المركزية</span>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-emerald-500 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tight uppercase">النشرة الإخبارية والتعميمات</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="bg-white/5 border border-white/10 px-5 py-3 flex items-center gap-4 backdrop-blur-xl">
                            <span className="text-2xl font-black text-white leading-none">{announcements.filter(a => a.isActive).length}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none border-r border-white/10 pr-4">إعلانات نشطة<br/>بالمنصـة</span>
                        </div>
                        <button
                            onClick={() => {
                                setEditingAnnouncement(null);
                                setFormData({ title: '', content: '', type: 'general', isActive: true });
                                setIsModalOpen(true);
                            }}
                            className="bg-primary-600 text-white h-14 px-8 flex items-center justify-center gap-3 hover:bg-white hover:text-primary-600 transition-all font-black shadow-lg shadow-primary-500/20 group"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                            <span className="text-[11px] uppercase tracking-[0.2em] font-black">إصدار تعميم جديد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════════ ANNOUNCEMENTS GRID ═══════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announcements.map((ann) => {
                    const styles = getTypeStyles(ann.type);
                    return (
                        <div 
                            key={ann.id} 
                            className={cn(
                                "group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative flex flex-col",
                                !ann.isActive && "opacity-60 grayscale border-dashed"
                            )}
                        >
                            <div className={cn("absolute top-0 right-0 w-1 h-12 bg-gradient-to-b", ann.type === 'urgent' ? 'from-rose-500' : 'from-primary-600')} />

                            <div className="flex-1 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors", styles.color)}>
                                            <styles.icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <span className={cn("text-[8px] font-black uppercase tracking-widest italic block mb-0.5", styles.color)}>{styles.label}</span>
                                            <p className="font-bold text-[10px] uppercase text-slate-400">{format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => openEdit(ann)}
                                            className="w-8 h-8 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ann.id)}
                                            className="w-8 h-8 bg-slate-50 dark:bg-slate-800 text-rose-600 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight italic tracking-tight uppercase group-hover:text-primary-600 transition-colors">{ann.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-xs leading-relaxed line-clamp-4 border-r-2 border-slate-100 dark:border-slate-800 pr-4 italic">
                                        {ann.content}
                                    </p>
                                </div>
                            </div>

                            {/* Status Footer */}
                            {!ann.isActive && (
                                <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                                    <span className="text-[8px] font-black text-amber-600 dark:text-amber-500 uppercase italic flex items-center gap-2">
                                        <Info size={12} /> مسودة قيد المراجعة
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {announcements.length === 0 && !isLoading && (
                    <div className="col-span-full py-24 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center opacity-30 text-center">
                        <ArrowLeftRight size={48} className="mb-4 text-slate-400" />
                        <h3 className="text-xl font-black uppercase italic tracking-widest text-slate-500">سجل الإعلانات فارغ</h3>
                    </div>
                )}
            </div>

            {/* ═══════════════ PREMIUM EDIT MODAL ═══════════════ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-white/10 shadow-2xl overflow-hidden rounded-none">
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <Megaphone className="text-primary-500" size={20} />
                                <h3 className="font-black text-sm uppercase italic tracking-tight">
                                    {editingAnnouncement ? 'تحديث البيانات المركزية' : 'إصدار تعميم إداري جديد'}
                                </h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-rose-500 transition-all"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">اسم التعميم / العنوان</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none font-black text-sm outline-none focus:ring-2 ring-primary-500 transition-all rounded-none dark:text-white"
                                    placeholder="أدخل عنوان الإعلان..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">تصنيف البيانات</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none font-black text-[11px] uppercase outline-none focus:ring-2 ring-primary-500 transition-all cursor-pointer rounded-none dark:text-white"
                                    >
                                        <option value="general">إعـلان عـام</option>
                                        <option value="urgent">تنبيـه عـاجل</option>
                                        <option value="holiday">إجـازة رسميـة</option>
                                        <option value="event">فعاليـة جديـدة</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">حالة النشر</label>
                                    <div className="flex gap-1 h-[52px]">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: true})}
                                            className={cn(
                                                "flex-1 font-black text-[9px] uppercase transition-all",
                                                formData.isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}
                                        >
                                            نشر فوري
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: false})}
                                            className={cn(
                                                "flex-1 font-black text-[9px] uppercase transition-all",
                                                !formData.isActive ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}
                                        >
                                            حفـظ مسودة
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">محتوى التعميم التفصيلي</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none font-medium text-sm resize-none outline-none focus:ring-2 ring-primary-500 transition-all leading-relaxed italic dark:text-white"
                                    placeholder="اكتب تفاصيل الإعلان هنا..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-slate-900 dark:bg-primary-600 text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black dark:hover:bg-primary-500 transition-all shadow-xl flex items-center justify-center gap-4"
                            >
                                <CheckCircle2 size={20} />
                                {editingAnnouncement ? 'تحديث السجلات' : 'بث الإعلان للمنصة'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

};
