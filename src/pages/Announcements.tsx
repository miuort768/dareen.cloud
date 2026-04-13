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
        <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700" dir="rtl">
            {/* Brutalist Hero Header */}
            <div className="relative bg-gray-950 p-10 shadow-[16px_16px_0px_0px_rgba(37,99,235,0.2)] overflow-hidden border-4 border-gray-950">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-primary-600 text-white flex items-center justify-center border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] rotate-3">
                            <Megaphone size={48} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">النشرة الإخبارية</h1>
                            <p className="text-primary-400 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <span className="w-2 h-2 bg-primary-500 rounded-full animate-ping"></span>
                                منصة التحكم في الإعلانات المركزية
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="bg-white/5 border-2 border-white/10 p-4 flex flex-col items-center justify-center min-w-[140px]">
                            <span className="text-3xl font-black text-white leading-none">{announcements.filter(a => a.isActive).length}</span>
                            <span className="text-[10px] font-black text-gray-500 uppercase mt-2">إعلان نشط</span>
                        </div>
                        <button
                            onClick={() => {
                                setEditingAnnouncement(null);
                                setFormData({ title: '', content: '', type: 'general', isActive: true });
                                setIsModalOpen(true);
                            }}
                            className="bg-primary-600 text-white px-10 py-5 flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all font-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none h-20 group"
                        >
                            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                            <span className="text-sm uppercase tracking-widest">إصدار تعميم جديد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Announcements Grid - News Board Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {announcements.map((ann) => {
                    const styles = getTypeStyles(ann.type);
                    return (
                        <div 
                            key={ann.id} 
                            className={cn(
                                "group bg-white dark:bg-gray-900 border-4 border-gray-950 p-8 transition-all hover:-translate-y-2 relative flex flex-col min-h-[400px]",
                                styles.shadow,
                                !ann.isActive && "opacity-60 grayscale border-dashed"
                            )}
                        >
                            {/* Type Badge */}
                            <div className={cn("absolute -top-5 right-6 px-4 py-2 border-4 border-gray-950 font-black text-[10px] uppercase tracking-widest z-10", styles.bg, styles.color)}>
                                {styles.label}
                            </div>

                            {!ann.isActive && (
                                <div className="absolute top-4 left-4 text-[10px] font-black text-gray-400 uppercase italic flex items-center gap-1">
                                    <Clock size={12} /> Draft Mode
                                </div>
                            )}

                            <div className="flex-1 space-y-6 mt-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-12 h-12 flex items-center justify-center border-4 border-gray-950", styles.bg, styles.color)}>
                                            <styles.icon size={24} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">تاريخ النشر</p>
                                            <p className="font-black text-xs uppercase italic">{format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-950 dark:text-white leading-tight uppercase mt-6">{ann.title}</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-bold text-sm leading-relaxed line-clamp-6 italic">
                                    "{ann.content}"
                                </p>
                            </div>

                            {/* Action Footer */}
                            <div className="mt-8 pt-6 border-t-4 border-gray-950 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => openEdit(ann)}
                                        className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-gray-950 hover:bg-primary-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(ann.id)}
                                        className="w-10 h-10 bg-white text-rose-600 flex items-center justify-center border-2 border-gray-950 hover:bg-rose-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(225,29,72,0.1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase italic flex items-center gap-2">
                                    <User size={12} /> Super_Admin_Entry
                                </div>
                            </div>

                            <div className={cn("absolute bottom-0 left-0 w-2 h-0 group-hover:h-full transition-all duration-500", styles.color.replace('text-', 'bg-'))}></div>
                        </div>
                    );
                })}

                {announcements.length === 0 && !isLoading && (
                    <div className="col-span-full py-32 border-8 border-gray-100 dark:border-gray-800 border-dashed flex flex-col items-center justify-center opacity-30 text-center">
                        <ArrowLeftRight size={64} className="mb-6" />
                        <h3 className="text-3xl font-black uppercase italic tracking-widest">لا توجد إعلانات مسجلة</h3>
                        <p className="font-bold text-sm mt-2">سجل الإعلانات المراقبة فارغ تماماً حالياً</p>
                    </div>
                )}
            </div>

            {/* Premium Create/Edit Modal - Brutalist Style */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in">
                    <div className="relative w-full max-w-2xl bg-white dark:bg-gray-950 border-8 border-gray-950 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-8 bg-gray-950 text-white flex items-center justify-between border-b-8 border-gray-950">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-600 flex items-center justify-center border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                                    <Megaphone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-tighter italic">
                                        {editingAnnouncement ? 'تحديث التعميم' : 'إصدار تعميم جديد'}
                                    </h3>
                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Announcement Editor v2.0</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-rose-600 transition-all"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic"><LayoutGrid size={14}/> عنوان الإعلان (Master Title)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 border-4 border-gray-950 font-black text-lg outline-none focus:bg-white focus:border-primary-600 transition-all"
                                    placeholder="اكتب عنواناً يفرض حضوراً قوياً..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2"><ArrowLeftRight size={14}/> الفئة (Categorization)</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-4 border-gray-950 font-black text-xs uppercase outline-none focus:bg-white focus:border-primary-600 transition-all cursor-pointer"
                                    >
                                        <option value="general">عام (Public Info)</option>
                                        <option value="urgent">عاجل (Critical Alert)</option>
                                        <option value="holiday">إجازة (Calendar Event)</option>
                                        <option value="event">نشاط (Academy Activity)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2"><CheckCircle2 size={14}/> حالة النشر (Visibility)</label>
                                    <div className="flex gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: true})}
                                            className={cn(
                                                "flex-1 py-4 border-4 border-gray-950 font-black text-[10px] uppercase transition-all shadow-[4px_4px_0px_0px_black]",
                                                formData.isActive ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-300"
                                            )}
                                        >
                                            نشـط (Online)
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: false})}
                                            className={cn(
                                                "flex-1 py-4 border-4 border-gray-950 font-black text-[10px] uppercase transition-all shadow-[4px_4px_0px_0px_black]",
                                                !formData.isActive ? "bg-amber-500 text-white" : "bg-gray-50 text-gray-300"
                                            )}
                                        >
                                            مسـودة (Draft)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2"><Edit3 size={14}/> المحتوى (Core Message)</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 border-4 border-gray-950 font-bold text-sm resize-none outline-none focus:bg-white focus:border-primary-600 transition-all leading-relaxed italic"
                                    placeholder="اكتب تفاصيل الإعلان هنا بلهجة واثقة ومباشرة..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-6 bg-primary-600 text-white font-black text-sm uppercase tracking-[0.3em] hover:bg-black transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-4 group"
                            >
                                <CheckCircle2 size={24} className="group-hover:scale-125 transition-transform" />
                                {editingAnnouncement ? 'مزامنة التعديلات الآن' : 'بث الإعلان لكافة المشتركين'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
