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
                showNotification('�� ����� ������� �����', 'success');
            } else {
                await api.post('/announcements', payload);
                showNotification('�� ��� ������� �����', 'success');
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

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'urgent': return { 
                icon: AlertTriangle, 
                color: '#F43F5E', 
                label: 'عاجل' 
            };
            case 'holiday': return { 
                icon: Calendar, 
                color: '#F59E0B', 
                label: 'إجازة' 
            };
            case 'event': return { 
                icon: Megaphone, 
                color: '#2563EB', 
                label: 'فعالية' 
            };
            default: return { 
                icon: Info, 
                color: '#64748B', 
                label: 'عام' 
            };
        }
    };

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-[1600px] mx-auto px-2">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#2563EB12' }}>
                        <Megaphone size={22} style={{ color: '#2563EB' }} />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">الإعلانات</h1>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">إدارة الإعلانات والتنبيهات</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#2563EB12', color: '#2563EB' }}>
                        <span className="text-sm font-black leading-none">{announcements.filter(a => a.isActive).length}</span>
                        <span className="text-[8px] font-bold leading-none">نشط</span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAnnouncement(null);
                            setFormData({ title: '', content: '', type: 'general', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="bg-[#2563EB] text-white h-10 px-4 flex items-center justify-center gap-2 hover:bg-[#1d4ed8] transition-all font-bold shadow-sm active:scale-95 rounded-xl"
                    >
                        <Plus size={16} />
                        <span className="text-[10px] font-bold">إضافة إعلان</span>
                    </button>
                </div>
            </div>

            {/* ??????????????? ANNOUNCEMENTS GRID ??????????????? */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {announcements.map((ann) => {
                    const styles = getTypeStyles(ann.type);
                    return (
                        <div 
                            key={ann.id} 
                            className={cn(
                                "bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl p-4 md:p-5 transition-all duration-300 hover:shadow-sm relative flex flex-col",
                                !ann.isActive && "opacity-60 grayscale border-dashed"
                            )}
                        >
                            <div className="flex-1 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${styles.color}12` }}>
                                            <styles.icon size={18} style={{ color: styles.color }} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold inline-flex items-center px-2 py-0.5 rounded-lg mb-0.5" style={{ backgroundColor: `${styles.color}12`, color: styles.color }}>{styles.label}</span>
                                            <p className="font-bold text-[9px] text-slate-400">{format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => openEdit(ann)}
                                            className="w-7 h-7 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-[#2563EB] hover:text-white transition-all shadow-sm rounded-xl active:scale-90"
                                        >
                                            <Edit3 size={12} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ann.id)}
                                            className="w-7 h-7 bg-slate-50 dark:bg-slate-800 text-rose-600 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-rose-600 hover:text-white transition-all shadow-sm rounded-xl active:scale-90"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 md:space-y-3">
                                    <h3 className="text-sm md:text-[17px] font-bold text-slate-900 dark:text-white leading-tight">{ann.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] md:text-[11px] leading-relaxed line-clamp-4 border-r-2 border-slate-100/50 dark:border-slate-800/50 pr-2 md:pr-3">
                                        {ann.content}
                                    </p>
                                </div>
                            </div>

                            {!ann.isActive && (
                                <div className="mt-5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                                    <span className="text-[7px] font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                                        <Info size={10} /> غير نشط
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {announcements.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center rounded-2xl">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#2563EB12' }}>
                            <ArrowLeftRight size={22} style={{ color: '#2563EB' }} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-400">لا توجد إعلانات بعد</h3>
                    </div>
                )}
            </div>

            {/* ??????????????? PREMIUM EDIT MODAL ??????????????? */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60">
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl">
                        <div className="p-5 bg-[#172554] text-white flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <Megaphone size={18} style={{ color: '#60A5FA' }} />
                                <h3 className="font-bold text-xs">
                                    {editingAnnouncement ? 'تعديل الإعلان الحالي' : 'إضافة إعلان جديد'}
                                </h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/10 hover:bg-rose-500 transition-all" aria-label="إغلاق"><X size={16} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">عنوان الإعلان / النبأ</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl outline-none focus:border-[#2563EB] dark:text-white transition-all"
                                    placeholder="أدخل عنوان الإعلان..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">نوع الإعلان</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl outline-none focus:border-[#2563EB] dark:text-white transition-all cursor-pointer"
                                    >
                                        <option value="general">عام</option>
                                        <option value="urgent">عاجل</option>
                                        <option value="holiday">إجازة</option>
                                        <option value="event">فعالية</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">حالة النشر</label>
                                    <div className="flex gap-1 h-11">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: true})}
                                            className={cn(
                                                "flex-1 font-bold text-[10px] rounded-xl transition-all active:scale-95",
                                                formData.isActive ? "bg-[#10B981] text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}
                                        >
                                            نشط
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isActive: false})}
                                            className={cn(
                                                "flex-1 font-bold text-[10px] rounded-xl transition-all active:scale-95",
                                                !formData.isActive ? "bg-[#F59E0B] text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}
                                        >
                                            مخفي
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">محتوى الإعلان</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl outline-none focus:border-[#2563EB] dark:text-white transition-all leading-relaxed resize-none"
                                    placeholder="أكتب محتوى الإعلان هنا..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-[#2563EB] text-white font-bold text-xs hover:bg-[#1d4ed8] transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 rounded-xl"
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
