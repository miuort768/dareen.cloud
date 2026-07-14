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
import { confirm } from '../lib/confirmDialog';
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
        if (!await confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
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

    const getTypeMeta = (type: string) => {
        switch (type) {
            case 'urgent': return { icon: AlertTriangle, label: 'عاجل' };
            case 'holiday': return { icon: Calendar, label: 'إجازة' };
            case 'event': return { icon: Megaphone, label: 'فعالية' };
            default: return { icon: Info, label: 'عام' };
        }
    };

    const typeColorClasses = (type: string, variant: 'bg' | 'text' | 'badge') => {
        switch (type) {
            case 'urgent': return variant === 'bg' ? 'bg-error-soft' : variant === 'text' ? 'text-error' : 'bg-error-soft text-error';
            case 'holiday': return variant === 'bg' ? 'bg-warning-soft' : variant === 'text' ? 'text-warning' : 'bg-warning-soft text-warning';
            case 'event': return variant === 'bg' ? 'bg-info-soft' : variant === 'text' ? 'text-info' : 'bg-info-soft text-info';
            default: return variant === 'bg' ? 'bg-background' : variant === 'text' ? 'text-muted' : 'bg-background text-muted';
        }
    };

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2">
            
            <div className="bg-card rounded-2xl shadow-sm border border-border px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-info-soft text-info flex items-center justify-center shrink-0">
                        <Megaphone size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-main leading-tight">الإعلانات</h1>
                        <p className="text-xs font-bold text-muted mt-0.5">إدارة الإعلانات والتنبيهات</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-info-soft text-info">
                        <span className="text-sm font-black leading-none">{announcements.filter(a => a.isActive).length}</span>
                        <span className="text-micro font-bold leading-none">نشط</span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAnnouncement(null);
                            setFormData({ title: '', content: '', type: 'general', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="bg-primary text-on-primary h-10 px-4 flex items-center justify-center gap-2 hover:bg-primary-hover transition-all font-bold shadow-sm active:scale-95 rounded-xl"
                    >
                        <Plus size={16} />
                        <span className="text-micro font-bold">إضافة إعلان</span>
                    </button>
                </div>
            </div>

            {/* ??????????????? ANNOUNCEMENTS GRID ??????????????? */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {announcements.map((ann) => {
                    const meta = getTypeMeta(ann.type);
                    const Icon = meta.icon;
                    return (
                        <div 
                            key={ann.id} 
                            className={cn(
                                "bg-card border border-border rounded-2xl p-4 md:p-5 transition-all duration-300 hover:shadow-sm relative flex flex-col",
                                !ann.isActive && "opacity-60 grayscale border-dashed"
                            )}
                        >
                            <div className="flex-1 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", typeColorClasses(ann.type, 'bg'))}>
                                            <Icon size={18} className={typeColorClasses(ann.type, 'text')} />
                                        </div>
                                        <div>
                                            <span className={cn("text-micro font-bold inline-flex items-center px-2 py-0.5 rounded-lg mb-0.5", typeColorClasses(ann.type, 'badge'))}>{meta.label}</span>
                                            <p className="font-bold text-micro text-muted">{format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => openEdit(ann)}
                                            aria-label="تعديل الإعلان"
                                            className="w-7 h-7 bg-surface dark:bg-card text-muted flex items-center justify-center border border-border hover:bg-primary hover:text-on-primary transition-all shadow-sm rounded-xl active:scale-90"
                                        >
                                            <Edit3 size={12} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ann.id)}
                                            aria-label="حذف الإعلان"
                                            className="w-7 h-7 bg-surface dark:bg-card text-error flex items-center justify-center border border-border hover:bg-error hover:text-on-error transition-all shadow-sm rounded-xl active:scale-90"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 md:space-y-3">
                                    <h3 className="text-sm md:text-base font-bold text-main leading-tight">{ann.title}</h3>
                                    <p className="text-muted font-bold text-micro md:text-xs leading-relaxed line-clamp-4 border-s-2 border-border ps-2 md:ps-3">
                                        {ann.content}
                                    </p>
                                </div>
                            </div>

                            {!ann.isActive && (
                                <div className="mt-5 pt-3 border-t border-dashed border-border">
                                    <span className="text-micro font-bold text-warning-dark dark:text-warning flex items-center gap-1.5">
                                        <Info size={10} /> غير نشط
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {announcements.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 bg-card border border-dashed border-border flex flex-col items-center justify-center text-center rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-info-soft text-info flex items-center justify-center mx-auto mb-3">
                            <ArrowLeftRight size={22} />
                        </div>
                        <h3 className="text-sm font-bold text-muted">لا توجد إعلانات بعد</h3>
                    </div>
                )}
            </div>

            {/* ??????????????? PREMIUM EDIT MODAL ??????????????? */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/60">
                    <div className="relative w-full max-w-lg bg-card border border-border shadow-sm rounded-2xl">
                        <div className="p-5 bg-primary text-on-primary flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <Megaphone size={18} className="text-on-primary/70" />
                                <h3 className="font-bold text-xs">
                                    {editingAnnouncement ? 'تعديل الإعلان الحالي' : 'إضافة إعلان جديد'}
                                </h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/10 hover:bg-error transition-all" aria-label="إغلاق"><X size={16} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-micro font-bold text-muted mb-1.5">عنوان الإعلان / النبأ</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface dark:bg-card border border-border font-bold text-xs rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-focus text-main transition-all placeholder:text-dim"
                                    placeholder="أدخل عنوان الإعلان..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-micro font-bold text-muted mb-1.5">نوع الإعلان</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                                        className="w-full px-4 py-3 bg-surface dark:bg-card border border-border font-bold text-xs rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-focus text-main transition-all cursor-pointer"
                                    >
                                        <option value="general">عام</option>
                                        <option value="urgent">عاجل</option>
                                        <option value="holiday">إجازة</option>
                                        <option value="event">فعالية</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-micro font-bold text-muted mb-1.5">حالة النشر</label>
                                    <div className="flex gap-1 h-11">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: true})}
                                            className={cn(
                                                "flex-1 font-bold text-micro rounded-xl transition-all active:scale-95",
                                                formData.isActive ? "bg-success text-on-success shadow-sm" : "bg-surface dark:bg-card text-dim dark:text-muted"
                                            )}
                                        >
                                            نشط
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: false})}
                                            className={cn(
                                                "flex-1 font-bold text-micro rounded-xl transition-all active:scale-95",
                                                !formData.isActive ? "bg-warning text-on-warning shadow-sm" : "bg-surface dark:bg-card text-dim dark:text-muted"
                                            )}
                                        >
                                            مخفي
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-micro font-bold text-muted mb-1.5">محتوى الإعلان</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface dark:bg-card border border-border font-bold text-xs rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-focus text-main transition-all leading-relaxed resize-none placeholder:text-dim"
                                    placeholder="أكتب محتوى الإعلان هنا..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-primary text-on-primary font-bold text-xs hover:bg-primary-hover transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 rounded-xl"
                            >
                                <CheckCircle2 size={16} />
                                {editingAnnouncement ? 'حفظ التعديلات' : 'نشر الإعلان'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};
