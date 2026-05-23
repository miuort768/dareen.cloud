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
import { useShowNotification } from '../context/AppContext';
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
    const showNotification = useShowNotification();
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
        } catch {
            showNotification('فشل حفظ الإعلان', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        try {
            await api.delete(`/announcements/${id}`);
            showNotification('تم حذف الإعلان', 'success');
            fetchAnnouncements();
        } catch {
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
                label: 'تنبيـه عاجـل' 
            };
            case 'holiday': return { 
                icon: Calendar, 
                color: 'text-amber-600', 
                label: 'إجـازة رسميـة' 
            };
            case 'event': return { 
                icon: Megaphone, 
                color: 'text-indigo-600', 
                label: 'فعاليـة جديـدة' 
            };
            default: return { 
                icon: Info, 
                color: 'text-primary-600', 
                label: 'إعـلان عـام' 
            };
        }
    };

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20 font-sans" dir="rtl">
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-2">
            
            {/* ═══════════════ PREMIUM ANNOUNCEMENTS HEADER ═══════════════ */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-none shadow-sm shadow-indigo-500/15 border border-white/5 px-6 md:px-8 py-6">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-primary-500 to-indigo-600 p-0.5 shadow-sm">
                            <div className="w-full h-full bg-slate-900/40  flex items-center justify-center border border-white/20">
                                <Megaphone size={18} className="text-white md:size-[24px]" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-white/10  text-white text-[8px] font-normal uppercase tracking-widest border border-white/10 italic leading-none">وحدة التحكم المركزية</span>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-emerald-500 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                                </div>
                            </div>
                            <h1 className="text-base md:text-2xl font-medium text-white italic tracking-tight uppercase leading-none">النشرة والتعميمات</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="bg-white/5 border border-white/10 px-3 py-2 flex items-center gap-2  shrink-0">
                            <span className="text-lg md:text-xl font-medium text-white leading-none">{announcements.filter(a => a.isActive).length}</span>
                            <span className="text-[6px] md:text-[7px] font-medium text-slate-400 uppercase tracking-widest leading-none border-r border-white/10 pr-2 md:pr-3">نشطة<br/>بالمنصـة</span>
                        </div>
                        <button
                            onClick={() => {
                                setEditingAnnouncement(null);
                                setFormData({ title: '', content: '', type: 'general', isActive: true });
                                setIsModalOpen(true);
                            }}
                            className="bg-primary-600 text-white h-10 md:h-12 px-2 flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 hover:bg-white hover:text-primary-600 transition-all font-medium shadow-sm group"
                        >
                            <Plus size={16} className="md:size-[18px] group-hover:rotate-90 transition-transform" />
                            <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-medium">إصدار تعميم</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════════ ANNOUNCEMENTS GRID ═══════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {announcements.map((ann) => {
                    const styles = getTypeStyles(ann.type);
                    return (
                        <div 
                            key={ann.id} 
                            className={cn(
                                "group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none p-4 md:p-5 transition-all duration-300 hover:shadow-sm relative flex flex-col",
                                !ann.isActive && "opacity-60 grayscale border-dashed"
                            )}
                        >
                            <div className={cn("absolute top-0 right-0 w-1 h-10 bg-gradient-to-b", ann.type === 'urgent' ? 'from-rose-500' : 'from-primary-600')} />

                            <div className="flex-1 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-9 h-9 flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors", styles.color)}>
                                            <styles.icon size={18} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <span className={cn("text-[7px] font-medium uppercase tracking-widest italic block mb-0.5", styles.color)}>{styles.label}</span>
                                            <p className="font-normal text-[9px] uppercase text-slate-400">{format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => openEdit(ann)}
                                            className="w-7 h-7 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Edit3 size={12} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ann.id)}
                                            className="w-7 h-7 bg-slate-50 dark:bg-slate-800 text-rose-600 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 md:space-y-3">
                                    <h3 className="text-sm md:text-[17px] font-medium text-slate-900 dark:text-white leading-tight italic tracking-tight uppercase group-hover:text-primary-600 transition-colors">{ann.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] md:text-[11px] leading-relaxed line-clamp-4 border-r-2 border-slate-100 dark:border-slate-800 pr-2 md:pr-3 italic">
                                        {ann.content}
                                    </p>
                                </div>
                            </div>

                            {!ann.isActive && (
                                <div className="mt-5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                                    <span className="text-[7px] font-medium text-amber-600 dark:text-amber-500 uppercase italic flex items-center gap-1.5">
                                        <Info size={10} /> مسودة قيد المراجعة
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {announcements.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center opacity-30 text-center">
                        <ArrowLeftRight size={40} className="mb-4 text-slate-400" />
                        <h3 className="text-lg font-medium uppercase italic tracking-widest text-slate-500">سجل الإعلانات فارغ</h3>
                    </div>
                )}
            </div>

            {/* ═══════════════ PREMIUM EDIT MODAL ═══════════════ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4  bg-slate-950/60 md:animate-in md:fade-in md:duration-300">
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-white/10 shadow-sm overflow-hidden rounded-none">
                        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <Megaphone className="text-primary-500" size={18} />
                                <h3 className="font-medium text-xs uppercase italic tracking-tight">
                                    {editingAnnouncement ? 'تحديث البيانات المركزية' : 'إصدار تعميم إداري جديد'}
                                </h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-rose-500 transition-all"><X size={16} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest italic leading-none mb-1">اسم التعميم / العنوان</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs outline-none focus:ring-2 ring-primary-500 rounded-none dark:text-white transition-all"
                                    placeholder="أدخل عنوان الإعلان..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest italic leading-none mb-1">تصنيف البيانات</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none font-medium text-[10px] uppercase outline-none focus:ring-2 ring-primary-500 rounded-none dark:text-white transition-all cursor-pointer"
                                    >
                                        <option value="general">إعـلان عـام</option>
                                        <option value="urgent">تنبيـه عـاجل</option>
                                        <option value="holiday">إجـازة رسميـة</option>
                                        <option value="event">فعاليـة جديـدة</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest italic leading-none mb-1">حالة النشر</label>
                                    <div className="flex gap-1 h-11">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: true})}
                                            className={cn(
                                                "flex-1 font-medium text-[8px] uppercase transition-all",
                                                formData.isActive ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}
                                        >
                                            نشر
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: false})}
                                            className={cn(
                                                "flex-1 font-medium text-[8px] uppercase transition-all",
                                                !formData.isActive ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}
                                        >
                                            مسودة
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest italic leading-none mb-1">محتوى التعميم</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs resize-none outline-none focus:ring-2 ring-primary-500 rounded-none dark:text-white transition-all leading-relaxed italic"
                                    placeholder="اكتب تفاصيل الإعلان هنا..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-slate-900 dark:bg-primary-600 text-white font-medium text-[10px] uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-primary-500 transition-all shadow-sm flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 size={18} />
                                {editingAnnouncement ? 'تحديث السجلات' : 'بث الإعلان'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};
