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
    LayoutGrid,
    Clock,
    User,
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
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-700" dir="rtl">
            {/* Brutalist Hero Header - COMPACT */}
            <div className="relative bg-gray-950 p-6 shadow-[10px_10px_0px_0px_rgba(37,99,235,0.2)] overflow-hidden border-4 border-gray-950">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:15px_15px]"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-600 text-white flex items-center justify-center border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] rotate-2">
                            <Megaphone size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">النشرة الإخبارية</h1>
                            <p className="text-primary-400 font-extrabold text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-ping"></span>
                                مراقبة الإعلانات المركزية
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-white/5 border-2 border-white/10 px-4 py-2 flex items-center gap-3">
                            <span className="text-xl font-black text-white">{announcements.filter(a => a.isActive).length}</span>
                            <span className="text-[8px] font-black text-gray-500 uppercase">إعلان نشط</span>
                        </div>
                        <button
                            onClick={() => {
                                setEditingAnnouncement(null);
                                setFormData({ title: '', content: '', type: 'general', isActive: true });
                                setIsModalOpen(true);
                            }}
                            className="bg-primary-600 text-white px-6 py-3 flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all font-black shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none h-14 group"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                            <span className="text-[10px] uppercase tracking-widest font-black">إصدار تعميم</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Announcements Grid - News Board Style - COMPACT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announcements.map((ann) => {
                    const styles = getTypeStyles(ann.type);
                    return (
                        <div 
                            key={ann.id} 
                            className={cn(
                                "group bg-white dark:bg-gray-900 border-4 border-gray-950 p-6 transition-all hover:-translate-y-1 relative flex flex-col min-h-[280px]",
                                styles.shadow.replace('8px_8px', '6px_6px'),
                                !ann.isActive && "opacity-60 grayscale border-dashed"
                            )}
                        >
                            {/* Type Badge - Smaller */}
                            <div className={cn("absolute -top-3.5 right-4 px-3 py-1 border-2 border-gray-950 font-black text-[8px] uppercase tracking-widest z-10 shadow-[2px_2px_0px_0px_black]", styles.bg, styles.color)}>
                                {styles.label}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-8 h-8 flex items-center justify-center border-2 border-gray-950", styles.bg, styles.color)}>
                                            <styles.icon size={16} />
                                        </div>
                                        <p className="font-black text-[9px] uppercase italic text-gray-400 tracking-tight">{format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}</p>
                                    </div>
                                    <h3 className="text-lg font-black text-gray-950 dark:text-white leading-tight uppercase line-clamp-2">{ann.title}</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-bold text-xs leading-relaxed line-clamp-4 italic border-r-2 border-gray-100 dark:border-gray-800 pr-3">
                                    {ann.content}
                                </p>
                            </div>

                            {/* Action Footer - Compact */}
                            <div className="mt-6 pt-4 border-t-2 border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => openEdit(ann)}
                                        className="w-8 h-8 bg-gray-50 text-gray-600 flex items-center justify-center border-2 border-gray-950 hover:bg-primary-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(ann.id)}
                                        className="w-8 h-8 bg-white text-rose-600 flex items-center justify-center border-2 border-gray-950 hover:bg-rose-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(225,29,72,0.2)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                {!ann.isActive && <span className="text-[7px] font-black text-amber-600 uppercase italic">Draft</span>}
                            </div>
                        </div>
                    );
                })}

                {announcements.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 border-4 border-gray-100 dark:border-gray-800 border-dashed flex flex-col items-center justify-center opacity-30 text-center">
                        <ArrowLeftRight size={40} className="mb-4" />
                        <h3 className="text-xl font-black uppercase italic tracking-widest">فارغ</h3>
                    </div>
                )}
            </div>

            {/* Premium Create/Edit Modal - COMPACT */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-in fade-in">
                    <div className="relative w-full max-w-lg bg-white dark:bg-gray-950 border-4 border-gray-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-6 bg-gray-950 text-white flex items-center justify-between border-b-4 border-gray-950">
                            <h3 className="font-black text-sm uppercase italic">
                                {editingAnnouncement ? 'تحديث التعميم' : 'إصدار تعميم جديد'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:text-rose-500 transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic tracking-widest flex items-center gap-2"><LayoutGrid size={12}/> العنوان (Title)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-950 font-black text-sm outline-none focus:bg-white focus:border-primary-600 transition-all"
                                    placeholder="العنوان السريع..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">الفئة</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-950 font-black text-[10px] uppercase outline-none focus:bg-white focus:border-primary-600 transition-all cursor-pointer"
                                    >
                                        <option value="general">عام</option>
                                        <option value="urgent">عاجل</option>
                                        <option value="holiday">إجازة</option>
                                        <option value="event">فعالية</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">الحالة</label>
                                    <div className="flex gap-2 h-[46px]">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: true})}
                                            className={cn(
                                                "flex-1 border-2 border-gray-950 font-black text-[8px] uppercase transition-all shadow-[2px_2px_0px_0px_black]",
                                                formData.isActive ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-300"
                                            )}
                                        >
                                            نشـط
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: false})}
                                            className={cn(
                                                "flex-1 border-2 border-gray-950 font-black text-[8px] uppercase transition-all shadow-[2px_2px_0px_0px_black]",
                                                !formData.isActive ? "bg-amber-500 text-white" : "bg-gray-50 text-gray-300"
                                            )}
                                        >
                                            مسـودة
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2"><Edit3 size={12}/> المحتوى</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-950 font-bold text-[11px] resize-none outline-none focus:bg-white focus:border-primary-600 transition-all leading-relaxed italic"
                                    placeholder="اكتب تفاصيل الإعلان هنا..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 size={18} />
                                {editingAnnouncement ? 'تحديث' : 'بث الإعلان'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

};
